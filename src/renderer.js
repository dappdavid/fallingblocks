import { BLOCK_SIZE, COLS, ROWS, COLORS } from './constants.js';
import { getColors } from './utils.js';

export class Renderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');

    // Setup hold and next canvases
    this.holdCanvas = document.getElementById('hold-canvas');
    this.holdCtx = this.holdCanvas.getContext('2d');

    this.nextCanvas = document.getElementById('next-canvas');
    this.nextCtx = this.nextCanvas.getContext('2d');

    // Grid config
    this.gridWidth = COLS * BLOCK_SIZE;
    this.gridHeight = ROWS * BLOCK_SIZE;
  }

  // Main draw loop
  draw(game) {
    this.clearCanvas(this.ctx, this.canvas);

    this.drawGrid();
    this.drawBoard(game.board);

    if (game.piece && !game.isGameOver) {
      this.drawGhost(game);
      this.drawPiece(this.ctx, game.piece);
    }

    this.drawHold(game.holdPiece);
    this.drawNext(game.nextPiece);

    this.updateUI(game);
  }

  // Clear specific canvas context
  clearCanvas(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // Draw background grid lines
  drawGrid() {
    this.ctx.strokeStyle = '#334155';
    this.ctx.lineWidth = 1;

    for (let i = 0; i <= COLS; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * BLOCK_SIZE, 0);
      this.ctx.lineTo(i * BLOCK_SIZE, this.gridHeight);
      this.ctx.stroke();
    }

    for (let j = 0; j <= ROWS; j++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, j * BLOCK_SIZE);
      this.ctx.lineTo(this.gridWidth, j * BLOCK_SIZE);
      this.ctx.stroke();
    }
  }

  // Draw locked blocks on the board
  drawBoard(board) {
    board.grid.forEach((row, y) => {
      // Check if this row is currently animating to clear
      const isClearing = board.linesToClear && board.linesToClear.includes(y);

      row.forEach((value, x) => {
        if (value > 0) {
          if (isClearing) {
            // Flash animation for clearing line (draw white block)
            this.drawBlock(this.ctx, x, y, '#ffffff');
          } else {
            this.drawBlock(this.ctx, x, y, COLORS[value]);
          }
        }
      });
    });
  }

  // Draw active piece
  drawPiece(ctx, piece) {
    const color = COLORS[piece.typeId];
    piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.drawBlock(ctx, piece.x + x, piece.y + y, color);
        }
      });
    });
  }

  // Draw ghost piece (drop preview)
  drawGhost(game) {
    const ghost = game.board.getGhost(game.piece);
    const colorInfo = getColors(COLORS[ghost.typeId]);

    this.ctx.fillStyle = colorInfo.normal;
    this.ctx.globalAlpha = 0.2; // Transparent

    ghost.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          // Draw simple semi-transparent block for ghost
          this.ctx.fillRect(
            (ghost.x + x) * BLOCK_SIZE,
            (ghost.y + y) * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
          );
        }
      });
    });

    this.ctx.globalAlpha = 1.0; // Reset alpha
  }

  // Draw single block with glow/shadow effects
  drawBlock(ctx, x, y, colorHex) {
    const color = getColors(colorHex);

    // Main block fill
    ctx.fillStyle = color.normal;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

    // Highlight top/left edges
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, 4); // Top
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, 4, BLOCK_SIZE); // Left

    // Shadow bottom/right edges
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x * BLOCK_SIZE, (y + 1) * BLOCK_SIZE - 4, BLOCK_SIZE, 4); // Bottom
    ctx.fillRect((x + 1) * BLOCK_SIZE - 4, y * BLOCK_SIZE, 4, BLOCK_SIZE); // Right

    // Border
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  }

  // Draw held piece in the hold panel
  drawHold(piece) {
    this.clearCanvas(this.holdCtx, this.holdCanvas);
    if (!piece) return;
    this.drawPreview(this.holdCtx, piece);
  }

  // Draw next piece in the next panel
  drawNext(piece) {
    this.clearCanvas(this.nextCtx, this.nextCanvas);
    if (!piece) return;
    this.drawPreview(this.nextCtx, piece);
  }

  // Draw a piece centered in a smaller preview canvas
  drawPreview(ctx, piece) {
    // Determine bounds to center the shape
    let width = 0;
    let height = piece.shape.length;

    piece.shape.forEach(row => {
        const rowWidth = row.reduce((count, val) => val > 0 ? count + 1 : count, 0);
        if (rowWidth > width) width = rowWidth;
    });

    const blockSize = 20; // Smaller block size for previews
    const offsetX = (ctx.canvas.width - width * blockSize) / 2;
    const offsetY = (ctx.canvas.height - height * blockSize) / 2;

    const color = COLORS[piece.typeId];

    piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          // Draw preview block
          ctx.fillStyle = color;
          ctx.fillRect(offsetX + (x * blockSize), offsetY + (y * blockSize), blockSize, blockSize);

          ctx.strokeStyle = 'rgba(0,0,0,0.5)';
          ctx.strokeRect(offsetX + (x * blockSize), offsetY + (y * blockSize), blockSize, blockSize);
        }
      });
    });
  }

  // Update UI stats elements
  updateUI(game) {
    document.getElementById('score').innerText = game.score;
    document.getElementById('level').innerText = game.level;
    document.getElementById('lines').innerText = game.lines;
    document.getElementById('combo').innerText = game.combo;
  }
}
