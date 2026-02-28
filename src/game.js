import { Board } from './board.js';
import { Piece } from './piece.js';
import { POINTS, LINES_PER_LEVEL, START_SPEED, LOCK_DELAY } from './constants.js';
import { random, shuffle, getStorage, setStorage } from './utils.js';

export class Game {
  constructor() {
    this.board = new Board();
    this.piece = null;
    this.nextPiece = null;
    this.holdPiece = null;

    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.combo = 0;
    this.highScore = getStorage('tetrisHighScore', 0);

    this.canHold = true;
    this.isPaused = false;
    this.isGameOver = false;

    // Time-based dropping
    this.lastDropTime = 0;
    this.dropInterval = START_SPEED;

    // Lock delay
    this.lockTimeout = null;
    this.isLocking = false;
    this.clearingLines = false;

    this.bag = [];
    this.spawnNext();
  }

  // Refill bag with shuffled 7 pieces
  fillBag() {
    this.bag = [1, 2, 3, 4, 5, 6, 7];
    shuffle(this.bag);
  }

  // Get next piece from bag
  getNextTypeId() {
    if (this.bag.length === 0) {
      this.fillBag();
    }
    return this.bag.pop();
  }

  // Spawn new piece at top
  spawnNext() {
    if (!this.nextPiece) {
       this.nextPiece = new Piece(this.getNextTypeId());
    }

    this.piece = this.nextPiece;
    this.nextPiece = new Piece(this.getNextTypeId());

    // Reset position
    this.piece.y = 0;

    // Check if new piece can spawn
    if (!this.board.isValid(this.piece)) {
      this.gameOver();
    }
  }

  // Handle locking piece
  lockPiece() {
    const isOver = this.board.lock(this.piece);
    if (isOver) {
      this.gameOver();
      return;
    }

    // Check for lines to animate
    let linesToClear = [];
    this.board.grid.forEach((row, y) => {
      if (row.every(value => value > 0)) {
        linesToClear.push(y);
      }
    });

    if (linesToClear.length > 0) {
      this.clearingLines = true;
      this.board.linesToClear = linesToClear;

      setTimeout(() => {
        const cleared = this.board.clearLines();
        this.board.linesToClear = [];
        this.handleLineClear(cleared);
        this.clearingLines = false;
        this.canHold = true;
        this.spawnNext();
      }, 300); // Animation delay
    } else {
      this.combo = 0;
      this.canHold = true;
      this.spawnNext();
    }
  }

  handleLineClear(linesCleared) {
    this.lines += linesCleared;
    this.combo++;

    // Scoring logic
    let scoreMultiplier = 0;
    if (linesCleared === 1) scoreMultiplier = POINTS.SINGLE;
    else if (linesCleared === 2) scoreMultiplier = POINTS.DOUBLE;
    else if (linesCleared === 3) scoreMultiplier = POINTS.TRIPLE;
    else if (linesCleared === 4) scoreMultiplier = POINTS.TETRIS;

    // Base line score
    let baseScore = scoreMultiplier * this.level;

    // Add combo bonus
    let comboBonus = 50 * (this.combo - 1) * this.level;

    this.score += baseScore + comboBonus;

    // Check for level up
    if (this.lines >= this.level * LINES_PER_LEVEL) {
      this.levelUp();
    }
  }

  levelUp() {
    this.level++;
    // Speed up logic
    this.dropInterval = Math.max(100, START_SPEED - (this.level - 1) * 50);
  }

  resetLockDelay() {
    if (this.isLocking) {
      clearTimeout(this.lockTimeout);
      this.isLocking = false;
    }
  }

  // Move right
  moveRight() {
    if (this.isPaused || this.isGameOver || this.clearingLines) return;
    this.piece.move(1);
    if (!this.board.isValid(this.piece)) {
      this.piece.move(-1);
    } else {
      this.resetLockDelay();
    }
  }

  // Move left
  moveLeft() {
    if (this.isPaused || this.isGameOver || this.clearingLines) return;
    this.piece.move(-1);
    if (!this.board.isValid(this.piece)) {
      this.piece.move(1);
    } else {
      this.resetLockDelay();
    }
  }

  // Rotate clockwise
  rotate() {
    if (this.isPaused || this.isGameOver || this.clearingLines) return;
    this.piece.rotate();
    // Wall kick simple implementation (basic collision detection)
    if (!this.board.isValid(this.piece)) {
      this.piece.undoRotate();
    } else {
      this.resetLockDelay();
    }
  }

  // Drop down one step
  drop() {
    if (this.isPaused || this.isGameOver || this.clearingLines) return;

    if (this.isLocking) return; // Wait for lock delay to finish

    this.piece.moveDown();

    if (!this.board.isValid(this.piece)) {
      this.piece.y--; // Revert

      if (!this.isLocking) {
        this.isLocking = true;
        this.lockTimeout = setTimeout(() => {
          if (this.isLocking && !this.isPaused && !this.isGameOver) {
             this.lockPiece();
             this.isLocking = false;
          }
        }, LOCK_DELAY);
      }
    } else {
      this.score += POINTS.SOFT_DROP;
      this.resetLockDelay();
    }
  }

  // Hard drop (Spacebar)
  hardDrop() {
    if (this.isPaused || this.isGameOver || this.clearingLines) return;

    this.resetLockDelay();

    let droppedDistance = 0;
    while (this.board.isValid(this.piece)) {
      this.piece.moveDown();
      droppedDistance++;
    }

    this.piece.y--; // Revert last invalid step

    // Points for hard drop (2 per cell dropped)
    this.score += droppedDistance * POINTS.HARD_DROP;

    this.lockPiece();
  }

  // Hold current piece
  hold() {
    if (this.isPaused || this.isGameOver || !this.canHold || this.clearingLines) return;

    this.resetLockDelay();

    if (this.holdPiece === null) {
      this.holdPiece = new Piece(this.piece.typeId);
      this.spawnNext();
    } else {
      const tempId = this.piece.typeId;
      this.piece = new Piece(this.holdPiece.typeId);
      this.holdPiece = new Piece(tempId);
      this.piece.y = 0;
    }
    this.canHold = false;
  }

  update(time) {
    if (this.isPaused || this.isGameOver || this.clearingLines) return;

    if (time - this.lastDropTime > this.dropInterval) {
      this.drop();
      this.lastDropTime = time;
    }
  }

  togglePause() {
    if (this.isGameOver) return;
    this.isPaused = !this.isPaused;
  }

  gameOver() {
    this.isGameOver = true;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      setStorage('tetrisHighScore', this.highScore);
    }
  }

  restart() {
    this.board.reset();
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.combo = 0;
    this.dropInterval = START_SPEED;
    this.isGameOver = false;
    this.isPaused = false;
    this.canHold = true;
    this.bag = [];
    this.holdPiece = null;
    this.nextPiece = null;
    this.resetLockDelay();
    this.clearingLines = false;
    this.board.linesToClear = [];
    this.spawnNext();
  }
}
