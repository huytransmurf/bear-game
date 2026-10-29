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
  landmark: 'beehive' | 'ancient-tree' | 'free-stream' | 'nursery' | 'ranger-station' | 'red-book' | 'shield' | 'sanctuary-gate';
  badge: string;
}

export const MAP_STATIONS: StationData[] = [
  {
    id: 0,
    x: 190,
    y: 115,
    title: 'Tổ Ong Rừng',
    subtitle: 'Khám phá loài Gấu Chó nhỏ nhất thế giới',
    themeIcon: '🍯',
    landmark: 'beehive',
    badge: 'Chặng 1',
  },
  {
    id: 1,
    x: 280,
    y: 245,
    title: 'Rừng Khộp Núi Cao',
    subtitle: 'Gấu Ngựa dũng mãnh và biệt tài leo cây',
    themeIcon: '🌲',
    landmark: 'ancient-tree',
    badge: 'Chặng 2',
  },
  {
    id: 2,
    x: 95,
    y: 375,
    title: 'Suối Nước Tự Do',
    subtitle: 'Nói không với nuôi nhốt hút mật tàn nhẫn',
    themeIcon: '🔓',
    landmark: 'free-stream',
    badge: 'Chặng 3',
  },
  {
    id: 3,
    x: 285,
    y: 505,
    title: 'Đồi Mầm Tái Sinh',
    subtitle: 'Bảo vệ mái nhà rừng xanh trước nạn chặt phá',
    themeIcon: '🌱',
    landmark: 'nursery',
    badge: 'Chặng 4',
  },
  {
    id: 4,
    x: 95,
    y: 635,
    title: 'Trạm Kiểm Lâm Rừng',
    subtitle: 'Gọi ngay đường dây nóng 1800 599 954',
    themeIcon: '📢',
    landmark: 'ranger-station',
    badge: 'Chặng 5',
  },
  {
    id: 5,
    x: 285,
    y: 765,
    title: 'Đảo Sách Đỏ',
    subtitle: 'Liên minh bảo tồn thiên nhiên quốc tế IUCN',
    themeIcon: '📜',
    landmark: 'red-book',
    badge: 'Chặng 6',
  },
  {
    id: 6,
    x: 100,
    y: 895,
    title: 'Thành Trì CITES',
    subtitle: 'Công ước ngăn chặn buôn bán xuyên quốc gia',
    themeIcon: '🛡️',
    landmark: 'shield',
    badge: 'Chặng 7',
  },
  {
    id: 7,
    x: 190,
    y: 1030,
    title: 'Khu Cứu Hộ Gấu',
    subtitle: 'Mái nhà bình yên & tự do cho các bạn gấu',
    themeIcon: '🏆',
    landmark: 'sanctuary-gate',
    badge: 'Đích Đến',
  },
];

// Continuous bezier curve passing directly through the 8 stations
const SMOOTH_TRAIL_PATH =
  'M 190,115 ' +
  'C 265,125 315,185 280,245 ' +
  'C 245,305 90,305 95,375 ' +
  'C 100,445 295,435 285,505 ' +
  'C 275,575 90,565 95,635 ' +
  'C 100,705 295,695 285,765 ' +
  'C 275,835 90,825 100,895 ' +
  'C 105,965 145,1005 190,1030';

// Cobblestones along the trail for tactile cartoon feel
const COBBLESTONES = [
  { x: 230, y: 140, r: 4 },
  { x: 275, y: 175, r: 5 },
  { x: 295, y: 210, r: 4.5 },
  { x: 235, y: 280, r: 5 },
  { x: 175, y: 310, r: 4 },
  { x: 120, y: 335, r: 4.5 },
  { x: 120, y: 415, r: 5 },
  { x: 180, y: 445, r: 4.5 },
  { x: 250, y: 470, r: 4 },
  { x: 260, y: 545, r: 5 },
  { x: 195, y: 575, r: 4.5 },
  { x: 130, y: 600, r: 4 },
  { x: 135, y: 675, r: 5 },
  { x: 195, y: 705, r: 4 },
  { x: 255, y: 735, r: 4.5 },
  { x: 250, y: 805, r: 5 },
  { x: 185, y: 835, r: 4.5 },
  { x: 130, y: 860, r: 4 },
  { x: 135, y: 940, r: 5 },
  { x: 165, y: 980, r: 4.5 },
];

// Bear paws stamped on the trail
const PAW_PRINTS = [
  { x: 250, y: 155, rot: 50 },
  { x: 260, y: 295, rot: -110 },
  { x: 150, y: 320, rot: -140 },
  { x: 150, y: 430, rot: 40 },
  { x: 220, y: 455, rot: 30 },
  { x: 230, y: 560, rot: -120 },
  { x: 160, y: 585, rot: -130 },
  { x: 160, y: 690, rot: 35 },
  { x: 230, y: 715, rot: 30 },
  { x: 220, y: 820, rot: -120 },
  { x: 150, y: 845, rot: -130 },
  { x: 145, y: 955, rot: 45 },
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
    levels,
  } = useGameStore();

  const stations = MAP_STATIONS.map((station, idx) => {
    const lvl = levels[idx];
    if (!lvl) return station;
    return {
      ...station,
      title: lvl.stationTitle || station.title,
      subtitle: lvl.stationSubtitle || station.subtitle,
      themeIcon: lvl.themeIcon || station.themeIcon,
      badge: lvl.badge || station.badge,
    };
  });

  const [selectedStation, setSelectedStation] = useState<StationData | null>(null);
  const [speechText, setSpeechText] = useState<string>(BEAR_PHRASES[0]);
  const [bearHopCount, setBearHopCount] = useState<number>(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const activeStation = stations[currentLevelIndex] || stations[0];

  // Auto-scroll to current station on level change
  useEffect(() => {
    if (scrollRef.current) {
      const svgH = 1160;
      const containerH = scrollRef.current.clientHeight;
      const scrollableH = scrollRef.current.scrollHeight;
      const scrollY = (activeStation.y / svgH) * scrollableH - containerH / 2;
      scrollRef.current.scrollTo({ top: Math.max(0, scrollY), behavior: 'smooth' });
    }
  }, [currentLevelIndex, activeStation.y]);

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

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#38bdf8] via-[#86efac] to-[#fef08a] overflow-hidden select-none relative font-sans">
      {/* ── TOP HEADER (Tactile cartoon banner) ────────────────────────── */}
      <header className="flex items-center justify-between px-3 pr-14 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 border-b-4 border-amber-800 shadow-md shrink-0 z-30">
        {/* Player Badge */}
        <div className="flex items-center gap-2">
          <div
            onClick={handleBearClick}
            className="w-10 h-10 rounded-2xl bg-amber-100 border-2 border-amber-800 shadow-[0_2px_0_#78350f] p-0.5 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            title="Bấm vào tớ nè!"
          >
            <BearMascot type={bearType} size={36} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase text-amber-900 tracking-wider leading-none">
              Nhà thám hiểm
            </div>
            <div className="text-sm font-black text-amber-950 leading-tight">
              {playerName || 'Bạn Gấu Nhỏ'}
            </div>
          </div>
        </div>

        {/* Level Counter Banner */}
        <div className="bg-white/90 border-2 border-amber-800 px-3 py-1 rounded-2xl shadow-[0_2px_0_#78350f]">
          <div className="text-xs font-black text-amber-950 flex items-center gap-1">
            <span>📍</span>
            <span>Trạm {currentLevelIndex + 1}/{stations.length}</span>
          </div>
        </div>

        {/* Honey Score & Leaderboard */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              playPopSound();
              openLeaderboard();
            }}
            className="btn-pop w-8 h-8 rounded-xl bg-amber-200 border-2 border-amber-800 flex items-center justify-center text-sm shadow-[0_2px_0_#78350f]"
            title="Bảng xếp hạng"
          >
            🏆
          </button>

          <div className="flex items-center gap-1.5 bg-amber-900/10 border border-amber-800/30 px-2 py-1 rounded-2xl">
            <span className="text-sm">🍯</span>
            <div className="text-right">
              <div className="text-[8px] font-black text-amber-900 uppercase leading-none">Mật điểm</div>
              <div className="text-xs font-black text-amber-950 leading-none sparkle">{score}</div>
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
          viewBox="0 0 380 1160"
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
            d="M -20,380 C 120,350 200,430 400,390"
            fill="none"
            stroke="url(#riverGrad)"
            strokeWidth="38"
            strokeLinecap="round"
            opacity="0.85"
          />
          <path
            d="M -20,380 C 120,350 200,430 400,390"
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
            d={SMOOTH_TRAIL_PATH}
            fill="none"
            stroke="#5c2c08"
            strokeWidth="34"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Earth Bed */}
          <path
            d={SMOOTH_TRAIL_PATH}
            fill="none"
            stroke="#92400e"
            strokeWidth="26"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Sandy Bright Path */}
          <path
            d={SMOOTH_TRAIL_PATH}
            fill="none"
            stroke="url(#trailSandGrad)"
            strokeWidth="18"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Cobblestones along path */}
          {COBBLESTONES.map((cobble, idx) => (
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
          ))}

          {/* Stamped Bear Paw Prints */}
          {PAW_PRINTS.map((paw, idx) => (
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
          ))}

          {/* Animated Golden Sun Dash Trail */}
          <path
            d={SMOOTH_TRAIL_PATH}
            fill="none"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
            className="animated-trail"
            opacity="0.9"
          />

          {/* Wooden Bridge at River Crossing (near y: 380) */}
          <g transform="translate(95, 375)">
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
          {/* Landmark 1: Beehive on tree branch */}
          <g transform="translate(255, 95)" className="tree-sway">
            <path d="M 0,0 Q 20,-10 40,5" stroke="#78350f" strokeWidth="5" fill="none" strokeLinecap="round" />
            {/* Honeycomb */}
            <g transform="translate(30, 8)">
              <ellipse cx="0" cy="0" rx="9" ry="7" fill="#f59e0b" stroke="#78350f" strokeWidth="2" />
              <ellipse cx="0" cy="5" rx="8" ry="6" fill="#fbbf24" stroke="#78350f" strokeWidth="2" />
              <ellipse cx="0" cy="10" rx="6" ry="5" fill="#f59e0b" stroke="#78350f" strokeWidth="2" />
              {/* Dripping honey */}
              <circle cx="0" cy="17" r="2.5" fill="#fbbf24" className="honey-drip" />
            </g>
            {/* Little Bee */}
            <g transform="translate(18, -2)">
              <ellipse cx="0" cy="0" rx="4" ry="3" fill="#fde047" stroke="#000" strokeWidth="1" />
              <line x1="-1" y1="-3" x2="-1" y2="3" stroke="#000" strokeWidth="1" />
              <line x1="1" y1="-3" x2="1" y2="3" stroke="#000" strokeWidth="1" />
            </g>
          </g>

          {/* Landmark 2: Tall Mountain Pine Trees */}
          <g transform="translate(340, 230)" className="tree-sway">
            <rect x="-3" y="15" width="6" height="15" fill="#78350f" rx="1.5" />
            <polygon points="0,-18 -18,0 -8,0 -22,16 22,16 8,0 18,0" fill="#15803d" stroke="#14532d" strokeWidth="2" />
            <circle cx="0" cy="-6" r="3" fill="#86efac" opacity="0.6" />
          </g>

          {/* Landmark 3: Broken Cage / Freedom Butterfly */}
          <g transform="translate(40, 360)">
            {/* Broken cage bars */}
            <rect x="-8" y="-12" width="16" height="20" fill="none" stroke="#64748b" strokeWidth="2.5" rx="2" />
            <line x1="-2" y1="-12" x2="-2" y2="8" stroke="#64748b" strokeWidth="2" />
            <path d="M 2,-12 L 6,-2" stroke="#64748b" strokeWidth="2" />
            {/* Golden lock broken */}
            <rect x="-4" y="6" width="8" height="6" fill="#facc15" stroke="#a16207" strokeWidth="1.5" rx="1" />
          </g>

          {/* Landmark 4: Nursery Sapling with sunflower */}
          <g transform="translate(345, 495)">
            <ellipse cx="0" cy="12" rx="10" ry="4" fill="#78350f" />
            {/* Sapling stem */}
            <path d="M 0,12 Q 3,0 0,-10" stroke="#16a34a" strokeWidth="3" fill="none" strokeLinecap="round" />
            <ellipse cx="-6" cy="-2" rx="5" ry="3" fill="#4ade80" transform="rotate(-30, -6, -2)" />
            <ellipse cx="6" cy="-5" rx="5" ry="3" fill="#4ade80" transform="rotate(30, 6, -5)" />
            {/* Little flower */}
            <circle cx="0" cy="-14" r="5" fill="#fde047" stroke="#eab308" strokeWidth="1.5" />
          </g>

          {/* Landmark 5: Ranger Station Watchtower */}
          <g transform="translate(40, 615)">
            {/* Stilts */}
            <line x1="-8" y1="12" x2="-4" y2="-4" stroke="#78350f" strokeWidth="2" />
            <line x1="8" y1="12" x2="4" y2="-4" stroke="#78350f" strokeWidth="2" />
            {/* Cabin */}
            <rect x="-10" y="-14" width="20" height="12" fill="#d97706" stroke="#78350f" strokeWidth="2" rx="2" />
            <polygon points="-13,-14 0,-24 13,-14" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
            {/* Megaphone */}
            <circle cx="6" cy="-8" r="2" fill="#facc15" />
          </g>

          {/* Landmark 6: Ancient Red Book Stone Pillar */}
          <g transform="translate(340, 755)">
            <rect x="-8" y="-14" width="16" height="24" fill="#94a3b8" stroke="#475569" strokeWidth="2" rx="3" />
            <rect x="-6" y="-11" width="12" height="18" fill="#e2e8f0" rx="1" />
            {/* Red Bookmark */}
            <rect x="-2" y="-13" width="4" height="12" fill="#ef4444" />
          </g>

          {/* Landmark 7: Protective Shield & Wooden Fence */}
          <g transform="translate(42, 885)">
            {/* Wooden palisade fence */}
            <rect x="-12" y="-6" width="6" height="16" fill="#b45309" stroke="#78350f" strokeWidth="1.5" rx="1" />
            <rect x="-4" y="-10" width="6" height="20" fill="#b45309" stroke="#78350f" strokeWidth="1.5" rx="1" />
            <rect x="4" y="-6" width="6" height="16" fill="#b45309" stroke="#78350f" strokeWidth="1.5" rx="1" />
            {/* Shield */}
            <path d="M 0,-4 Q 8,-4 8,4 Q 8,12 0,16 Q -8,12 -8,4 Q -8,-4 0,-4 Z" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.5" />
            <circle cx="0" cy="5" r="2.5" fill="#facc15" />
          </g>

          {/* Landmark 8: Grand Sanctuary Victory Gate */}
          <g transform="translate(190, 975)">
            {/* Gate Arch */}
            <path d="M -32,20 L -32,-8 Q 0,-28 32,-8 L 32,20" fill="none" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
            {/* Bunting Garland */}
            <path d="M -30,-4 Q 0,8 30,-4" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
            {[-20, -10, 0, 10, 20].map((bx, i) => {
              const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];
              return (
                <polygon
                  key={i}
                  points={`${bx},0 ${bx + 6},0 ${bx + 3},8`}
                  fill={colors[i]}
                  className="flag-wave"
                />
              );
            })}
            {/* Welcome Signboard */}
            <rect x="-26" y="-28" width="52" height="14" fill="#fde047" stroke="#b45309" strokeWidth="2" rx="3" />
            <text x="0" y="-18" fontSize="8" fontWeight="900" fill="#78350f" textAnchor="middle" fontFamily="Fredoka, sans-serif">
              VIỆT NAM SANCTUARY
            </text>
          </g>

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
                    fontFamily="Fredoka, sans-serif"
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
                    fontFamily="Fredoka, sans-serif"
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
    </div>
  );
}
