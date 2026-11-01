import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { fetchLeaderboard, isSupabaseConfigured, type LeaderboardEntry } from '../lib/supabase';
import { BearMascot } from './BearMascot';
import { playPopSound } from '../lib/sound';

export default function LeaderboardModal() {
  const { showLeaderboard, closeLeaderboard, sessionId, playerName, bearType, score, levels } =
    useGameStore();

  const totalStations = levels.length || 13;

  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isCloud, setIsCloud] = useState(isSupabaseConfigured);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchLeaderboard(100, false);
      setEntries(res.entries);
      setIsCloud(res.isCloud);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showLeaderboard) {
      loadData();
    }
  }, [showLeaderboard]);

  if (!showLeaderboard) return null;

  // Find player's rank
  const playerRankIndex = entries.findIndex(
    (e) => e.sessionId === sessionId || (playerName && e.playerName === playerName)
  );
  const playerRank = playerRankIndex >= 0 ? playerRankIndex + 1 : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-sm bg-gradient-to-b from-[#fef3c7] via-[#fde68a] to-[#fed7aa] rounded-3xl border-4 border-amber-800 shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-col max-h-[85vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 border-b-3 border-amber-800">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <div>
                <h3 className="text-base font-black text-amber-950 leading-tight">
                  Bảng Xếp Hạng
                </h3>
                <div className="flex items-center gap-1.5 text-[10px] font-bold">
                  {isCloud ? (
                    <span className="text-emerald-800 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Supabase Cloud Sync
                    </span>
                  ) : (
                    <span className="text-amber-800/80 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Phiên Workshop Local
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  playPopSound();
                  loadData();
                }}
                disabled={loading}
                className="w-8 h-8 rounded-xl bg-amber-200 border-2 border-amber-700 flex items-center justify-center text-amber-900 active:scale-95 text-xs font-bold transition-all"
                title="Làm mới"
              >
                {loading ? '⏳' : '🔄'}
              </button>
              <button
                onClick={() => {
                  playPopSound();
                  closeLeaderboard();
                }}
                className="w-8 h-8 rounded-xl bg-amber-200 border-2 border-amber-700 flex items-center justify-center text-amber-900 active:scale-95 text-sm font-black transition-all"
                title="Đóng"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Current Player Status Ribbon */}
          <div className="px-4 py-2.5 bg-white/70 border-b-2 border-amber-700/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-300 border border-amber-700 flex items-center justify-center shrink-0">
                <BearMascot type={bearType} size={28} />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
                  Bạn: {playerName || 'Người chơi ẩn danh'}
                </div>
                <div className="text-xs font-extrabold text-amber-950">
                  {playerRank ? `Đang xếp hạng #${playerRank}` : 'Chưa có lượt xếp hạng'}
                </div>
              </div>
            </div>
            <div className="bg-amber-400 text-amber-950 px-2.5 py-1 rounded-xl border border-amber-700 text-xs font-black shadow-sm">
              {score} điểm
            </div>
          </div>

          {/* Ranking List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
            {loading && entries.length === 0 ? (
              <div className="py-12 text-center text-amber-900 font-bold text-sm">
                <span className="text-2xl block mb-2 animate-bounce">🐾</span>
                Đang tải dữ liệu điểm số...
              </div>
            ) : entries.length === 0 ? (
              <div className="py-12 text-center text-amber-900 font-bold text-sm">
                <span className="text-2xl block mb-2">🌿</span>
                Chưa có dữ liệu người chơi. Hãy là người đầu tiên ghi danh!
              </div>
            ) : (
              entries.map((item, idx) => {
                const rankNumber = idx + 1;
                const isCurrentPlayer =
                  item.sessionId === sessionId || (Boolean(playerName) && item.playerName === playerName);

                let medal = '';
                let rankBg = 'bg-white/80 border-amber-200';
                if (rankNumber === 1) {
                  medal = '🥇';
                  rankBg = 'bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 border-amber-500 shadow-sm';
                } else if (rankNumber === 2) {
                  medal = '🥈';
                  rankBg = 'bg-gradient-to-r from-slate-200 via-gray-100 to-slate-200 border-slate-400';
                } else if (rankNumber === 3) {
                  medal = '🥉';
                  rankBg = 'bg-gradient-to-r from-orange-200 via-amber-100 to-orange-200 border-orange-400';
                }

                if (isCurrentPlayer) {
                  rankBg += ' ring-2 ring-emerald-500 border-emerald-600';
                }

                return (
                  <motion.div
                    key={`${item.sessionId}-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border-2 transition-all ${rankBg}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Rank Position */}
                      <div className="w-7 text-center shrink-0">
                        {medal ? (
                          <span className="text-lg leading-none">{medal}</span>
                        ) : (
                          <span className="font-black text-amber-900 text-xs">
                            #{rankNumber}
                          </span>
                        )}
                      </div>

                      {/* Bear Mascot */}
                      <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
                        <BearMascot type={item.bearType} size={28} />
                      </div>

                      {/* Name & Stations */}
                      <div className="min-w-0">
                        <div className="text-xs font-black text-amber-950 truncate flex items-center gap-1.5">
                          <span>{item.playerName}</span>
                          {isCurrentPlayer && (
                            <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                              Bạn
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-amber-800/70 font-semibold">
                          Hoàn thành {item.completedLevelsCount}/{totalStations} trạm
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right shrink-0 pl-2">
                      <div className="text-sm font-black text-amber-900">
                        {item.score}
                      </div>
                      <div className="text-[9px] font-bold text-amber-700/60 uppercase">
                        điểm
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="p-3 bg-amber-100/90 border-t-2 border-amber-700/20 text-center">
            <p className="text-[10px] font-semibold text-amber-900/70">
              💡 Bảng điểm được đồng bộ tức thì theo phiên chơi (Session)
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

