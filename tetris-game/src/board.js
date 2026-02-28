import { ROWS, COLS } from './constants.js';
import { Piece } from './piece.js';

export class Board {
  constructor() {
    this.grid = this.getEmptyGrid();
  }

  // Returns empty 2D array [ROWS][COLS]
  getEmptyGrid() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  }

  // Reset the board
  reset() {
    this.grid = this.getEmptyGrid();
  }

  // Check valid position for a piece (collisions and bounds)
  isValid(piece) {
    return piece.shape.every((row, dy) => {
      return row.every((value, dx) => {
        let x = piece.x + dx;
        let y = piece.y + dy;
        return (
          value === 0 ||
          (this.isInsideWalls(x) && this.isAboveFloor(y) && this.notOccupied(x, y))
        );
      });
    });
  }

  // Check bounds constraints
  isInsideWalls(x) {
    return x >= 0 && x < COLS;
  }

  isAboveFloor(y) {
    return y < ROWS;
  }

  // Check if grid cell is empty
  notOccupied(x, y) {
    return y < 0 || this.grid[y][x] === 0; // Allow starting off-screen at top
  }

  // Lock piece into board grid
  lock(piece) {
    let gameOver = false;
    piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          if (piece.y + y < 0) {
             gameOver = true;
          } else {
             this.grid[piece.y + y][piece.x + x] = value;
          }
        }
      });
    });
    return gameOver;
  }

  // Clear completed lines and return number of cleared lines
  clearLines() {
    let linesCleared = 0;

    // Find completely filled rows
    this.grid.forEach((row, y) => {
      if (row.every(value => value > 0)) {
        linesCleared++;
        this.grid.splice(y, 1);
        this.grid.unshift(Array(COLS).fill(0));
      }
    });

    return linesCleared;
  }

  // Drop piece clone to floor for ghost calculation
  getGhost(piece) {
    const ghost = piece.clone();
    // Drop ghost until it hits something
    while (this.isValid(ghost)) {
      ghost.moveDown();
    }
    // Move up one to be valid
    ghost.y -= 1;
    return ghost;
  }
}
