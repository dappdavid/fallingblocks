import { Game } from './game.js';
import { Renderer } from './renderer.js';
import { Input } from './input.js';

let game;
let renderer;
let input;
let animationId;

// Initialize everything once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  game = new Game();
  renderer = new Renderer('game-canvas');
  input = new Input(game);

  // Setup UI buttons
  const startBtn = document.getElementById('start-btn');
  const restartBtn = document.getElementById('restart-btn');
  const resumeBtn = document.getElementById('resume-btn');

  startBtn.addEventListener('click', () => {
    document.getElementById('start-screen').classList.remove('active');
    game.restart();
    startGameLoop();
  });

  restartBtn.addEventListener('click', () => {
    document.getElementById('game-over-screen').classList.remove('active');
    game.restart();
    startGameLoop();
  });

  resumeBtn.addEventListener('click', () => {
    document.getElementById('pause-screen').classList.remove('active');
    game.togglePause();
  });

  document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyP') {
      const pauseScreen = document.getElementById('pause-screen');
      if (game.isPaused) {
        pauseScreen.classList.add('active');
      } else {
        pauseScreen.classList.remove('active');
      }
    }
  });

  // Sound toggle button logic (Visual only as per "placeholder sounds acceptable")
  const soundBtn = document.getElementById('sound-btn');
  let soundOn = true;
  soundBtn.addEventListener('click', () => {
    soundOn = !soundOn;
    soundBtn.innerText = soundOn ? 'SOUND: ON' : 'SOUND: OFF';
    // Here you would also mute/unmute actual audio objects
  });
});

// Main game loop using requestAnimationFrame
function gameLoop(time) {
  if (!game.isGameOver) {
    game.update(time);
    renderer.draw(game);
  } else {
    // Show game over screen
    document.getElementById('game-over-screen').classList.add('active');
    document.getElementById('final-score').innerText = game.score;
    document.getElementById('high-score').innerText = game.highScore;
  }

  animationId = requestAnimationFrame(gameLoop);
}

function startGameLoop() {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  animationId = requestAnimationFrame(gameLoop);
}
