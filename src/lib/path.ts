/**
 * path.ts
 * Defines the SVG map path and station positions for the bear's journey.
 * Stations are distributed evenly along a cubic bezier-style winding path.
 */

export interface Station {
  id: number;
  x: number;
  y: number;
  labelX: number;
  labelY: number;
}

// viewBox: 0 0 400 700
// Winding path points for each station (8 stations)
export const STATIONS: Station[] = [
  { id: 1, x: 320, y: 650, labelX: 345, labelY: 650 },
  { id: 2, x: 100, y: 560, labelX: 55,  labelY: 555 },
  { id: 3, x: 280, y: 465, labelX: 305, labelY: 465 },
  { id: 4, x: 80,  y: 375, labelX: 35,  labelY: 370 },
  { id: 5, x: 300, y: 285, labelX: 325, labelY: 280 },
  { id: 6, x: 110, y: 200, labelX: 60,  labelY: 195 },
  { id: 7, x: 270, y: 120, labelX: 295, labelY: 115 },
  { id: 8, x: 80,  y: 40,  labelX: 35,  labelY: 35  },
];

// SVG path connecting all stations in a winding pattern
export const MAP_PATH =
  'M 320 650 ' +
  'C 320 610, 100 600, 100 560 ' +
  'C 100 520, 280 505, 280 465 ' +
  'C 280 425, 80 415, 80 375 ' +
  'C 80 335, 300 325, 300 285 ' +
  'C 300 245, 110 240, 110 200 ' +
  'C 110 165, 270 155, 270 120 ' +
  'C 270 85, 80 75, 80 40';

export const MAP_VIEWBOX = '0 0 400 700';
