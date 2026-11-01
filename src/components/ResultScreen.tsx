import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { BearMascot } from './BearMascot';
import { playFanfareSound, playPopSound } from '../lib/sound';

export default function ResultScreen() {
  const {
    score,
    completedLevels,
    bearType,
    playerName,
    restartGame,
    openLeaderboard,
    isSyncing,
    syncSuccess,
    levels,
  } = useGameStore();

  useEffect(() => {
    playFanfareSound();
  }, []);

  const totalLevels = levels.length || 13;
  // Điểm tối đa mỗi level: 100 (cơ bản) + 60 (tốc độ tối đa) + 33 (đúng lần 1) + 23 (không gợi ý) = 216
  const maxScore = totalLevels * 216;
  const percentage = Math.min(100, Math.round((score / maxScore) * 100));

  const getRank = () => {
    if (percentage >= 85) {
      return {
        badge: '🏆',
        title: 'Đại Sứ Bảo Tồn Rừng Xanh',
        desc: 'Bạn đã nắm vững toàn bộ kiến thức bảo vệ loài gấu!',
        color: 'from-amber-400 to-yellow-500',
        textColor: 'text-amber-950',
      };
    }
    if (percentage >= 65) {
      return {
        badge: '🥇',
        title: 'Hiệp Sĩ Gấu Quả Cảm',
        desc: 'Hành trình xuất sắc! Rất nhiều gấu đã được bạn tiếp sức.',
        color: 'from-emerald-400 to-teal-500',
        textColor: 'text-emerald-950',
      };
    }
    if (percentage >= 40) {
      return {
        badge: '🥈',
        title: 'Người Bạn Đồng Hành',
        desc: 'Bạn đã hoàn thành chặng đường và hiểu hơn về các bạn gấu.',
        color: 'from-sky-400 to-blue-500',
        textColor: 'text-sky-950',
      };
    }
    return {
      badge: '🥉',
      title: 'Mầm Xanh Bảo Tồn',
      desc: 'Hãy thử lại một lần nữa để đạt điểm số kỷ lục nhé!',
      color: 'from-orange-300 to-amber-500',
      textColor: 'text-amber-950',
    };
  };

  const rank = getRank();
  const bearName = bearType === 'sunbear' ? 'Gấu Chó' : 'Gấu Ngựa';

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#fef3c7] via-[#ecfdf5] to-[#d1fae5] overflow-y-auto no-scrollbar select-none">
      {/* Hero / Rank Section */}
      <div className="flex flex-col items-center pt-6 pb-2 px-4 text-center relative overflow-hidden">
        {/* Floating sparkles */}
        {['🌟', '✨', '🎉', '🐾', '🌿', '⭐'].map((e, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 0],
              y: [-10, -70],
              x: [(i % 2 === 0 ? -1 : 1) * (15 + i * 15)],
            }}
            transition={{ delay: i * 0.15, duration: 2.2, repeat: Infinity, repeatDelay: 2 }}
            className="absolute top-6 text-xl pointer-events-none"
          >
            {e}
          </motion.span>
        ))}

        {/* Mascot Avatar with Trophy */}
        <div className="relative mb-3">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            className="w-28 h-28 rounded-3xl bg-amber-400 border-4 border-amber-800 shadow-[0_6px_0_#78350f] p-2 relative flex items-center justify-center bear-wobble"
          >
            <BearMascot type={bearType} />
            <div className="absolute -bottom-2 -right-2 text-3xl drop-shadow">
              {rank.badge}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-block px-3 py-1 bg-amber-800 text-amber-100 rounded-full font-black text-xs uppercase tracking-wider shadow-sm mb-1">
            Tổng kết chuyến đi
          </div>
          <h2 className="text-2xl font-black text-amber-950">
            {rank.title}
          </h2>
          <p className="text-xs font-bold text-amber-900/70 mt-0.5">
            {playerName ? `Chúc mừng ${playerName}!` : 'Chúc mừng bạn!'} {rank.desc}
          </p>
        </motion.div>
      </div>

      {/* Score Summary Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="mx-4 my-2 p-4 rounded-3xl bg-white border-3 border-amber-800/20 shadow-md"
      >
        <div className="text-center mb-3">
          <div className="text-5xl font-black text-amber-600 tracking-tight">
            {score}
          </div>
          <div className="text-amber-900/60 font-black text-xs uppercase tracking-wider">
            Điểm đạt được / {maxScore} tối đa
          </div>
        </div>

        {/* Completion Progress Bar */}
        <div className="h-4 rounded-full bg-amber-100 border-2 border-amber-300 overflow-hidden p-0.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-500"
          />
        </div>
        <div className="text-amber-800/70 text-xs font-bold text-center mt-1">
          Hoàn thành {percentage}% thử thách
        </div>

        {/* 3 mini stats */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-amber-100">
          <div className="text-center p-2 rounded-2xl bg-amber-50 border border-amber-200">
            <div className="text-xl">🏁</div>
            <div className="text-amber-950 font-black text-sm">{completedLevels.length}/{totalLevels}</div>
            <div className="text-[10px] text-amber-800 font-bold">Trạm giải mã</div>
          </div>
          <div className="text-center p-2 rounded-2xl bg-emerald-50 border border-emerald-200">
            <div className="text-xl">🐾</div>
            <div className="text-emerald-950 font-black text-sm">{bearName}</div>
            <div className="text-[10px] text-emerald-800 font-bold">Bạn đồng hành</div>
          </div>
          <div className="text-center p-2 rounded-2xl bg-sky-50 border border-sky-200">
            <div className="text-xl">🌟</div>
            <div className="text-sky-950 font-black text-sm">Top 5%</div>
            <div className="text-[10px] text-sky-800 font-bold">Hạng bảo tồn</div>
          </div>
        </div>
      </motion.div>

      {/* Conservation Action Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="mx-4 mb-3 p-4 rounded-2xl bg-emerald-100 border-2 border-emerald-400 shadow-sm text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <span className="text-xl">🌿</span>
          <span className="font-black text-xs text-emerald-900 uppercase tracking-wider">
            Thông điệp bảo tồn
          </span>
        </div>
        <p className="text-xs text-emerald-950 font-bold leading-relaxed">
          Gấu thuộc về rừng xanh tự nhiên. Hãy cùng nhau nói không với mật gấu và bảo vệ môi trường sống cho loài gấu!
        </p>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="px-4 pb-6 mt-auto flex flex-col gap-2"
      >
        {/* Sync status */}
        <div className="text-center text-[11px] font-bold text-emerald-800">
          {isSyncing ? (
            <span className="flex items-center justify-center gap-1">
              <span className="animate-spin">⏳</span> Đang lưu điểm lên bảng xếp hạng...
            </span>
          ) : syncSuccess ? (
            <span className="text-emerald-700">✓ Điểm số đã được ghi nhận vào Bảng Xếp Hạng!</span>
          ) : (
            <span className="text-amber-800">💡 Điểm đã lưu trong phiên chơi của bạn</span>
          )}
        </div>

        {/* View Leaderboard Button */}
        <button
          onClick={() => {
            playPopSound();
            openLeaderboard();
          }}
          className="btn-pop w-full py-3 rounded-2xl bg-amber-400 text-amber-950 text-sm font-black border-2 border-amber-800 shadow-[0_3px_0_#78350f] flex items-center justify-center gap-2"
        >
          <span>🏆</span>
          <span>Xem Bảng Xếp Hạng Sự Kiện</span>
        </button>

        <button
          onClick={() => {
            playPopSound();
            restartGame();
          }}
          className="btn-pop w-full py-3 rounded-2xl font-black text-sm text-white bg-emerald-600 border-2 border-emerald-900 shadow-[0_3px_0_#064e3b] flex items-center justify-center gap-2"
        >
          <span>🔄</span>
          <span>Chơi Lại Từ Đầu</span>
        </button>
      </motion.div>
    </div>
  );
}
