/**
 * Generate a random number between min (inclusive) and max (exclusive)
 */
export function random(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Shuffle an array in place using Fisher-Yates
 */
export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Returns a color object with normal and glowing variants
 */
export function getColors(hex) {
  if (hex === 'none') return { normal: 'transparent', glow: 'transparent' };
  return {
    normal: hex,
    glow: hex,
    shadow: 'rgba(0, 0, 0, 0.4)'
  };
}

/**
 * Get item from local storage safely
 */
export function getStorage(key, defaultValue) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Local storage read error', error);
    return defaultValue;
  }
}

/**
 * Set item in local storage safely
 */
export function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Local storage write error', error);
  }
}
