import { COLS, SHAPES, COLORS } from './constants.js';

export class Piece {
  constructor(typeId) {
    this.typeId = typeId;
    this.shape = SHAPES[typeId].map(row => [...row]);
    this.color = COLORS[typeId];

    // Position centered at top
    this.x = Math.floor(COLS / 2) - Math.floor(this.shape[0].length / 2);
    this.y = 0;
  }

  // Clone this piece for calculating ghost piece
  clone() {
    const cloned = new Piece(this.typeId);
    cloned.shape = this.shape.map(row => [...row]);
    cloned.x = this.x;
    cloned.y = this.y;
    return cloned;
  }

  // Move down
  moveDown() {
    this.y++;
  }

  // Move horizontally
  move(dir) {
    this.x += dir;
  }

  // Rotate piece matrix clockwise 90 degrees
  rotate() {
    // Clone matrix to easily rotate without mutating original immediately
    const matrix = this.shape;
    const len = matrix.length;
    const rotated = Array.from({ length: len }, () => Array(len).fill(0));

    // Transpose and reverse rows (classic 90 degree clockwise matrix rotation)
    for (let i = 0; i < len; ++i) {
      for (let j = 0; j < len; ++j) {
        rotated[j][len - 1 - i] = matrix[i][j];
      }
    }

    this.shape = rotated;
  }

  // Undo rotation (counter-clockwise) if collision occurs after rotation
  undoRotate() {
    const matrix = this.shape;
    const len = matrix.length;
    const reversed = Array.from({ length: len }, () => Array(len).fill(0));

    // Reverse transpose (90 degree counter-clockwise)
    for (let i = 0; i < len; ++i) {
      for (let j = 0; j < len; ++j) {
        reversed[len - 1 - j][i] = matrix[i][j];
      }
    }
    this.shape = reversed;
  }
}
