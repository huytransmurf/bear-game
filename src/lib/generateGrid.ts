/**
 * generateGrid.ts
 * Generates a word-search grid with the answer word placed in a random direction,
 * plus distractor words and random letter fill.
 * Uses a simple seeded PRNG so each level always gets the same layout.
 */

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// Seeded LCG random number generator (deterministic per seed)
function makePrng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0x100000000;
  };
}

type Direction = [number, number]; // [rowDelta, colDelta]

// Chỉ cho phép 2 hướng đọc tự nhiên thuận mắt người (Human-readable):
// 1. [0, 1]: Từ trái sang phải (Ngang)
// 2. [1, 0]: Từ trên xuống dưới (Dọc)
const DIRECTIONS: Direction[] = [
  [0, 1], // Trái sang phải
  [1, 0], // Trên xuống dưới
];

export interface GridResult {
  grid: string[][];
  size: number;
  answerCells: { row: number; col: number }[];
}

export function generateGrid(
  answer: string,
  seed: number,
  size = 10,
  distractors: string[] = []
): GridResult {
  const rand = makePrng(seed);
  const word = answer.toUpperCase().replace(/\s/g, '');

  // Initialize empty grid
  const grid: string[][] = Array.from({ length: size }, () =>
    Array(size).fill('')
  );

  const dirs = DIRECTIONS;

  function canPlace(w: string, row: number, col: number, dir: Direction): boolean {
    for (let i = 0; i < w.length; i++) {
      const r = row + dir[0] * i;
      const c = col + dir[1] * i;
      if (r < 0 || r >= size || c < 0 || c >= size) return false;
      if (grid[r][c] !== '' && grid[r][c] !== w[i]) return false;
    }
    return true;
  }

  function placeWord(w: string, row: number, col: number, dir: Direction): { row: number; col: number }[] {
    const cells: { row: number; col: number }[] = [];
    for (let i = 0; i < w.length; i++) {
      const r = row + dir[0] * i;
      const c = col + dir[1] * i;
      grid[r][c] = w[i];
      cells.push({ row: r, col: c });
    }
    return cells;
  }

  // Place main answer word
  let answerCells: { row: number; col: number }[] = [];
  let placed = false;
  const maxTries = 100;

  for (let attempt = 0; attempt < maxTries && !placed; attempt++) {
    const dir = dirs[Math.floor(rand() * dirs.length)];
    const row = Math.floor(rand() * size);
    const col = Math.floor(rand() * size);
    if (canPlace(word, row, col, dir)) {
      answerCells = placeWord(word, row, col, dir);
      placed = true;
    }
  }

  // Fallback: guaranteed placement if random tries didn't fit
  if (!placed) {
    for (const dir of dirs) {
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (canPlace(word, r, c, dir)) {
            answerCells = placeWord(word, r, c, dir);
            placed = true;
            break;
          }
        }
        if (placed) break;
      }
      if (placed) break;
    }
  }

  // Place distractors (best effort)
  for (const d of distractors) {
    const dWord = d.toUpperCase().replace(/\s/g, '');
    for (let attempt = 0; attempt < 50; attempt++) {
      const dir = dirs[Math.floor(rand() * dirs.length)];
      const row = Math.floor(rand() * size);
      const col = Math.floor(rand() * size);
      if (canPlace(dWord, row, col, dir)) {
        placeWord(dWord, row, col, dir);
        break;
      }
    }
  }

  // Fill remaining cells with random letters
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = ALPHABET[Math.floor(rand() * ALPHABET.length)];
      }
    }
  }

  return { grid, size, answerCells };
}
