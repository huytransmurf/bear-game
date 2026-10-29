/**
 * supabase.ts
 * Supabase client and service for the Bear Game workshop/event.
 * Designed for lightweight, account-less Kahoot-style events:
 * - bear_leaderboard: Upserts scores by sessionId (no login / password required)
 * - bear_levels: Dynamic game stations & questions loaded from database instead of JSON
 * - Automatic fallback to local data if Supabase keys are not set yet
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface LeaderboardEntry {
  sessionId: string;
  playerName: string;
  bearType: 'sunbear' | 'blackbear';
  score: number;
  completedLevelsCount: number;
  updatedAt?: string;
}

export interface SupabaseLevelRow {
  id: number;
  station_order: number;
  station_title: string;
  station_subtitle: string;
  theme_icon: string;
  badge: string;
  question: string;
  answer: string;
  display_answer: string;
  hint: string;
  fact: string;
  source: string;
  distractors: string[];
  is_active?: boolean;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// Initial mock data for offline/workshop demo when Supabase is not connected
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    sessionId: 'mock_1',
    playerName: 'Lan Anh (Tình nguyện viên)',
    bearType: 'sunbear',
    score: 940,
    completedLevelsCount: 8,
    updatedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    sessionId: 'mock_2',
    playerName: 'Hoàng Nam 🍯',
    bearType: 'blackbear',
    score: 880,
    completedLevelsCount: 8,
    updatedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    sessionId: 'mock_3',
    playerName: 'Minh Trí Kiểm Lâm',
    bearType: 'blackbear',
    score: 790,
    completedLevelsCount: 7,
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    sessionId: 'mock_4',
    playerName: 'Bảo Ngọc 🌿',
    bearType: 'sunbear',
    score: 720,
    completedLevelsCount: 6,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    sessionId: 'mock_5',
    playerName: 'Bạn Gấu Nhỏ',
    bearType: 'sunbear',
    score: 650,
    completedLevelsCount: 5,
    updatedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
];

const LOCAL_STORAGE_KEY = 'bear_workshop_local_leaderboard';

function getLocalLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return MOCK_LEADERBOARD;
    return JSON.parse(raw);
  } catch {
    return MOCK_LEADERBOARD;
  }
}

function saveLocalLeaderboard(data: LeaderboardEntry[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Upsert player score to Supabase or fallback to LocalStorage.
 * Updates in-place using sessionId as the unique key.
 */
export async function syncScoreToLeaderboard(
  entry: LeaderboardEntry
): Promise<{ success: boolean; isCloud: boolean; error?: string }> {
  // Always update local storage first (ensures offline reliability)
  const currentList = getLocalLeaderboard();
  const existingIdx = currentList.findIndex((item) => item.sessionId === entry.sessionId);
  const updatedEntry = {
    ...entry,
    updatedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    currentList[existingIdx] = updatedEntry;
  } else {
    currentList.push(updatedEntry);
  }
  saveLocalLeaderboard(currentList);

  if (!isSupabaseConfigured || !supabase) {
    return { success: true, isCloud: false };
  }

  try {
    const { error } = await supabase.from('bear_leaderboard').upsert(
      {
        session_id: entry.sessionId,
        player_name: entry.playerName || 'Người chơi ẩn danh',
        bear_type: entry.bearType,
        score: entry.score,
        completed_levels_count: entry.completedLevelsCount,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'session_id' }
    );

    if (error) {
      console.warn('[Supabase Sync Error]', error.message);
      return { success: false, isCloud: true, error: error.message };
    }

    return { success: true, isCloud: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[Supabase Network Exception]', msg);
    return { success: false, isCloud: true, error: msg };
  }
}

/**
 * Fetch top leaderboard entries.
 */
export async function fetchLeaderboard(limit = 30): Promise<{
  entries: LeaderboardEntry[];
  isCloud: boolean;
}> {
  if (!isSupabaseConfigured || !supabase) {
    const local = getLocalLeaderboard()
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    return { entries: local, isCloud: false };
  }

  try {
    const { data, error } = await supabase
      .from('bear_leaderboard')
      .select('session_id, player_name, bear_type, score, completed_levels_count, updated_at')
      .order('score', { ascending: false })
      .order('updated_at', { ascending: true })
      .limit(limit);

    if (error || !data) {
      console.warn('[Supabase Fetch Error, fallback to local]', error?.message);
      const local = getLocalLeaderboard().sort((a, b) => b.score - a.score).slice(0, limit);
      return { entries: local, isCloud: false };
    }

    const formatted: LeaderboardEntry[] = data.map((row) => ({
      sessionId: row.session_id,
      playerName: row.player_name,
      bearType: row.bear_type as 'sunbear' | 'blackbear',
      score: row.score,
      completedLevelsCount: row.completed_levels_count,
      updatedAt: row.updated_at,
    }));

    return { entries: formatted, isCloud: true };
  } catch (err) {
    console.warn('[Supabase Fetch Exception, fallback to local]', err);
    const local = getLocalLeaderboard().sort((a, b) => b.score - a.score).slice(0, limit);
    return { entries: local, isCloud: false };
  }
}

/**
 * Fetch questions/stations from Supabase `bear_levels` table.
 * If Supabase is not configured or table is empty, returns null so the app falls back to local data.
 */
export async function fetchLevelsFromSupabase(): Promise<{
  levels: SupabaseLevelRow[] | null;
  isCloud: boolean;
}> {
  if (!isSupabaseConfigured || !supabase) {
    return { levels: null, isCloud: false };
  }

  try {
    const { data, error } = await supabase
      .from('bear_levels')
      .select('*')
      .eq('is_active', true)
      .order('station_order', { ascending: true });

    if (error || !data || data.length === 0) {
      console.warn('[Supabase Levels Fetch Error, fallback to local]', error?.message);
      return { levels: null, isCloud: false };
    }

    return { levels: data as SupabaseLevelRow[], isCloud: true };
  } catch (err) {
    console.warn('[Supabase Levels Exception, fallback to local]', err);
    return { levels: null, isCloud: false };
  }
}
