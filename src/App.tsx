import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from './store/gameStore';
import StartScreen from './components/StartScreen';
import MapScreen from './components/MapScreen';
import QuestionModal from './components/QuestionModal';
import KnowledgeCard from './components/KnowledgeCard';
import ResultScreen from './components/ResultScreen';
import LeaderboardModal from './components/LeaderboardModal';
import { playPopSound, updateMusicPlayback } from './lib/sound';

const screenVariants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
};

function App() {
  const {
    screen,
    soundEnabled,
    toggleSound,
    musicVolume,
    setMusicVolume,
    loadLevels,
  } = useGameStore();

  const [showVolumePopup, setShowVolumePopup] = useState(false);

  useEffect(() => {
    loadLevels();
  }, [loadLevels]);

  useEffect(() => {
    updateMusicPlayback();
  }, [soundEnabled, musicVolume]);

  // Handle first user interaction to unlock browser autoplay policy
  useEffect(() => {
    const handleFirstUserGesture = () => {
      updateMusicPlayback();
      window.removeEventListener('pointerdown', handleFirstUserGesture);
      window.removeEventListener('keydown', handleFirstUserGesture);
    };
    window.addEventListener('pointerdown', handleFirstUserGesture);
    window.addEventListener('keydown', handleFirstUserGesture);
    return () => {
      window.removeEventListener('pointerdown', handleFirstUserGesture);
      window.removeEventListener('keydown', handleFirstUserGesture);
    };
  }, []);

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
        {/* Sound toggle & Volume control (Chỉ hiển thị ngoài màn hình Map vì MapScreen đã có thanh điều khiển riêng) */}
        {screen !== 'map' && (
          <div className="absolute top-3 right-3 z-50 flex items-center gap-1.5">
            <button
              onClick={() => {
                playPopSound();
                setShowVolumePopup((prev) => !prev);
              }}
              className="btn-pop w-8 h-8 rounded-2xl bg-amber-400 border-2 border-amber-800 shadow-[0_2px_0_#78350f] flex items-center justify-center text-xs"
              title="Tùy chỉnh âm lượng nhạc nền"
            >
              🎵
            </button>
            <button
              onClick={() => {
                playPopSound();
                toggleSound();
              }}
              className="btn-pop w-8 h-8 rounded-2xl bg-amber-400 border-2 border-amber-800 shadow-[0_2px_0_#78350f] flex items-center justify-center text-xs"
              title={soundEnabled ? 'Tắt toàn bộ âm thanh' : 'Bật âm thanh'}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
          </div>
        )}

        {/* Volume popover slider */}
        <AnimatePresence>
          {showVolumePopup && screen !== 'map' && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className="absolute top-13 right-3 z-50 p-3 bg-amber-100 border-2 border-amber-800 rounded-2xl shadow-xl flex flex-col gap-1.5 w-44 text-amber-950"
            >
              <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-wider">
                <span>Âm lượng nhạc</span>
                <span className="text-amber-800">{Math.round(musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={musicVolume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setMusicVolume(val);
                }}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <button
                onClick={() => setShowVolumePopup(false)}
                className="mt-1 py-1 rounded-xl bg-amber-400 border border-amber-800 text-[10px] font-black text-amber-950 uppercase"
              >
                Đóng
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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
