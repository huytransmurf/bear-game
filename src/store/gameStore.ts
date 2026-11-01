import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { syncScoreToLeaderboard, fetchLevelsFromSupabase } from '../lib/supabase';

export type Screen = 'start' | 'map' | 'question' | 'knowledge' | 'result';
export type BearType = 'sunbear' | 'blackbear';

export interface Level {
  id: number;
  question: string;
  answer: string;
  displayAnswer: string;
  hint: string;
  fact: string;
  source: string;
  distractors: string[];
  stationTitle?: string;
  stationSubtitle?: string;
  themeIcon?: string;
  badge?: string;
}

export interface GameState {
  // Session & Identity
  sessionId: string;
  lastActiveTimestamp: number;
  screen: Screen;
  playerName: string;
  bearType: BearType;

  // Levels (dynamic from Supabase)
  levels: Level[];
  isLoadingLevels: boolean;

  // Game progress
  currentLevelIndex: number;
  score: number;
  attemptsLeft: number;
  hintUsed: boolean;
  completedLevels: number[];
  soundEnabled: boolean;
  musicVolume: number; // 0.0 to 1.0
  lastCorrectLevel: Level | null;
  lastEarnedPoints: number;
  levelStartTime: number;
  isReviewMode: boolean;

  // Leaderboard & Sync
  showLeaderboard: boolean;
  isSyncing: boolean;
  syncSuccess: boolean;
  syncError: string | null;

  // Actions
  loadLevels: () => Promise<void>;
  setPlayerName: (name: string) => void;
  setBearType: (type: BearType) => void;
  startGame: () => void;
  resumeGame: () => void;
  resetSession: () => void;
  goToQuestion: () => void;
  submitAnswer: (correct: boolean) => void;
  useHint: () => void;
  closeKnowledge: () => void;
  viewLevelKnowledge: (index: number) => void;
  nextLevel: () => void;
  restartGame: () => void;
  toggleSound: () => void;
  setMusicVolume: (volume: number) => void;
  goToMap: () => void;
  openLeaderboard: () => void;
  closeLeaderboard: () => void;
  syncScore: () => Promise<void>;
}

export const MAX_ATTEMPTS = 3;
export const BASE_POINTS_CORRECT = 100;
export const MAX_SPEED_BONUS = 60; // Thưởng tốc độ tối đa cho người trả lời cực nhanh
export const SPEED_WINDOW_SECONDS = 30; // Trong vòng 30s tính bonus giảm dần
export const NO_HINT_BONUS = 23; // Thưởng nếu không xem gợi ý (số lẻ tạo độ phân tán)
export const ATTEMPT_BONUS_PER_TRY = 11; // Thưởng nếu đúng ngay lần đầu/còn nhiều lượt thử
export const WRONG_PENALTY_POINTS = 17; // Trừ điểm khi chọn sai

export const SESSION_MAX_AGE_MS = 30 * 60 * 1000; // 30 phút hết hạn phiên

function createSessionId(): string {
  return `bear_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      sessionId: createSessionId(),
      lastActiveTimestamp: Date.now(),
      screen: 'start',
      playerName: '',
      bearType: 'sunbear',

      // Levels được tải 100% từ cơ sở dữ liệu Supabase (bear_levels table)
      levels: [],
      isLoadingLevels: true,

      currentLevelIndex: 0,
      score: 0,
      attemptsLeft: MAX_ATTEMPTS,
      hintUsed: false,
      completedLevels: [],
      soundEnabled: true,
      musicVolume: 0.5,
      lastCorrectLevel: null,
      lastEarnedPoints: 0,
      levelStartTime: 0,
      isReviewMode: false,

      showLeaderboard: false,
      isSyncing: false,
      syncSuccess: false,
      syncError: null,

      loadLevels: async () => {
        set({ isLoadingLevels: true });
        try {
          const res = await fetchLevelsFromSupabase();
          if (res.levels && res.levels.length > 0) {
            const mapped: Level[] = res.levels.map((row) => ({
              id: row.id,
              question: row.question,
              answer: row.answer,
              displayAnswer: row.display_answer || row.answer,
              hint: row.hint || '',
              fact: row.fact || '',
              source: row.source || '',
              distractors: Array.isArray(row.distractors) ? row.distractors : [],
              stationTitle: row.station_title,
              stationSubtitle: row.station_subtitle,
              themeIcon: row.theme_icon,
              badge: row.badge,
            }));
            const state = get();
            const safeLevelIndex = state.currentLevelIndex >= mapped.length ? 0 : state.currentLevelIndex;
            set({ levels: mapped, currentLevelIndex: safeLevelIndex, isLoadingLevels: false });
          } else {
            set({ isLoadingLevels: false });
          }
        } catch (e) {
          console.error('[loadLevels error]', e);
          set({ isLoadingLevels: false });
        }
      },

      setPlayerName: (name) => set({ playerName: name }),
      setBearType: (type) => set({ bearType: type }),

      startGame: () => {
        const newSessionId = createSessionId();
        const now = Date.now();
        set({
          sessionId: newSessionId,
          lastActiveTimestamp: now,
          screen: 'map',
          currentLevelIndex: 0,
          score: 0,
          completedLevels: [],
          attemptsLeft: MAX_ATTEMPTS,
          hintUsed: false,
          lastCorrectLevel: null,
          lastEarnedPoints: 0,
          isReviewMode: false,
          levelStartTime: now,
        });
        get().syncScore();
      },

      resumeGame: () => {
        const state = get();
        if (state.screen === 'start') {
          set({ screen: 'map', lastActiveTimestamp: Date.now() });
        }
      },

      resetSession: () => {
        set({
          sessionId: createSessionId(),
          lastActiveTimestamp: Date.now(),
          screen: 'start',
          currentLevelIndex: 0,
          score: 0,
          completedLevels: [],
          attemptsLeft: MAX_ATTEMPTS,
          hintUsed: false,
          lastCorrectLevel: null,
          lastEarnedPoints: 0,
          isReviewMode: false,
        });
      },

      goToQuestion: () =>
        set({
          screen: 'question',
          attemptsLeft: MAX_ATTEMPTS,
          hintUsed: false,
          isReviewMode: false,
          levelStartTime: Date.now(),
          lastActiveTimestamp: Date.now(),
        }),

      goToMap: () => set({ screen: 'map', isReviewMode: false, lastActiveTimestamp: Date.now() }),

      submitAnswer: (correct) => {
        const state = get();
        const currentIdx = state.currentLevelIndex;
        const currentLevel = state.levels[currentIdx] || state.levels[0];

        if (correct) {
          // Tính thời gian hoàn thành (tính theo giây với độ chính xác số thập phân)
          const elapsedSec = Math.max(0.5, (Date.now() - (state.levelStartTime || Date.now())) / 1000);
          
          // 1. Thưởng tốc độ liên tục (Kahoot-style continuous speed bonus):
          // Nếu trả lời trong vòng 30s: điểm thưởng giảm dần theo từng giây và phần trăm giây
          // Trả lời 2.3s sẽ nhiều điểm hơn 2.8s -> tạo điểm số lẻ độc nhất, tránh trùng lặp
          const timeRatio = Math.max(0, (SPEED_WINDOW_SECONDS - elapsedSec) / SPEED_WINDOW_SECONDS);
          const rawSpeedBonus = Math.round(timeRatio * MAX_SPEED_BONUS * 10) / 10;
          const speedBonus = Math.max(3, Math.round(rawSpeedBonus)); // tối thiểu 3 điểm nếu quá 30s

          // 2. Thưởng độ chính xác (attemptsLeft):
          // Đúng ngay lần đầu (attemptsLeft = 3) được 3 * 11 = 33 điểm
          // Đúng lần hai (attemptsLeft = 2) được 2 * 11 = 22 điểm
          // Đúng lần ba (attemptsLeft = 1) được 1 * 11 = 11 điểm
          const accuracyBonus = state.attemptsLeft * ATTEMPT_BONUS_PER_TRY;

          // 3. Thưởng không xem gợi ý:
          const hintBonus = state.hintUsed ? 0 : NO_HINT_BONUS;

          // Tổng điểm vòng chơi: số điểm lẻ tự nhiên (ví dụ 100 + 47 + 33 + 23 = 203)
          const pointsEarned = BASE_POINTS_CORRECT + accuracyBonus + hintBonus + speedBonus;
          const newScore = state.score + pointsEarned;
          const newCompleted = Array.from(new Set([...state.completedLevels, currentIdx]));

          set({
            screen: 'knowledge',
            score: newScore,
            lastCorrectLevel: currentLevel,
            lastEarnedPoints: pointsEarned,
            completedLevels: newCompleted,
            isReviewMode: false,
          });

          get().syncScore();
        } else {
          const newAttempts = state.attemptsLeft - 1;
          const newScore = Math.max(0, state.score - WRONG_PENALTY_POINTS);

          if (newAttempts <= 0) {
            const newCompleted = Array.from(new Set([...state.completedLevels, currentIdx]));
            set({
              screen: 'knowledge',
              score: newScore,
              attemptsLeft: 0,
              lastCorrectLevel: currentLevel,
              lastEarnedPoints: 0,
              completedLevels: newCompleted,
              isReviewMode: false,
            });
            get().syncScore();
          } else {
            set({ attemptsLeft: newAttempts, score: newScore });
          }
        }
      },

      useHint: () => {
        if (!get().hintUsed) {
          set({ hintUsed: true });
        }
      },

      viewLevelKnowledge: (index: number) => {
        const state = get();
        if (index >= 0 && index < state.levels.length) {
          set({
            lastCorrectLevel: state.levels[index],
            screen: 'knowledge',
            isReviewMode: true,
          });
        }
      },

      closeKnowledge: () => {
        const state = get();
        if (state.isReviewMode) {
          set({ screen: 'map', isReviewMode: false });
          return;
        }

        const nextIndex = state.currentLevelIndex + 1;
        if (nextIndex >= state.levels.length) {
          set({ screen: 'result', isReviewMode: false });
          get().syncScore();
        } else {
          set({ currentLevelIndex: nextIndex, screen: 'map', isReviewMode: false });
        }
      },

      nextLevel: () => {
        const state = get();
        const nextIndex = state.currentLevelIndex + 1;
        if (nextIndex >= state.levels.length) {
          set({ screen: 'result' });
          get().syncScore();
        } else {
          set({ currentLevelIndex: nextIndex, screen: 'map' });
        }
      },

      restartGame: () => {
        set({
          sessionId: createSessionId(),
          screen: 'start',
          currentLevelIndex: 0,
          score: 0,
          completedLevels: [],
          attemptsLeft: MAX_ATTEMPTS,
          hintUsed: false,
          lastCorrectLevel: null,
          lastEarnedPoints: 0,
          isReviewMode: false,
        });
      },

      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      setMusicVolume: (volume) => set({ musicVolume: Math.max(0, Math.min(1, volume)) }),

      openLeaderboard: () => set({ showLeaderboard: true }),
      closeLeaderboard: () => set({ showLeaderboard: false }),

      syncScore: async () => {
        const state = get();
        set({ isSyncing: true, syncError: null });
        const res = await syncScoreToLeaderboard({
          sessionId: state.sessionId,
          playerName: state.playerName.trim() || 'Người chơi ẩn danh',
          bearType: state.bearType,
          score: state.score,
          completedLevelsCount: state.completedLevels.length,
        });
        set({
          isSyncing: false,
          syncSuccess: res.success,
          syncError: res.error || null,
        });
      },
    }),
    {
      name: 'bear-game-storage',
      partialize: (state) => ({
        sessionId: state.sessionId,
        lastActiveTimestamp: state.lastActiveTimestamp,
        screen: state.screen,
        playerName: state.playerName,
        bearType: state.bearType,
        currentLevelIndex: state.currentLevelIndex,
        score: state.score,
        attemptsLeft: state.attemptsLeft,
        hintUsed: state.hintUsed,
        completedLevels: state.completedLevels,
        lastCorrectLevel: state.lastCorrectLevel,
        lastEarnedPoints: state.lastEarnedPoints,
        levelStartTime: state.levelStartTime,
        soundEnabled: state.soundEnabled,
        musicVolume: state.musicVolume,
      }),
      onRehydrateStorage: () => (state) => {
        // Kiểm tra hết hạn phiên 30 phút khi khởi động lại ứng dụng
        if (state) {
          const now = Date.now();
          const lastActive = state.lastActiveTimestamp || 0;
          if (lastActive > 0 && now - lastActive > SESSION_MAX_AGE_MS) {
            // Phiên đã quá 30 phút: tự động làm mới session
            state.resetSession();
          } else {
            // Cập nhật timestamp hoạt động mới
            state.lastActiveTimestamp = now;
          }
        }
      },
    }
  )
);

// Offline-to-online auto-sync listener
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    const store = useGameStore.getState();
    if (store.completedLevels.length > 0) {
      store.syncScore();
    }
  });
}
