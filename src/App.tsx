import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from './store/gameStore';
import StartScreen from './components/StartScreen';
import MapScreen from './components/MapScreen';
import QuestionModal from './components/QuestionModal';
import KnowledgeCard from './components/KnowledgeCard';
import ResultScreen from './components/ResultScreen';
import LeaderboardModal from './components/LeaderboardModal';
import { playPopSound } from './lib/sound';

const screenVariants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
};

function App() {
  const { screen, soundEnabled, toggleSound, loadLevels } = useGameStore();

  useEffect(() => {
    loadLevels();
  }, [loadLevels]);

  return (
    <div className="min-h-screen bg-[#111827] flex items-center justify-center p-0 sm:p-4 select-none">
      {/* Background ambient forest glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600 rounded-full blur-[100px]" />
      </div>

      {/* Phone container */}
      <div
        className="relative w-full sm:w-[420px] bg-slate-900 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] sm:border-4 sm:border-slate-800"
        style={{
          height: '100dvh',
          maxHeight: '880px',
          borderRadius: 'clamp(0px, 3vw, 32px)',
        }}
      >
        {/* Sound toggle button */}
        <button
          onClick={() => {
            playPopSound();
            toggleSound();
          }}
          className="btn-pop absolute top-3 right-3 z-50 w-9 h-9 rounded-2xl bg-amber-400 border-2 border-amber-800 shadow-[0_2px_0_#78350f] flex items-center justify-center text-sm"
          title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>

        <AnimatePresence mode="wait">
          {screen === 'start' && (
            <motion.div
              key="start"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.22 }}
              className="absolute inset-0"
            >
              <StartScreen />
            </motion.div>
          )}

          {screen === 'map' && (
            <motion.div
              key="map"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.22 }}
              className="absolute inset-0"
            >
              <MapScreen />
            </motion.div>
          )}

          {screen === 'question' && (
            <motion.div
              key="question"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.22 }}
              className="absolute inset-0"
            >
              <QuestionModal />
            </motion.div>
          )}

          {screen === 'knowledge' && (
            <motion.div
              key="knowledge"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.22 }}
              className="absolute inset-0"
            >
              <KnowledgeCard />
            </motion.div>
          )}

          {screen === 'result' && (
            <motion.div
              key="result"
              variants={screenVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.22 }}
              className="absolute inset-0"
            >
              <ResultScreen />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Leaderboard Modal */}
        <LeaderboardModal />
      </div>
    </div>
  );
}

export default App;
