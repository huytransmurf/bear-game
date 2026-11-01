import { type PointerEvent, useState, useCallback, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { generateGrid } from '../lib/generateGrid';
import { playPopSound, playCorrectSound, playWrongSound } from '../lib/sound';

interface SelectedCell {
  row: number;
  col: number;
}

export default function WordGrid() {
  const { currentLevelIndex, submitAnswer, attemptsLeft, hintUsed, useHint, levels } = useGameStore();
  const level = levels[currentLevelIndex] || levels[0];

  const answer = level?.answer || '';
  const distractors = level?.distractors || [];
  const levelId = level?.id || 1;

  const { grid, size, answerCells } = useMemo(
    () =>
      generateGrid(
        answer,
        levelId * 137,
        10,
        distractors
      ),
    [answer, levelId, distractors]
  );

  const answerWord = answer.toUpperCase().replace(/\s/g, '');

  const [selecting, setSelecting] = useState(false);
  const [startCell, setStartCell] = useState<SelectedCell | null>(null);
  const [endCell, setEndCell] = useState<SelectedCell | null>(null);
  const [selectedCells, setSelectedCells] = useState<SelectedCell[]>([]);
  const [wrongShake, setWrongShake] = useState(false);
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const lastCellCount = useRef<number>(0);

  // Derive selected cells from start+end (straight line only: horiz, vert, diag)
  const getLineCells = (a: SelectedCell, b: SelectedCell): SelectedCell[] => {
    const dr = Math.sign(b.row - a.row);
    const dc = Math.sign(b.col - a.col);
    const maxSteps = Math.max(Math.abs(b.row - a.row), Math.abs(b.col - a.col));
    const rowDiff = Math.abs(b.row - a.row);
    const colDiff = Math.abs(b.col - a.col);

    if (rowDiff !== 0 && colDiff !== 0 && rowDiff !== colDiff) {
      return [a];
    }
    const cells: SelectedCell[] = [];
    for (let i = 0; i <= maxSteps; i++) {
      cells.push({ row: a.row + dr * i, col: a.col + dc * i });
    }
    return cells;
  };

  const checkAnswer = useCallback(
    (cells: SelectedCell[]) => {
      const word = cells.map((c) => grid[c.row][c.col]).join('');
      const wordRev = [...cells].reverse().map((c) => grid[c.row][c.col]).join('');

      if (word === answerWord || wordRev === answerWord) {
        const found = new Set<string>(cells.map((c) => `${c.row},${c.col}`));
        setFoundCells(found);
        setResult('correct');
        playCorrectSound();
        setTimeout(() => submitAnswer(true), 900);
      } else {
        setResult('wrong');
        setWrongShake(true);
        playWrongSound();
        setTimeout(() => {
          setWrongShake(false);
          setResult(null);
          setSelectedCells([]);
          setStartCell(null);
          setEndCell(null);
          submitAnswer(false);
        }, 750);
      }
    },
    [grid, answerWord, submitAnswer]
  );

  const getCellFromPoint = (clientX: number, clientY: number): SelectedCell | null => {
    if (!gridRef.current) return null;
    const target = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    const el = target?.closest('[data-row]') as HTMLElement | null;
    if (!el?.dataset?.row) return null;
    return { row: parseInt(el.dataset.row ?? '0', 10), col: parseInt(el.dataset.col ?? '0', 10) };
  };

  const handlePointerDown = (row: number, col: number) => {
    setSelecting(true);
    setStartCell({ row, col });
    setEndCell({ row, col });
    setSelectedCells([{ row, col }]);
    lastCellCount.current = 1;
    setResult(null);
    playPopSound();
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!selecting || !startCell) return;
    const cell = getCellFromPoint(e.clientX, e.clientY);
    if (!cell) return;
    if (cell.row === endCell?.row && cell.col === endCell?.col) return;

    setEndCell(cell);
    const line = getLineCells(startCell, cell);
    setSelectedCells(line);

    if (line.length !== lastCellCount.current) {
      lastCellCount.current = line.length;
      playPopSound();
    }
  };

  const handlePointerUp = () => {
    if (!selecting) return;
    setSelecting(false);
    if (selectedCells.length > 1) {
      checkAnswer(selectedCells);
    } else {
      setSelectedCells([]);
      setStartCell(null);
      setEndCell(null);
    }
  };

  const isSelected = (row: number, col: number) =>
    selectedCells.some((c) => c.row === row && c.col === col);

  const isFound = (row: number, col: number) => foundCells.has(`${row},${col}`);

  const isHintCell = (row: number, col: number) => {
    if (!hintUsed || answerCells.length === 0) return false;
    const first = answerCells[0];
    return first.row === row && first.col === col;
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
      {/* Top hint bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 bg-amber-900/10 px-3 py-1 rounded-full border border-amber-800/20 text-xs font-bold text-amber-900">
          <span>Vuốt để nối chữ</span>
          <span className="text-amber-600">→</span>
        </div>

        {!hintUsed && attemptsLeft < 3 && (
          <button
            onClick={() => {
              playPopSound();
              useHint();
            }}
            className="btn-pop px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-amber-950 border-2 border-amber-700 shadow-[0_2px_0_#78350f] flex items-center gap-1"
          >
            <span>💡</span> Gợi ý (-20đ)
          </button>
        )}
      </div>

      {/* Grid container */}
      <div className="bg-amber-100 p-2.5 sm:p-3 rounded-2xl border-4 border-amber-800 shadow-[0_6px_0_#78350f]">
        <motion.div
          ref={gridRef}
          animate={wrongShake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="select-none"
          style={{ touchAction: 'none' }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => {
            if (selecting) handlePointerUp();
          }}
        >
          <div
            className="grid gap-1 sm:gap-1.5 w-full"
            style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
          >
            {grid.map((row, ri) =>
              row.map((letter, ci) => {
                const sel = isSelected(ri, ci);
                const found = isFound(ri, ci);
                const hint = isHintCell(ri, ci);

                let cellStyle = 'bg-amber-50 text-amber-950 border-amber-300 shadow-[0_2px_0_#d97706]';

                if (found) {
                  cellStyle = 'bg-emerald-500 text-white border-emerald-700 shadow-[0_2px_0_#065f46] scale-105';
                } else if (sel && result === 'wrong') {
                  cellStyle = 'bg-rose-500 text-white border-rose-800 shadow-[0_2px_0_#9f1239]';
                } else if (sel) {
                  cellStyle = 'bg-amber-400 text-amber-950 border-amber-700 shadow-[0_2px_0_#92400e] scale-105';
                } else if (hint) {
                  cellStyle = 'bg-sky-200 text-sky-900 border-sky-500 shadow-[0_2px_0_#0284c7] animate-bounce';
                }

                return (
                  <div
                    key={`${ri}-${ci}`}
                    data-row={ri}
                    data-col={ci}
                    onPointerDown={() => handlePointerDown(ri, ci)}
                    className={`
                      aspect-square flex items-center justify-center
                      rounded-lg font-black cursor-pointer
                      border-2 transition-transform duration-75 select-none
                      text-xs sm:text-sm md:text-base leading-none
                      ${cellStyle}
                    `}
                    style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                  >
                    {letter}
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* Target Word Display / Mystery Slots */}
      <div className="flex flex-col items-center justify-center mt-1">
        <div className="text-[11px] font-black uppercase tracking-wider text-amber-900/60 mb-1">
          Từ cần tìm ({answerWord.length} chữ cái)
        </div>
        <div className="flex justify-center gap-1.5 flex-wrap">
          {answerWord.split('').map((char, i) => {
            const revealed = foundCells.size > 0;
            return (
              <motion.div
                key={i}
                initial={{ scale: 0.8 }}
                animate={{ scale: revealed ? [1, 1.2, 1] : 1 }}
                className={`w-7 h-8 rounded-lg flex items-center justify-center font-black text-sm border-2 transition-all ${
                  revealed
                    ? 'bg-emerald-400 border-emerald-700 text-emerald-950 shadow-[0_2px_0_#065f46]'
                    : 'bg-amber-100/80 border-amber-300 text-amber-800 shadow-[0_2px_0_#d97706]'
                }`}
              >
                {revealed ? char : '_'}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
