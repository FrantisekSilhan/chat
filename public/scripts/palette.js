function getRandomHue() {
  return Math.floor(Math.random() * 360);
}

function applyRandomPalette() {
  const hue = getRandomHue();

  const prefersLightMode = window.matchMedia("(prefers-color-scheme: light)").matches;

  document.documentElement.style.setProperty('--text', `${hue} 22% ${prefersLightMode ? 9 : 91}%`);
  document.documentElement.style.setProperty('--background', `${hue} 20% ${prefersLightMode ? 96 : 4}%`);
  document.documentElement.style.setProperty('--primary', `${hue} 20% ${prefersLightMode ? 30 : 70}%`);
  document.documentElement.style.setProperty('--secondary', `${hue} 20% ${prefersLightMode ? 48 : 52}%`);
}

export default applyRandomPalette;