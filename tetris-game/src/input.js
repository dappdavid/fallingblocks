export class Input {
  constructor(game) {
    this.game = game;
    this.initKeyboard();
    this.initTouch();

    // Prevent default scrolling on game canvas
    const canvas = document.getElementById('game-canvas');
    canvas.addEventListener('contextmenu', e => e.preventDefault());
  }

  initKeyboard() {
    document.addEventListener('keydown', (event) => {
      if (this.game.isGameOver || this.game.isPaused) return;

      switch (event.code) {
        case 'ArrowLeft':
          this.game.moveLeft();
          event.preventDefault();
          break;
        case 'ArrowRight':
          this.game.moveRight();
          event.preventDefault();
          break;
        case 'ArrowDown':
          this.game.drop();
          event.preventDefault();
          break;
        case 'ArrowUp':
          this.game.rotate();
          event.preventDefault();
          break;
        case 'Space':
          this.game.hardDrop();
          event.preventDefault();
          break;
        case 'KeyC':
          this.game.hold();
          event.preventDefault();
          break;
        case 'KeyP':
          this.game.togglePause();
          event.preventDefault();
          break;
      }
    });
  }

  initTouch() {
    const canvas = document.getElementById('game-canvas');
    let touchStartX = 0;
    let touchStartY = 0;

    // Add mobile hard drop listener
    const hardDropBtn = document.getElementById('hard-drop-btn');
    if (hardDropBtn) {
      hardDropBtn.addEventListener('touchstart', (e) => {
        this.game.hardDrop();
        e.preventDefault();
      }, { passive: false });
    }

    canvas.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      if (this.game.isGameOver || this.game.isPaused) return;

      const touchEndX = e.touches[0].clientX;
      const touchEndY = e.touches[0].clientY;

      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;

      // Swipe threshold
      if (Math.abs(dx) > 30) {
        if (dx > 0) this.game.moveRight();
        else this.game.moveLeft();
        touchStartX = touchEndX; // Reset start to allow continuous swiping
      }

      if (dy > 40) {
        this.game.drop();
        touchStartY = touchEndY;
      }

      e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
      if (this.game.isGameOver || this.game.isPaused) return;

      // Detect tap (if movement was small)
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;

      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
        this.game.rotate();
      }
      e.preventDefault();
    }, { passive: false });
  }
}
