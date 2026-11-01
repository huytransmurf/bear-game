import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { BearMascot } from './BearMascot';
import { playCorrectSound, playPopSound } from '../lib/sound';

export default function KnowledgeCard() {
  const { lastCorrectLevel, closeKnowledge, score, bearType, lastEarnedPoints, isReviewMode } =
    useGameStore();

  useEffect(() => {
    if (!isReviewMode && lastEarnedPoints > 0) {
      playCorrectSound();
    }
  }, [isReviewMode, lastEarnedPoints]);

  if (!lastCorrectLevel) return null;

  const isSuccess = lastEarnedPoints > 0;

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#ecfdf5] via-[#d1fae5] to-[#a7f3d0] overflow-y-auto no-scrollbar select-none">
      {/* Top Confetti & Celebration Header */}
      <div className="relative pt-6 pb-2 px-4 flex flex-col items-center text-center overflow-hidden">
        {/* Floating sparkles */}
        {isSuccess &&
          ['🌟', '✨', '🎉', '⭐', '🌿'].map((e, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.5 }}
              animate={{
                opacity: [0, 1, 0],
                y: [-10, -50],
                scale: [0.5, 1.2, 0.8],
              }}
              transition={{ delay: i * 0.15, duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              className="absolute text-xl pointer-events-none"
              style={{ left: `${15 + i * 18}%`, top: '20%' }}
            >
              {e}
            </motion.span>
          ))}

        {/* Mascot Avatar with celebratory glow */}
        <div className="relative mb-2">
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-24 h-24 rounded-3xl bg-amber-400 border-4 border-amber-800 shadow-[0_6px_0_#78350f] p-2 relative flex items-center justify-center bear-wobble"
          >
            <BearMascot type={bearType} />
            {/* Crown or Star Badge */}
            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-yellow-300 border-2 border-amber-800 flex items-center justify-center text-sm shadow">
              {isReviewMode ? '📖' : isSuccess ? '⭐' : '💡'}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div
            className={`inline-block px-3 py-1 rounded-full font-black text-xs uppercase tracking-wider shadow-sm mb-1 ${
              isReviewMode
                ? 'bg-sky-600 text-white'
                : isSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-600 text-white'
            }`}
          >
            {isReviewMode
              ? `Xem lại Trạm ${lastCorrectLevel.id}`
              : isSuccess
              ? 'Tuyệt vời!'
              : 'Đã mở khóa đáp án'}
          </div>
          <h2 className="text-2xl font-black text-emerald-950">
            {isReviewMode
              ? 'Kiến Thức Trạm Này'
              : isSuccess
              ? 'Mở Khóa Kiến Thức!'
              : 'Hãy Ghi Nhớ Kiến Thức Nhé!'}
          </h2>
          <div className="text-emerald-700 font-extrabold text-sm">
            {isReviewMode ? (
              <span>Điểm hiện tại: <span className="text-amber-800 font-black">{score}</span> điểm</span>
            ) : isSuccess ? (
              <span>
                +{lastEarnedPoints} điểm • Tổng:{' '}
                <span className="text-amber-800 font-black">{score}</span> điểm
              </span>
            ) : (
              <span>
                +0 điểm trạm này • Tổng:{' '}
                <span className="text-amber-800 font-black">{score}</span> điểm
              </span>
            )}
          </div>
        </motion.div>
      </div>

      {/* Answer Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="mx-4 my-2 p-3 rounded-2xl bg-white border-3 border-emerald-600/30 shadow-sm flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-amber-400 border-2 border-amber-700 flex items-center justify-center text-xl shrink-0">
          🎯
        </div>
        <div>
          <div className="text-emerald-800 text-[11px] font-black uppercase tracking-wider">
            Đáp án chính xác
          </div>
          <div className="text-emerald-950 font-black text-lg leading-tight">
            {lastCorrectLevel.displayAnswer}
          </div>
        </div>
      </motion.div>

      {/* Fact Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mx-4 mb-3 p-4 rounded-3xl bg-white/90 border-3 border-emerald-700/20 shadow-md relative"
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🐾</span>
          <span className="text-emerald-800 font-black text-xs uppercase tracking-wider">
            Bạn có biết?
          </span>
        </div>
        <p className="text-emerald-950 font-bold text-sm sm:text-base leading-relaxed">
          {lastCorrectLevel.fact}
        </p>

        <div className="mt-3 pt-2.5 border-t border-emerald-100 flex items-center justify-between text-[11px] text-emerald-800/70 font-semibold">
          <span>📖 Nguồn: {lastCorrectLevel.source}</span>
          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
            Bảo tồn gấu
          </span>
        </div>
      </motion.div>

      {/* Conservation Action Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mx-4 mb-4 p-3.5 rounded-2xl bg-amber-100 border-2 border-amber-400/80 flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-amber-400 border border-amber-600 flex items-center justify-center text-xl shrink-0">
          🌿
        </div>
        <div className="text-xs text-amber-950 leading-relaxed font-bold">
          Chung tay bảo vệ các cá thể gấu tự nhiên và lan tỏa thông điệp yêu thương động vật hoang dã!
        </div>
      </motion.div>

      {/* Bottom CTA */}
      <div className="p-4 mt-auto">
        <motion.button
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={() => {
            playPopSound();
            closeKnowledge();
          }}
          className="btn-pop w-full py-3.5 rounded-2xl font-black text-lg text-white bg-emerald-600 border-3 border-emerald-900 shadow-[0_5px_0_#064e3b] flex items-center justify-center gap-2"
        >
          <span>{isReviewMode ? '←' : '🗺️'}</span>
          <span>{isReviewMode ? 'Quay Lại Bản Đồ' : 'Tiếp Tục Hành Trình'}</span>
        </motion.button>
      </div>
    </div>
  );
}
