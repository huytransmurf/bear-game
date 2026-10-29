import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import WordGrid from './WordGrid';
import { playPopSound } from '../lib/sound';

export default function QuestionModal() {
  const { currentLevelIndex, attemptsLeft, goToMap, levels } = useGameStore();
  const level = levels[currentLevelIndex] || levels[0];

  return (
    <AnimatePresence>
      <motion.div
        key="question-screen"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="flex flex-col h-full bg-gradient-to-b from-[#fef3c7] via-[#fde68a] to-[#fed7aa] overflow-y-auto no-scrollbar select-none"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 z-10">
          <button
            onClick={() => {
              playPopSound();
              goToMap();
            }}
            className="btn-pop w-10 h-10 rounded-2xl bg-amber-400 border-2 border-amber-800 shadow-[0_3px_0_#78350f] flex items-center justify-center text-amber-950 font-black text-lg"
            title="Quay lại bản đồ"
          >
            ←
          </button>

          {/* Station Badge */}
          <div className="bg-amber-800 text-amber-100 px-4 py-1.5 rounded-full border-2 border-amber-900 shadow-sm flex items-center gap-1.5">
            <span className="text-sm">📍</span>
            <span className="font-black text-xs uppercase tracking-wider">
              Trạm {currentLevelIndex + 1} / {levels.length}
            </span>
          </div>

          {/* Attempts / Lives */}
          <div className="flex items-center gap-1 bg-white/70 px-2.5 py-1.5 rounded-2xl border-2 border-amber-300">
            {Array.from({ length: 3 }).map((_, i) => (
              <motion.span
                key={i}
                animate={i >= attemptsLeft ? { scale: 0.8, filter: 'grayscale(1)' } : { scale: 1 }}
                className={`text-base transition-all ${
                  i < attemptsLeft ? 'opacity-100 scale-100 drop-shadow-sm' : 'opacity-30'
                }`}
              >
                ❤️
              </motion.span>
            ))}
          </div>
        </div>

        {/* Question Parchment Card */}
        <div className="mx-4 mt-2 mb-2 p-3.5 rounded-2xl bg-white/90 border-3 border-amber-800/20 shadow-md">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/30 border border-amber-400 flex items-center justify-center text-lg shrink-0">
              🔍
            </div>
            <div className="flex-1">
              <p className="text-amber-950 font-bold text-sm sm:text-base leading-snug">
                {level.question}
              </p>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                <span className="font-black text-amber-700 bg-amber-200/80 px-1.5 py-0.5 rounded">
                  Gợi ý
                </span>
                <span className="text-amber-800/80 italic font-medium">
                  {level.hint}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Word Grid Area */}
        <div className="px-4 pb-4 flex-1 flex flex-col justify-center">
          <WordGrid />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
