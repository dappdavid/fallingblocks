export const COLS = 10;
export const ROWS = 20;
export const BLOCK_SIZE = 30;

export const COLORS = [
  'none', // 0: Empty
  '#06b6d4', // 1: I (Cyan)
  '#3b82f6', // 2: J (Blue)
  '#f97316', // 3: L (Orange)
  '#eab308', // 4: O (Yellow)
  '#22c55e', // 5: S (Green)
  '#a855f7', // 6: T (Purple)
  '#ef4444'  // 7: Z (Red)
];

// Block definitions based on standard Tetromino shapes
export const SHAPES = [
  [], // Empty
  [   // I
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  [   // J
    [2, 0, 0],
    [2, 2, 2],
    [0, 0, 0]
  ],
  [   // L
    [0, 0, 3],
    [3, 3, 3],
    [0, 0, 0]
  ],
  [   // O
    [4, 4],
    [4, 4]
  ],
  [   // S
    [0, 5, 5],
    [5, 5, 0],
    [0, 0, 0]
  ],
  [   // T
    [0, 6, 0],
    [6, 6, 6],
    [0, 0, 0]
  ],
  [   // Z
    [7, 7, 0],
    [0, 7, 7],
    [0, 0, 0]
  ]
];

// Scoring multipliers for lines cleared
export const POINTS = {
  SOFT_DROP: 1,
  HARD_DROP: 2,
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800
};

// Game level configuration
export const LINES_PER_LEVEL = 10;
export const START_SPEED = 1000; // MS delay per tick at level 1
export const LOCK_DELAY = 500;   // Wait time before piece locks
