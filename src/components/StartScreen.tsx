/**
 * StartScreen.tsx
 * Cartoon-style start / character-select screen with Kahoot-style session recovery and Leaderboard button.
 */
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { BearMascot, SunBearSVG, MoonBearSVG } from './BearMascot';
import { playPopSound } from '../lib/sound';

const BEAR_OPTIONS = [
  {
    type: 'sunbear' as const,
    label: 'Gấu Chó',
    sub: 'Sun Bear',
    patch: 'Yếm ngực cam vàng',
    cardBg: 'from-amber-300 to-amber-400',
    border: 'border-amber-600',
    shadow: '0 5px 0 #92400e',
    Icon: SunBearSVG,
  },
  {
    type: 'blackbear' as const,
    label: 'Gấu Ngựa',
    sub: 'Asiatic Black Bear',
    patch: 'Yếm ngực chữ V trắng',
    cardBg: 'from-slate-500 to-slate-700',
    border: 'border-slate-400',
    shadow: '0 5px 0 #1e293b',
    Icon: MoonBearSVG,
  },
] as const;

export default function StartScreen() {
  const {
    playerName,
    bearType,
    setPlayerName,
    setBearType,
    startGame,
    resumeGame,
    resetSession,
    completedLevels,
    currentLevelIndex,
    score,
    openLeaderboard,
    levels,
  } = useGameStore();

  const hasActiveSession = completedLevels.length > 0 || score > 0;

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-sky-500 via-emerald-400 to-amber-300 overflow-y-auto no-scrollbar">
      {/* ── TOP ACTION: Leaderboard Button ─────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-3 z-20">
        <button
          onClick={() => {
            playPopSound();
            openLeaderboard();
          }}
          className="btn-pop px-3 py-1.5 rounded-2xl bg-amber-400 border-2 border-amber-800 shadow-[0_2px_0_#78350f] text-amber-950 font-black text-xs flex items-center gap-1.5"
        >
          <span>🏆</span>
          <span>Bảng Xếp Hạng</span>
        </button>

        <div className="text-[11px] font-black uppercase tracking-wider text-amber-950/80 bg-white/50 px-2.5 py-1 rounded-full">
          Workshop Game
        </div>
      </div>

      {/* ── HERO ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center pt-4 pb-3 px-6 text-center relative">
        {/* Decorative clouds */}
        <div className="absolute top-2 left-2 w-20 h-10 bg-white/60 rounded-full blur-sm cloud-drift pointer-events-none" />
        <div
          className="absolute top-6 right-3 w-16 h-8 bg-white/50 rounded-full blur-sm cloud-drift pointer-events-none"
          style={{ animationDelay: '-1.5s' }}
        />

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 140, damping: 11 }}
          className="relative mb-3"
        >
          {/* Glow halo */}
          <div className="absolute inset-0 rounded-full blur-2xl opacity-50 scale-150 bg-amber-300" />
          {/* Avatar circle */}
          <div
            className="relative w-24 h-24 rounded-full flex items-center justify-center border-4 border-amber-500 bg-amber-100 overflow-hidden"
            style={{ boxShadow: '0 6px 0 #92400e, 0 0 32px rgba(251,191,36,0.4)' }}
          >
            <BearMascot type={bearType} size={88} className="float-y" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-block bg-amber-400 border-4 border-amber-700 px-5 py-1.5 rounded-3xl mb-1"
          style={{ boxShadow: '0 5px 0 #78350f', transform: 'rotate(-1.5deg)' }}
        >
          <h1 className="text-xl font-black text-amber-950 uppercase tracking-wider leading-tight">
            🐾 Hành Trình Của Gấu
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-xs font-bold text-emerald-900 mt-1.5 bg-white/60 backdrop-blur px-3 py-1 rounded-full border border-emerald-400/30"
        >
          Khám phá {levels.length} trạm bảo tồn gấu Việt Nam!
        </motion.p>
      </div>

      {/* ── KAHOOT SESSION RECOVERY BANNER (If previous session exists) ── */}
      {hasActiveSession && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-4 mb-3 p-3.5 rounded-2xl bg-amber-100 border-3 border-amber-600 shadow-md"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xl">✨</span>
            <div className="text-xs font-black text-amber-950 uppercase tracking-wider">
              Phiên chơi đang dở
            </div>
          </div>
          <p className="text-xs text-amber-900 font-bold mb-2.5">
            {playerName ? `Bạn ${playerName}` : 'Bạn'} đang dừng chân ở{' '}
            <span className="text-amber-950 font-black">
              Trạm {currentLevelIndex + 1}/{levels.length}
            </span>{' '}
            với <span className="text-amber-950 font-black">{score} điểm</span>.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                playPopSound();
                resumeGame();
              }}
              className="btn-pop py-2 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-wider border-2 border-emerald-800 shadow-[0_2px_0_#064e3b] flex items-center justify-center gap-1"
            >
              <span>▶ Tiếp tục</span>
            </button>
            <button
              onClick={() => {
                playPopSound();
                resetSession();
              }}
              className="btn-pop py-2 rounded-xl bg-white text-amber-900 font-black text-xs uppercase tracking-wider border-2 border-amber-300 shadow-[0_2px_0_#d97706] flex items-center justify-center gap-1"
            >
              <span>🔄 Chơi lại từ đầu</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* ── FORM CARD ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
        className="mx-4 rounded-3xl flex flex-col gap-3.5 p-4"
        style={{
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(12px)',
          border: '2px solid rgba(255,255,255,0.7)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
        }}
      >
        {/* Name input */}
        <div>
          <label className="text-amber-900 text-xs font-black uppercase tracking-widest block mb-1.5">
            Tên của bạn trên bảng xếp hạng
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Nhập nickname..."
            maxLength={20}
            className="w-full px-4 py-2.5 rounded-2xl bg-white/80 border-2 border-amber-400 text-amber-950 placeholder-amber-400/60 text-sm font-bold outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-400/50 transition-all"
          />
        </div>

        {/* Bear selection */}
        <div>
          <label className="text-amber-900 text-xs font-black uppercase tracking-widest block mb-2">
            Chọn nhân vật gấu
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {BEAR_OPTIONS.map(({ type, label, sub, patch, border, shadow, Icon }) => {
              const selected = bearType === type;
              return (
                <motion.button
                  key={type}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    playPopSound();
                    setBearType(type);
                  }}
                  className={`relative p-2.5 rounded-2xl flex flex-col items-center gap-1 border-2 transition-all ${border} ${
                    selected ? 'ring-4 ring-offset-1 ring-amber-400' : 'opacity-80'
                  } btn-pop`}
                  style={{
                    background: selected
                      ? `linear-gradient(135deg, var(--tw-gradient-stops))`
                      : 'rgba(255,255,255,0.4)',
                    backgroundImage: selected
                      ? `linear-gradient(135deg, #fde68a, #fbbf24)`
                      : undefined,
                    boxShadow: selected ? shadow : '0 3px 0 rgba(0,0,0,0.15)',
                  }}
                >
                  {selected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px] font-black border border-emerald-700">
                      ✓
                    </div>
                  )}
                  <Icon size={56} className={selected ? 'float-y' : ''} />
                  <div className="text-amber-950 font-black text-xs text-center">{label}</div>
                  <div className="text-amber-800/70 text-[9px] font-bold text-center">{sub}</div>
                  <div className="text-[9px] font-bold text-amber-700/80 text-center leading-tight bg-amber-100/60 px-2 py-0.5 rounded-full mt-0.5">
                    {patch}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* ── STATS ROW ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-around mx-4 mt-3 p-2.5 rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.35)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.5)',
        }}
      >
        {[
          { icon: '🗺️', value: levels.length || 13, label: 'Trạm dừng' },
          { icon: '🧠', value: '13+', label: 'Kiến thức' },
          { icon: '⭐', value: `${(levels.length || 13) * 216}`, label: 'Điểm tối đa' },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col items-center">
            <span className="text-lg">{stat.icon}</span>
            <span className="text-amber-950 font-black text-base leading-tight">
              {stat.value}
            </span>
            <span className="text-amber-800/70 text-[10px] font-bold">{stat.label}</span>
          </div>
        ))}
      </motion.div>

      {/* ── START BUTTON ───────────────────────────────────────────────── */}
      <div className="px-4 pb-6 pt-3 mt-auto">
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.94, y: 4 }}
          onClick={() => {
            playPopSound();
            startGame();
          }}
          className="w-full py-3.5 rounded-2xl font-black text-lg text-white shine-scan btn-pop flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            boxShadow: '0 6px 0 #14532d, 0 0 28px rgba(34,197,94,0.4)',
          }}
        >
          <span>🐾</span>
          <span>Bắt đầu hành trình mới!</span>
        </motion.button>
      </div>
    </div>
  );
}
