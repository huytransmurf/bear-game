/**
 * MapScreen.tsx
 * Rich, whimsical, tactile cartoon forest map with 3D islands, cobblestone trails,
 * landmark illustrations (beehive, free stream, ranger station, sanctuary gate),
 * interactive bear mascot with speech bubble, and station preview popups.
 */
import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { BearMascot } from './BearMascot';
import { playPopSound } from '../lib/sound';

export { BearMascot as BearIcon };

export interface StationData {
  id: number;
  x: number;
  y: number;
  title: string;
  subtitle: string;
  themeIcon: string;
  badge: string;
}

export function getStationCoords(idx: number, total: number): { x: number; y: number } {
  // Khoảng cách theo chiều dọc dựa trên tổng số trạm
  // Nếu 5 trạm: khoảng cách ~130px; nếu nhiều trạm hơn: co lại hợp lý
  const stepY = total <= 6 ? 140 : 115;
  const startY = 120;
  const y = startY + idx * stepY;

  // Nếu là trạm đích cuối cùng, căn vào giữa
  if (idx === total - 1) {
    return { x: 190, y };
  }

  // Đảo qua lại trái (110) và phải (270) cho cân đối giữa khổ 380px
  const isLeft = idx % 2 === 0;
  return {
    x: isLeft ? 110 : 270,
    y,
  };
}

export function generateTrailPath(coords: { x: number; y: number }[]): string {
  if (coords.length === 0) return '';
  if (coords.length === 1) return `M ${coords[0].x},${coords[0].y}`;

  let path = `M ${coords[0].x},${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const curr = coords[i];
    const next = coords[i + 1];
    const midY = (curr.y + next.y) / 2;
    path += ` C ${curr.x},${midY} ${next.x},${midY} ${next.x},${next.y}`;
  }
  return path;
}


// Sỏi đá cuội dọc chính giữa đường mòn uốn lượn
const COBBLESTONES = [
  { x: 127, y: 155, r: 3.5 },
  { x: 155, y: 174, r: 4.1 },
  { x: 190, y: 190, r: 4.7 },
  { x: 225, y: 206, r: 3.5 },
  { x: 253, y: 225, r: 4.1 },
  { x: 253, y: 295, r: 4.7 },
  { x: 225, y: 314, r: 3.5 },
  { x: 190, y: 330, r: 4.1 },
  { x: 155, y: 346, r: 4.7 },
  { x: 127, y: 365, r: 3.5 },
  { x: 127, y: 435, r: 4.1 },
  { x: 155, y: 454, r: 4.7 },
  { x: 190, y: 470, r: 3.5 },
  { x: 225, y: 486, r: 4.1 },
  { x: 253, y: 505, r: 4.7 },
  { x: 253, y: 575, r: 3.5 },
  { x: 225, y: 594, r: 4.1 },
  { x: 190, y: 610, r: 4.7 },
  { x: 155, y: 626, r: 3.5 },
  { x: 127, y: 645, r: 4.1 },
  { x: 118, y: 715, r: 4.7 },
  { x: 133, y: 734, r: 3.5 },
  { x: 150, y: 750, r: 4.1 },
  { x: 167, y: 766, r: 4.7 },
  { x: 182, y: 785, r: 3.5 },
];

// Vết chân gấu in dấu trên đường mòn theo hướng di chuyển
const PAW_PRINTS = [
  { x: 155, y: 174, rot: 28 },
  { x: 225, y: 206, rot: 28 },
  { x: 225, y: 314, rot: 152 },
  { x: 155, y: 346, rot: 152 },
  { x: 155, y: 454, rot: 28 },
  { x: 225, y: 486, rot: 28 },
  { x: 225, y: 594, rot: 152 },
  { x: 155, y: 626, rot: 152 },
  { x: 133, y: 734, rot: 46 },
  { x: 167, y: 766, rot: 46 },
];

const BEAR_PHRASES = [
  'Đi tiếp thôi bạn ơi! 🐾',
  'Tớ ngửi thấy mùi mật ong rừng! 🍯',
  'Gấu là bạn, không phải để lấy mật! 🌿',
  'Cùng tớ giải mã trạm này nhé! 🔍',
  'Rừng xanh tươi đẹp đang đợi! 🌲',
  'Chung tay bảo vệ gấu Việt Nam! 💛',
];

export default function MapScreen() {
  const {
    currentLevelIndex,
    completedLevels,
    bearType,
    goToQuestion,
    playerName,
    score,
    openLeaderboard,
    viewLevelKnowledge,
    restartGame,
    levels,
    isLoadingLevels,
    loadLevels,
    soundEnabled,
    toggleSound,
    musicVolume,
    setMusicVolume,
  } = useGameStore();

  useEffect(() => {
    if (levels.length === 0 && !isLoadingLevels) {
      loadLevels();
    }
  }, [levels.length, isLoadingLevels, loadLevels]);

  const stations: StationData[] = levels.map((lvl, idx) => {
    const coords = getStationCoords(idx, levels.length);
    return {
      id: idx,
      x: coords.x,
      y: coords.y,
      title: lvl.stationTitle || `Trạm ${idx + 1}`,
      subtitle: lvl.stationSubtitle || '',
      themeIcon: lvl.themeIcon || '🐾',
      badge: lvl.badge || (idx === levels.length - 1 ? 'Đích Đến' : `Chặng ${idx + 1}`),
    };
  });

  const smoothTrailPath = generateTrailPath(stations);
  const totalSvgHeight = Math.max(760, stations.length * 140 + 100);

  // Filter cobblestones and paw prints to match actual height
  const activeCobblestones = COBBLESTONES.filter((c) => c.y < totalSvgHeight - 50);
  const activePawPrints = PAW_PRINTS.filter((p) => p.y < totalSvgHeight - 50);

  const [selectedStation, setSelectedStation] = useState<StationData | null>(null);
  const [speechText, setSpeechText] = useState<string>(BEAR_PHRASES[0]);
  const [bearHopCount, setBearHopCount] = useState<number>(0);

  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const activeStation = stations[currentLevelIndex] || stations[0];

  // Auto-scroll to current station on level change
  useEffect(() => {
    if (scrollRef.current && activeStation) {
      const containerH = scrollRef.current.clientHeight;
      const scrollableH = scrollRef.current.scrollHeight;
      const scrollY = (activeStation.y / totalSvgHeight) * scrollableH - containerH / 2;
      scrollRef.current.scrollTo({ top: Math.max(0, scrollY), behavior: 'smooth' });
    }
  }, [currentLevelIndex, activeStation, totalSvgHeight]);

  if (levels.length === 0 || !activeStation) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#fef3c7] text-amber-950 font-bold p-6 text-center">
        <span className="text-4xl animate-bounce mb-3">🐾</span>
        <p className="text-base font-black mb-1">Đang tải bản đồ hành trình từ Supabase...</p>
        <p className="text-xs text-amber-800/80 mb-4">Vui lòng chờ trong giây lát</p>
        <button
          onClick={() => loadLevels()}
          className="btn-pop px-4 py-2 rounded-xl bg-amber-400 border-2 border-amber-800 text-amber-950 font-black text-xs shadow-[0_2px_0_#78350f]"
        >
          🔄 Thử tải lại
        </button>
      </div>
    );
  }

  const handleBearClick = () => {
    playPopSound();
    setBearHopCount((c) => c + 1);
    const nextText = BEAR_PHRASES[(bearHopCount + 1) % BEAR_PHRASES.length];
    setSpeechText(nextText);
  };

  const handleStationClick = (station: StationData) => {
    playPopSound();
    setSelectedStation(station);
  };

  const handleRestart = () => {
    playPopSound();
    if (window.confirm('Bạn có chắc muốn chơi lại từ đầu không? Toàn bộ tiến trình sẽ được làm mới.')) {
      setShowSettingsModal(false);
      restartGame();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#38bdf8] via-[#86efac] to-[#fef08a] overflow-hidden select-none relative font-sans">
      {/* ── TOP HEADER (Tactile cartoon banner) ────────────────────────── */}
      <header className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 border-b-4 border-amber-800 shadow-md shrink-0 z-20">
        {/* Player Badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div
            onClick={handleBearClick}
            className="w-9 h-9 rounded-2xl bg-amber-100 border-2 border-amber-800 shadow-[0_2px_0_#78350f] p-0.5 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            title="Bấm vào tớ nè!"
          >
            <BearMascot type={bearType} size={32} />
          </div>
          <div>
            <div className="text-[9px] font-black uppercase text-amber-900 tracking-wider leading-none">
              Nhà thám hiểm
            </div>
            <div className="text-xs font-black text-amber-950 leading-tight truncate max-w-[80px]">
              {playerName || 'Bạn Gấu Nhỏ'}
            </div>
          </div>
        </div>

        {/* Level Counter Banner */}
        <div className="bg-white/90 border-2 border-amber-800 px-2 py-0.5 rounded-2xl shadow-[0_2px_0_#78350f] shrink-0">
          <div className="text-[11px] font-black text-amber-950 flex items-center gap-1">
            <span>📍</span>
            <span>Trạm {currentLevelIndex + 1}/{stations.length}</span>
          </div>
        </div>

        {/* Honey Score & Leaderboard & Audio & Settings */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => {
              playPopSound();
              toggleSound();
            }}
            className="btn-pop w-7 h-7 rounded-xl bg-amber-200 border-2 border-amber-800 flex items-center justify-center text-xs shadow-[0_2px_0_#78350f]"
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>

          <button
            onClick={() => {
              playPopSound();
              setShowSettingsModal(true);
            }}
            className="btn-pop w-7 h-7 rounded-xl bg-amber-200 border-2 border-amber-800 flex items-center justify-center text-xs shadow-[0_2px_0_#78350f]"
            title="Tùy chọn: Chơi lại từ đầu & Âm thanh"
          >
            ⚙️
          </button>

          <button
            onClick={() => {
              playPopSound();
              openLeaderboard();
            }}
            className="btn-pop w-7 h-7 rounded-xl bg-amber-200 border-2 border-amber-800 flex items-center justify-center text-xs shadow-[0_2px_0_#78350f]"
            title="Bảng xếp hạng"
          >
            🏆
          </button>

          <div className="flex items-center gap-1 bg-amber-900/10 border border-amber-800/30 px-1.5 py-0.5 rounded-xl">
            <span className="text-xs">🍯</span>
            <div className="text-right">
              <div className="text-[7px] font-black text-amber-900 uppercase leading-none">Điểm</div>
              <div className="text-[11px] font-black text-amber-950 leading-none sparkle">{score}</div>
            </div>
          </div>
        </div>
      </header>

      {/* ── MAP SCROLL CANVAS ─────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto no-scrollbar relative"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Floating Clouds Background */}
        <div className="pointer-events-none absolute top-4 left-3 w-20 h-10 bg-white/80 rounded-full blur-[1px] cloud-drift z-0" />
        <div className="pointer-events-none absolute top-48 right-4 w-28 h-12 bg-white/70 rounded-full blur-[1px] cloud-drift z-0" style={{ animationDelay: '-2s' }} />
        <div className="pointer-events-none absolute top-96 left-6 w-24 h-10 bg-white/60 rounded-full blur-[1px] cloud-drift z-0" style={{ animationDelay: '-3.5s' }} />
        <div className="pointer-events-none absolute top-[700px] right-8 w-20 h-9 bg-white/70 rounded-full blur-[1px] cloud-drift z-0" style={{ animationDelay: '-1.5s' }} />

        {/* Floating Butterflies */}
        <div className="pointer-events-none absolute top-40 left-12 text-lg butterfly-flutter z-10">🦋</div>
        <div className="pointer-events-none absolute top-[520px] right-14 text-base butterfly-flutter z-10" style={{ animationDelay: '-2s' }}>🦋</div>
        <div className="pointer-events-none absolute top-[850px] left-16 text-lg butterfly-flutter z-10" style={{ animationDelay: '-1s' }}>🐝</div>

        {/* SVG Game World */}
        <svg
          viewBox={`0 0 380 ${totalSvgHeight}`}
          className="w-full relative z-10"
          style={{ display: 'block' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Trail gradient */}
            <linearGradient id="trailSandGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            {/* Island Grass Gradient */}
            <linearGradient id="grassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#86efac" />
              <stop offset="40%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#16a34a" />
            </linearGradient>

            {/* Island Cliff Earth Gradient */}
            <linearGradient id="cliffEarthGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#92400e" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>

            {/* River Gradient */}
            <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>

            {/* Island 3D Shadow */}
            <filter id="islandShadow3D" x="-20%" y="-20%" width="140%" height="160%">
              <feDropShadow dx="0" dy="8" stdDeviation="0" floodColor="#14532d" />
            </filter>

            {/* Node Tactile Drop Shadow */}
            <filter id="node3DShadow" x="-30%" y="-30%" width="160%" height="170%">
              <feDropShadow dx="0" dy="5" stdDeviation="0" floodColor="#78350f" />
            </filter>

            {/* Glowing Halo Filter */}
            <filter id="glowGold" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ── 1. RIVER STREAM CROSSING ──────────────────────────── */}
          <path
            d="M -20,330 C 120,300 200,380 400,340"
            fill="none"
            stroke="url(#riverGrad)"
            strokeWidth="38"
            strokeLinecap="round"
            opacity="0.85"
          />
          <path
            d="M -20,330 C 120,300 200,380 400,340"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3"
            strokeDasharray="12,16"
            opacity="0.5"
          />

          {/* ── 2. CARTOON FLOATING ISLANDS ───────────────────────── */}
          {stations.map((station) => (
            <g key={`island-${station.id}`} transform={`translate(${station.x}, ${station.y})`}>
              {/* Island Cliff Base (3D block) */}
              <ellipse
                cx="0"
                cy="32"
                rx="74"
                ry="34"
                fill="url(#cliffEarthGrad)"
                filter="url(#islandShadow3D)"
              />
              {/* Earth Strata lines */}
              <path
                d="M -60,32 Q 0,44 60,32"
                fill="none"
                stroke="#b45309"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.6"
              />
              <path
                d="M -45,40 Q 0,50 45,40"
                fill="none"
                stroke="#78350f"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.5"
              />

              {/* Island Lush Grass Top */}
              <ellipse
                cx="0"
                cy="18"
                rx="72"
                ry="30"
                fill="url(#grassGrad)"
                stroke="#15803d"
                strokeWidth="3"
              />

              {/* Grass Highlights & Flowers */}
              <circle cx="-38" cy="18" r="3" fill="#fde047" />
              <circle cx="-34" cy="15" r="2" fill="#ffffff" />
              <circle cx="42" cy="20" r="3.5" fill="#f43f5e" />
              <circle cx="42" cy="20" r="1.5" fill="#fef08a" />
              <circle cx="28" cy="26" r="2.5" fill="#38bdf8" />

              {/* Tiny cartoon mushrooms */}
              <g transform="translate(-48, 22)">
                <ellipse cx="0" cy="0" rx="6" ry="4" fill="#ef4444" />
                <circle cx="-2" cy="-1" r="1" fill="#ffffff" />
                <circle cx="2" cy="0" r="1" fill="#ffffff" />
                <rect x="-1.5" y="0" width="3" height="4" fill="#ffffff" rx="1" />
              </g>
            </g>
          ))}

          {/* ── 3. WINDING CARTOON TRAIL ──────────────────────────── */}
          {/* Deep Trail Shadow */}
          <path
            d={smoothTrailPath}
            fill="none"
            stroke="#5c2c08"
            strokeWidth="34"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Earth Bed */}
          <path
            d={smoothTrailPath}
            fill="none"
            stroke="#92400e"
            strokeWidth="26"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Sandy Bright Path */}
          <path
            d={smoothTrailPath}
            fill="none"
            stroke="url(#trailSandGrad)"
            strokeWidth="18"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Cobblestones along path */}
          {
            activeCobblestones.map((cobble, idx) => (
              <circle
                key={`cobble-${idx}`}
                cx={cobble.x}
                cy={cobble.y}
                r={cobble.r}
                fill="#d97706"
                stroke="#b45309"
                strokeWidth="1.5"
                opacity="0.8"
              />
            ))
          }

          {/* Stamped Bear Paw Prints */}
          {
            activePawPrints.map((paw, idx) => (
              <g
                key={`paw-${idx}`}
                transform={`translate(${paw.x}, ${paw.y}) rotate(${paw.rot}) scale(0.6)`}
                opacity="0.45"
              >
                <ellipse cx="0" cy="4" rx="6" ry="5" fill="#78350f" />
                <circle cx="-5" cy="-3" r="2.2" fill="#78350f" />
                <circle cx="-1.5" cy="-6" r="2.2" fill="#78350f" />
                <circle cx="2.5" cy="-6" r="2.2" fill="#78350f" />
                <circle cx="5.5" cy="-3" r="2.2" fill="#78350f" />
              </g>
            ))
          }

          {/* Animated Golden Sun Dash Trail */}
          < path
            d={smoothTrailPath}
            fill="none"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
            className="animated-trail"
            opacity="0.9"
          />

          {/* Wooden Bridge at River Crossing (near y: 330) */}
          <g transform="translate(182, 332) rotate(-16)">
            {/* Wooden Planks */}
            {[-18, -6, 6, 18].map((offset, i) => (
              <rect
                key={i}
                x="-22"
                y={offset - 4}
                width="44"
                height="8"
                rx="2"
                fill="#b45309"
                stroke="#78350f"
                strokeWidth="1.5"
              />
            ))}
            {/* Bridge ropes */}
            <line x1="-20" y1="-22" x2="-20" y2="22" stroke="#78350f" strokeWidth="2.5" />
            <line x1="20" y1="-22" x2="20" y2="22" stroke="#78350f" strokeWidth="2.5" />
          </g>

          {/* ── 4. BESPOKE CARTOON LANDMARKS ──────────────────────── */}
          {/* Landmark 1: Cây cổ thụ có tổ ong rừng (Gần Trạm 1: x: 110, y: 120 -> đặt bên phải thoáng x: 260, y: 110) */}
          <g transform="translate(260, 110)" className="tree-sway">
            {/* Tree Trunk */}
            <path d="M 0,25 Q 5,0 0,-15" stroke="#78350f" strokeWidth="8" fill="none" strokeLinecap="round" />
            {/* Tree Foliage */}
            <circle cx="-10" cy="-22" r="18" fill="#15803d" />
            <circle cx="10" cy="-24" r="16" fill="#16a34a" />
            <circle cx="0" cy="-32" r="16" fill="#22c55e" />
            {/* Honeycomb on branch */}
            <g transform="translate(18, -12)">
              <ellipse cx="0" cy="0" rx="9" ry="7" fill="#f59e0b" stroke="#78350f" strokeWidth="2" />
              <ellipse cx="0" cy="5" rx="8" ry="6" fill="#fbbf24" stroke="#78350f" strokeWidth="2" />
              <ellipse cx="0" cy="10" rx="6" ry="5" fill="#f59e0b" stroke="#78350f" strokeWidth="2" />
              {/* Dripping honey */}
              <circle cx="0" cy="17" r="2.5" fill="#fbbf24" className="honey-drip" />
            </g>
            {/* Little Bee */}
            <g transform="translate(28, -24)">
              <ellipse cx="0" cy="0" rx="4" ry="3" fill="#fde047" stroke="#000" strokeWidth="1" />
              <line x1="-1" y1="-3" x2="-1" y2="3" stroke="#000" strokeWidth="1" />
              <line x1="1" y1="-3" x2="1" y2="3" stroke="#000" strokeWidth="1" />
            </g>
          </g>

          {/* Landmark 2: Rừng thông đại ngàn (Gần Trạm 2: x: 270, y: 260 -> đặt bên lề trái x: 38, y: 245) */}
          <g transform="translate(38, 245)" className="tree-sway">
            <rect x="-3" y="15" width="6" height="15" fill="#78350f" rx="1.5" />
            <polygon points="0,-18 -18,0 -8,0 -22,16 22,16 8,0 18,0" fill="#15803d" stroke="#14532d" strokeWidth="2" />
            <circle cx="0" cy="-6" r="3" fill="#86efac" opacity="0.6" />
            {/* Secondary smaller pine */}
            <g transform="translate(22, 10) scale(0.7)">
              <rect x="-3" y="15" width="6" height="15" fill="#78350f" rx="1.5" />
              <polygon points="0,-18 -18,0 -8,0 -22,16 22,16 8,0 18,0" fill="#16a34a" stroke="#14532d" strokeWidth="2" />
            </g>
          </g>

          {/* Landmark 3: Lồng sắt mở toang & bướm tự do (Gần Trạm 3: x: 110, y: 400 -> đặt bên lề phải x: 340, y: 390) */}
          <g transform="translate(340, 390)">
            {/* Broken cage bars */}
            <rect x="-10" y="-14" width="20" height="22" fill="none" stroke="#64748b" strokeWidth="2.5" rx="3" />
            <line x1="-3" y1="-14" x2="-3" y2="8" stroke="#64748b" strokeWidth="2" />
            <path d="M 3,-14 L 8,-4" stroke="#64748b" strokeWidth="2" />
            {/* Broken golden lock */}
            <rect x="-5" y="8" width="10" height="7" fill="#facc15" stroke="#a16207" strokeWidth="1.5" rx="1" />
            {/* Freedom Butterfly flying out */}
            <g transform="translate(-16, -18) scale(0.85)">
              <ellipse cx="-4" cy="-4" rx="5" ry="3" fill="#38bdf8" transform="rotate(-30, -4, -4)" />
              <ellipse cx="4" cy="-4" rx="5" ry="3" fill="#38bdf8" transform="rotate(30, 4, -4)" />
              <circle cx="0" cy="-2" r="2" fill="#0284c7" />
            </g>
          </g>

          {/* Landmark 4: Vườn thảo dược & hoa cúc giải cứu gấu (Gần Trạm 4: x: 270, y: 540 -> đặt bên lề trái x: 36, y: 525) */}
          <g transform="translate(36, 525)">
            <ellipse cx="0" cy="14" rx="14" ry="5" fill="#78350f" opacity="0.7" />
            {/* Stem & Leaves */}
            <path d="M 0,14 Q 4,0 0,-12" stroke="#16a34a" strokeWidth="3" fill="none" strokeLinecap="round" />
            <ellipse cx="-7" cy="-2" rx="6" ry="3.5" fill="#4ade80" transform="rotate(-30, -7, -2)" />
            <ellipse cx="7" cy="-6" rx="6" ry="3.5" fill="#4ade80" transform="rotate(30, 7, -6)" />
            {/* Herbal flower */}
            <circle cx="0" cy="-16" r="6" fill="#fde047" stroke="#eab308" strokeWidth="1.5" />
            <circle cx="0" cy="-16" r="2.5" fill="#ea580c" />
          </g>

          {/* Landmark 5: Chòi kiểm lâm bảo vệ rừng (Đặt bên lề phải thoáng x: 340, y: 730) */}
          <g transform="translate(340, 730)">
            {/* Stilts */}
            <line x1="-8" y1="14" x2="-4" y2="-4" stroke="#78350f" strokeWidth="2.5" />
            <line x1="8" y1="14" x2="4" y2="-4" stroke="#78350f" strokeWidth="2.5" />
            {/* Cross bracing */}
            <line x1="-6" y1="10" x2="6" y2="0" stroke="#78350f" strokeWidth="1.5" opacity="0.6" />
            {/* Cabin */}
            <rect x="-11" y="-15" width="22" height="13" fill="#d97706" stroke="#78350f" strokeWidth="2" rx="2" />
            <polygon points="-15,-15 0,-25 15,-15" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
            {/* Window */}
            <rect x="-4" y="-12" width="8" height="6" fill="#fef08a" stroke="#78350f" strokeWidth="1" rx="1" />
          </g>

          {/* Landmark: Grand Sanctuary Victory Gate (Ngay sau trạm đích đến cuối cùng) */}
          {stations.length > 0 && (
            <g transform={`translate(${stations[stations.length - 1].x}, ${stations[stations.length - 1].y + 60})`}>
              {/* Gate Pillars & Arch */}
              <path d="M -36,22 L -36,-10 Q 0,-32 36,-10 L 36,22" fill="none" stroke="#78350f" strokeWidth="7" strokeLinecap="round" />
              {/* Bunting Garland */}
              <path d="M -32,-6 Q 0,8 32,-6" fill="none" stroke="#f59e0b" strokeWidth="2" />
              {[-22, -11, 0, 11, 22].map((bx, i) => {
                const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];
                return (
                  <polygon
                    key={i}
                    points={`${bx},0 ${bx + 6},0 ${bx + 3},9`}
                    fill={colors[i]}
                    className="flag-wave"
                  />
                );
              })}
              {/* Welcome Signboard */}
              <rect x="-44" y="-32" width="88" height="16" fill="#fde047" stroke="#b45309" strokeWidth="2.5" rx="4" />
              <text x="0" y="-21" fontSize="8" fontWeight="900" fill="#78350f" textAnchor="middle" fontFamily="'Baloo 2', 'Be Vietnam Pro', sans-serif">
                VQG BẠCH MÃ SANCTUARY
              </text>
            </g>
          )}

          {/* ── 5. STATION NODES (Interactive 3D Game Buttons) ─────── */}
          {stations.map((station, idx) => {
            const isCompleted = completedLevels.includes(idx);
            const isCurrent = idx === currentLevelIndex;
            const isLocked = idx > currentLevelIndex;

            // Palette based on status
            const ringFill = isCompleted ? '#059669' : isCurrent ? '#d97706' : '#64748b';
            const bodyFill = isCompleted ? '#10b981' : isCurrent ? '#fbbf24' : '#94a3b8';
            const highlightFill = isCompleted ? '#34d399' : isCurrent ? '#fef08a' : '#cbd5e1';

            return (
              <g
                key={`node-${station.id}`}
                transform={`translate(${station.x}, ${station.y})`}
                onClick={() => handleStationClick(station)}
                className="cursor-pointer"
              >
                {/* Ping / Radar ring on active station */}
                {isCurrent && (
                  <circle
                    r="34"
                    fill="#fbbf24"
                    opacity="0.35"
                    className="station-ping pointer-events-none"
                  />
                )}

                {/* Node 3D Base (Shadow Ring) */}
                <circle
                  r="23"
                  cy="4"
                  fill={ringFill}
                  filter="url(#node3DShadow)"
                />

                {/* Node Main Surface */}
                <circle
                  r="21"
                  fill={bodyFill}
                  stroke={ringFill}
                  strokeWidth="2.5"
                />

                {/* Node Top Specular Highlight */}
                <ellipse
                  cx="0"
                  cy="-7"
                  rx="14"
                  ry="6"
                  fill={highlightFill}
                  opacity="0.75"
                />

                {/* Station Icon / Number / Lock */}
                {isCompleted ? (
                  <g>
                    <text
                      y="6"
                      fontSize="18"
                      textAnchor="middle"
                      fill="#ffffff"
                      filter="drop-shadow(0 1px 1px #065f46)"
                    >
                      ⭐
                    </text>
                  </g>
                ) : isLocked ? (
                  <text
                    y="6"
                    fontSize="15"
                    textAnchor="middle"
                    fill="#475569"
                  >
                    🔒
                  </text>
                ) : (
                  <text
                    y="7"
                    fontFamily="'Baloo 2', 'Be Vietnam Pro', sans-serif"
                    fontWeight="900"
                    fontSize="17"
                    textAnchor="middle"
                    fill="#451a03"
                  >
                    {idx + 1}
                  </text>
                )}

                {/* Station Label Ribbon Under Node */}
                <g transform="translate(0, 32)">
                  <rect
                    x="-42"
                    y="-8"
                    width="84"
                    height="16"
                    rx="8"
                    fill={isCurrent ? '#b45309' : '#ffffff'}
                    stroke={isCurrent ? '#78350f' : '#cbd5e1'}
                    strokeWidth="1.5"
                  />
                  <text
                    y="4"
                    fontFamily="'Baloo 2', 'Be Vietnam Pro', sans-serif"
                    fontWeight="800"
                    fontSize="8.5"
                    textAnchor="middle"
                    fill={isCurrent ? '#fef08a' : '#1e293b'}
                  >
                    {station.title}
                  </text>
                </g>
              </g>
            );
          })}

          {/* ── 6. MASCOT AVATAR STANDING ON ACTIVE STATION ─────────── */}
          <g
            transform={`translate(${activeStation.x}, ${activeStation.y})`}
            onClick={handleBearClick}
            className="cursor-pointer"
          >
            {/* Golden spotlight under bear */}
            <ellipse
              cx="0"
              cy="8"
              rx="24"
              ry="10"
              fill="#fbbf24"
              opacity="0.5"
              filter="url(#glowGold)"
            />

            {/* Ground shadow */}
            <ellipse cx="0" cy="4" rx="20" ry="7" fill="#1e293b" opacity="0.4" />

            {/* Bear Mascot in foreignObject */}
            <foreignObject x="-30" y="-62" width="60" height="60">
              <motion.div
                key={`bear-hop-${bearHopCount}`}
                animate={{
                  y: [0, -12, 0],
                  scale: [1, 1.1, 1],
                  rotate: [0, -4, 4, 0],
                }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="w-full h-full flex items-center justify-center drop-shadow-md"
              >
                <div className="w-[56px] h-[56px] bear-wobble">
                  <BearMascot type={bearType} size={56} />
                </div>
              </motion.div>
            </foreignObject>

            {/* Playful Speech Bubble */}
            <foreignObject x="-75" y="-114" width="150" height="50">
              <div
                // @ts-expect-error xmlns required
                xmlns="http://www.w3.org/1999/xhtml"
                className="flex flex-col items-center pointer-events-none"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  key={speechText}
                  className="bg-white/95 border-2 border-amber-800 px-2.5 py-1 rounded-xl shadow-md text-center max-w-[140px]"
                >
                  <p className="text-[10px] font-black text-amber-950 leading-tight">
                    {speechText}
                  </p>
                </motion.div>
                {/* Speech arrow */}
                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-amber-800 -mt-[1px]" />
              </div>
            </foreignObject>
          </g>
        </svg>
      </div>

      {/* ── 7. STATION PREVIEW MODAL / DIALOG ───────────────────────── */}
      <AnimatePresence>
        {selectedStation && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-16 inset-x-3 z-40 bg-white/95 backdrop-blur-md rounded-3xl border-3 border-amber-800 p-3.5 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-400 border-2 border-amber-800 flex items-center justify-center text-2xl shadow-sm">
                  {selectedStation.themeIcon}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                      {selectedStation.badge}
                    </span>
                    {completedLevels.includes(selectedStation.id) && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        ✓ Đã vượt qua
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-black text-amber-950 leading-tight mt-0.5">
                    {selectedStation.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedStation(null)}
                className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center hover:bg-amber-200"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-amber-900/80 font-medium mt-2 leading-relaxed">
              {selectedStation.subtitle}
            </p>

            <div className="mt-3 flex gap-2">
              {selectedStation.id === currentLevelIndex ? (
                <button
                  onClick={() => {
                    playPopSound();
                    setSelectedStation(null);
                    goToQuestion();
                  }}
                  className="btn-pop flex-1 py-2.5 rounded-xl bg-amber-500 text-white font-black text-xs uppercase tracking-wider border-2 border-amber-800 shadow-[0_3px_0_#78350f] flex items-center justify-center gap-1.5"
                >
                  <span>🐾</span>
                  <span>Vào thử thách ngay</span>
                </button>
              ) : completedLevels.includes(selectedStation.id) ? (
                <button
                  onClick={() => {
                    playPopSound();
                    setSelectedStation(null);
                    viewLevelKnowledge(selectedStation.id);
                  }}
                  className="btn-pop flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-wider border-2 border-emerald-900 shadow-[0_3px_0_#064e3b] flex items-center justify-center gap-1.5"
                >
                  <span>📖</span>
                  <span>Xem lại kiến thức</span>
                </button>
              ) : (
                <div className="flex-1 py-2.5 rounded-xl bg-slate-200 text-slate-500 font-black text-xs uppercase tracking-wider border-2 border-slate-300 flex items-center justify-center gap-1.5 cursor-not-allowed">
                  <span>🔒</span>
                  <span>Trạm chưa mở khóa</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 8. BOTTOM DOCK (Candy Tactile Action Bar) ───────────────── */}
      <footer className="shrink-0 px-4 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 border-t-4 border-amber-800 shadow-[0_-4px_10px_rgba(0,0,0,0.15)] flex items-center justify-between gap-3 z-30">
        <div>
          <div className="text-[10px] font-black text-amber-900 uppercase tracking-wider leading-none">
            Chặng hiện tại
          </div>
          <div className="text-sm font-black text-amber-950 leading-tight">
            Trạm {currentLevelIndex + 1}: {activeStation.title}
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            playPopSound();
            goToQuestion();
          }}
          className="btn-pop px-5 py-2.5 rounded-2xl bg-emerald-600 text-white font-black text-sm uppercase tracking-wider border-3 border-emerald-900 shadow-[0_4px_0_#064e3b] flex items-center gap-2 shine-scan"
        >
          <span>Khám Phá</span>
          <span className="text-base leading-none">▶</span>
        </motion.button>
      </footer>

      {/* ── 9. SETTINGS MODAL (Chỉ gồm: Âm lượng nhạc nền & Chơi lại từ đầu) ──── */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-gradient-to-b from-[#fef3c7] via-[#fde68a] to-[#fed7aa] rounded-3xl border-3 border-amber-800 p-5 shadow-2xl flex flex-col gap-4 text-amber-950"
            >
              <div className="flex items-center justify-between border-b-2 border-amber-800/20 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⚙️</span>
                  <h3 className="font-black text-base uppercase tracking-wide">
                    Tùy chọn
                  </h3>
                </div>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="w-7 h-7 rounded-full bg-amber-200 border-2 border-amber-800 text-amber-900 font-black text-xs flex items-center justify-center hover:bg-amber-300"
                >
                  ✕
                </button>
              </div>

              {/* Âm lượng nhạc nền */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-black uppercase text-amber-900 tracking-wider">
                    🎵 Âm lượng nhạc nền
                  </label>
                  <span className="text-xs font-black text-amber-900">
                    {Math.round(musicVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={musicVolume}
                  onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Chơi lại từ đầu */}
              <div className="pt-2 border-t-2 border-amber-800/20 flex flex-col gap-2">
                <button
                  onClick={handleRestart}
                  className="btn-pop w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-wider border-2 border-rose-900 shadow-[0_3px_0_#881337] flex items-center justify-center gap-1.5"
                >
                  <span>🔄</span>
                  <span>Chơi lại từ đầu (Reset game)</span>
                </button>
                <p className="text-[10px] text-center text-amber-900/70 font-bold">
                  Bắt đầu lại từ Trạm 1 với điểm số mới.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
