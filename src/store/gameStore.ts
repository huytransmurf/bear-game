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
  goToMap: () => void;
  openLeaderboard: () => void;
  closeLeaderboard: () => void;
  syncScore: () => Promise<void>;
}

// Built-in initial levels (hoàn toàn độc lập, không cần file JSON cục bộ)
export const DEFAULT_LEVELS: Level[] = [
  {
    id: 1,
    question: 'Loài gấu nhỏ nhất thế giới, sống ở rừng nhiệt đới Đông Nam Á, có chiếc lưỡi dài để lấy mật ong?',
    answer: 'GAUCHO',
    displayAnswer: 'Gấu chó',
    hint: 'Tên loài có 6 chữ cái, bắt đầu bằng G',
    fact: 'Gấu chó (Sun Bear) là loài gấu nhỏ nhất thế giới, nặng chỉ 25–65 kg. Chúng có lưỡi dài đến 25 cm để lấy mật ong và côn trùng trong các khe cây. Hiện là loài dễ bị tổn thương (Vulnerable) theo IUCN.',
    source: 'IUCN Red List – Helarctos malayanus',
    distractors: ['GAMRUNG', 'GAUBAC', 'RUNG'],
    stationTitle: 'Tổ Ong Rừng',
    stationSubtitle: 'Khám phá loài Gấu Chó nhỏ nhất thế giới',
    themeIcon: '🍯',
    badge: 'Chặng 1',
  },
  {
    id: 2,
    question: 'Loài gấu đen châu Á, có mảng lông trắng hình chữ V hoặc chữ U đặc trưng trên ngực?',
    answer: 'GAUNGUA',
    displayAnswer: 'Gấu ngựa',
    hint: 'Tên loài có 7 chữ cái, thường thấy ở vùng núi Việt Nam',
    fact: 'Gấu ngựa (Asiatic Black Bear) có thể leo cây rất giỏi. Ở Việt Nam, chúng từng phổ biến ở nhiều vùng rừng núi, nhưng hiện đang bị đe dọa nghiêm trọng do săn bắt trái phép và khai thác mật gấu.',
    source: 'WWF – Ursus thibetanus',
    distractors: ['DENRUNG', 'MATKONG', 'CHAU'],
    stationTitle: 'Rừng Khộp Núi Cao',
    stationSubtitle: 'Gấu Ngựa dũng mãnh và biệt tài leo cây',
    themeIcon: '🌲',
    badge: 'Chặng 2',
  },
  {
    id: 3,
    question: 'Thứ gì được lấy từ gấu nuôi nhốt, gây đau đớn tột cùng và bị cấm theo pháp luật Việt Nam?',
    answer: 'MAT',
    displayAnswer: 'Mật',
    hint: '3 chữ cái, là chất lỏng vàng quý giá',
    fact: 'Nuôi nhốt gấu lấy mật là hành vi bị cấm hoàn toàn tại Việt Nam theo Nghị định 06/2019/NĐ-CP. Việc chích hút mật gây đau đớn kinh khủng và nhiễm trùng mãn tính cho gấu. Tổ chức Animals Asia đang giải cứu hàng trăm cá thể gấu tại Việt Nam.',
    source: 'Animals Asia Foundation – Việt Nam',
    distractors: ['NUOI', 'LONG', 'CAM'],
    stationTitle: 'Suối Nước Tự Do',
    stationSubtitle: 'Nói không với nuôi nhốt hút mật tàn nhẫn',
    themeIcon: '🔓',
    badge: 'Chặng 3',
  },
  {
    id: 4,
    question: 'Nguyên nhân hàng đầu khiến gấu mất nơi sinh sống ở Việt Nam là gì?',
    answer: 'PHARUNG',
    displayAnswer: 'Phá rừng',
    hint: '7 chữ cái, hành vi tàn phá cây xanh và môi trường sống của gấu',
    fact: 'Việt Nam đã mất hơn 50% diện tích rừng tự nhiên trong nửa thế kỷ qua. Mất rừng đồng nghĩa với mất sinh cảnh của gấu và hàng nghìn loài khác. Trồng lại rừng và bảo vệ rừng nguyên sinh là chìa khóa bảo tồn.',
    source: 'WWF Việt Nam – Báo cáo hiện trạng rừng 2023',
    distractors: ['BUON', 'BAN', 'THIEU'],
    stationTitle: 'Đồi Mầm Tái Sinh',
    stationSubtitle: 'Bảo vệ mái nhà rừng xanh trước nạn chặt phá',
    themeIcon: '🌱',
    badge: 'Chặng 4',
  },
  {
    id: 5,
    question: 'Hành động đúng đắn khi bạn phát hiện hành vi buôn bán hoặc nuôi nhốt gấu trái phép?',
    answer: 'BAOCAO',
    displayAnswer: 'Báo cáo',
    hint: '6 chữ cái, bắt đầu bằng B',
    fact: 'Khi phát hiện buôn bán động vật hoang dã, hãy gọi đường dây nóng: Kiểm lâm – 1800 599 954 (miễn phí). Bạn cũng có thể báo qua ứng dụng iNaturalist hoặc liên hệ ENV (Education for Nature Vietnam).',
    source: 'ENV – Education for Nature Vietnam',
    distractors: ['TRON', 'LANG', 'IM'],
    stationTitle: 'Trạm Kiểm Lâm Rừng',
    stationSubtitle: 'Gọi ngay đường dây nóng 1800 599 954',
    themeIcon: '📢',
    badge: 'Chặng 5',
  },
  {
    id: 6,
    question: 'Tổ chức quốc tế nổi tiếng đánh giá mức độ nguy cấp của các loài động vật trên toàn thế giới?',
    answer: 'IUCN',
    displayAnswer: 'IUCN',
    hint: '4 chữ cái viết tắt tiếng Anh',
    fact: 'IUCN (Liên minh Bảo tồn Thiên nhiên Quốc tế) duy trì Danh sách Đỏ – cơ sở dữ liệu toàn diện nhất về tình trạng bảo tồn sinh vật. Cả gấu chó và gấu ngựa đều nằm trong Danh sách Đỏ IUCN với mức độ "Dễ bị tổn thương".',
    source: 'iucnredlist.org',
    distractors: ['WWF', 'CITES', 'ENV'],
    stationTitle: 'Đảo Sách Đỏ',
    stationSubtitle: 'Liên minh bảo tồn thiên nhiên quốc tế IUCN',
    themeIcon: '📜',
    badge: 'Chặng 6',
  },
  {
    id: 7,
    question: 'Công ước quốc tế kiểm soát buôn bán động, thực vật hoang dã nguy cấp xuyên biên giới?',
    answer: 'CITES',
    displayAnswer: 'CITES',
    hint: '5 chữ cái viết tắt, liên quan đến thương mại quốc tế',
    fact: 'CITES (Công ước về Buôn bán Quốc tế các loài động, thực vật hoang dã nguy cấp) được 184 quốc gia ký kết. Cả hai loài gấu ở Việt Nam đều được bảo vệ theo CITES Phụ lục I – cấm buôn bán thương mại.',
    source: 'cites.org',
    distractors: ['UNEP', 'UNESCO', 'UNODC'],
    stationTitle: 'Thành Trì CITES',
    stationSubtitle: 'Công ước ngăn chặn buôn bán xuyên quốc gia',
    themeIcon: '🛡️',
    badge: 'Chặng 7',
  },
  {
    id: 8,
    question: 'Hành vi nào sau đây giúp bảo vệ gấu trực tiếp nhất: không mua sản phẩm từ động vật hoang dã?',
    answer: 'TUCHOI',
    displayAnswer: 'Từ chối',
    hint: '6 chữ cái, là hành động không chấp nhận điều gì đó',
    fact: 'Mỗi người tiêu dùng có sức mạnh thay đổi thị trường. Khi bạn từ chối mua mật gấu, cao hổ, sừng tê giác... bạn đang trực tiếp giảm nhu cầu và cứu động vật hoang dã. Hãy chia sẻ thông điệp này!',
    source: 'Four Paws International',
    distractors: ['MUALAI', 'THICUNG', 'BUON'],
    stationTitle: 'Khu Cứu Hộ Gấu',
    stationSubtitle: 'Mái nhà bình yên & tự do cho các bạn gấu',
    themeIcon: '🏆',
    badge: 'Đích Đến',
  },
];

export const LEVELS: Level[] = DEFAULT_LEVELS;

export const MAX_ATTEMPTS = 3;
export const POINTS_CORRECT = 100;
export const POINTS_NO_HINT_BONUS = 20;
export const POINTS_SPEED_FAST_BONUS = 30; // under 10 seconds
export const POINTS_SPEED_MED_BONUS = 15; // under 20 seconds
export const POINTS_WRONG_PENALTY = 20;

function createSessionId(): string {
  return `bear_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      sessionId: createSessionId(),
      screen: 'start',
      playerName: '',
      bearType: 'sunbear',

      levels: DEFAULT_LEVELS,
      isLoadingLevels: false,

      currentLevelIndex: 0,
      score: 0,
      attemptsLeft: MAX_ATTEMPTS,
      hintUsed: false,
      completedLevels: [],
      soundEnabled: true,
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
          set({ levels: mapped, isLoadingLevels: false });
        } else {
          set({ isLoadingLevels: false });
        }
      },

      setPlayerName: (name) => set({ playerName: name }),
      setBearType: (type) => set({ bearType: type }),

      startGame: () => {
        const newSessionId = createSessionId();
        set({
          sessionId: newSessionId,
          screen: 'map',
          currentLevelIndex: 0,
          score: 0,
          completedLevels: [],
          attemptsLeft: MAX_ATTEMPTS,
          hintUsed: false,
          lastCorrectLevel: null,
          lastEarnedPoints: 0,
          isReviewMode: false,
          levelStartTime: Date.now(),
        });
        get().syncScore();
      },

      resumeGame: () => {
        const state = get();
        if (state.screen === 'start') {
          set({ screen: 'map' });
        }
      },

      resetSession: () => {
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

      goToQuestion: () =>
        set({
          screen: 'question',
          attemptsLeft: MAX_ATTEMPTS,
          hintUsed: false,
          isReviewMode: false,
          levelStartTime: Date.now(),
        }),

      goToMap: () => set({ screen: 'map', isReviewMode: false }),

      submitAnswer: (correct) => {
        const state = get();
        const currentIdx = state.currentLevelIndex;
        const currentLevel = state.levels[currentIdx] || state.levels[0];

        if (correct) {
          // Speed bonus calculation (Kahoot-style)
          const elapsedSec = (Date.now() - (state.levelStartTime || Date.now())) / 1000;
          let speedBonus = 0;
          if (elapsedSec <= 10) {
            speedBonus = POINTS_SPEED_FAST_BONUS;
          } else if (elapsedSec <= 20) {
            speedBonus = POINTS_SPEED_MED_BONUS;
          }

          const hintBonus = state.hintUsed ? 0 : POINTS_NO_HINT_BONUS;
          const pointsEarned = POINTS_CORRECT + hintBonus + speedBonus;
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
          const newScore = Math.max(0, state.score - POINTS_WRONG_PENALTY);

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
      }),
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
