const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinButton');
const spinSound = document.getElementById('spinSound');
// winner UI (modal)
const winnerModal = document.getElementById('winnerModal');
const winnerModalName = document.getElementById('winnerModalName');
const winnerModalImage = document.getElementById('winnerModalImage');
const winnerCustomText = document.getElementById('winnerCustomText');
const closeWinner = document.getElementById('closeWinner');
const closeWinnerBtn = document.getElementById('closeWinnerBtn');
const shareWinnerBtn = document.getElementById('shareWinnerBtn');
const shareStatus = document.getElementById('shareStatus');
const agentListDiv = document.getElementById('agentList');
const randomizeWinSoundsToggle = document.getElementById('randomizeWinSoundsToggle');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');
const perAgentSettingsDiv = document.getElementById('perAgentSettings');
const debugPanel = document.getElementById('debugPanel');
const debugAgentSelect = document.getElementById('debugAgentSelect');
const debugShowWinnerBtn = document.getElementById('debugShowWinnerBtn');
const debugHideBtn = document.getElementById('debugHideBtn');

// Store user preferences
let randomizeWinSounds = JSON.parse(localStorage.getItem('randomizeWinSounds')) ?? false;
let agentWinVolume = parseFloat(localStorage.getItem('agentWinVolume'));
if (isNaN(agentWinVolume)) agentWinVolume = 0.9;

// Tick sound preferences
let tickEnabled = JSON.parse(localStorage.getItem('tickEnabled')) ?? true;
let tickVolume = parseFloat(localStorage.getItem('tickVolume'));
if (isNaN(tickVolume)) tickVolume = 0.9;

let startAngle = 0;
let spinning = false;
// animation state
let angularVelocity = 0; // radians per second
let angularDecel = 0; // radians per second squared (positive value reduces velocity)
let idleAngularVelocity = 0.06; // slow idle spin (rad/s)
let lastFrameTs = null;
let spinTriggered = false;
let idlePaused = false; // when true, idle rotation is suspended (e.g., while winner modal is open)
let winnerModalOpen = false;
const DEBUG_KEY_SEQUENCE = ['q', 'h', 'd', 's'];
const DEBUG_SEQUENCE_RESET_MS = 1800;
let debugKeyBuffer = [];
let debugSequenceTimer = null;
let debugPanelVisible = false;

// spin ramp state
let spinRampTotalMs = 300; // ramp up time in ms
let spinRampRemaining = 0;
let spinTargetVelocity = 0;
let spinInDecel = false;
let spinPendingDecel = 0;
let spinDirection = 1;
let spinDecelDurationMs = 0;
let spinDecelElapsedMs = 0;
let spinDecelInitialVelocity = 0;
// Master spin duration (ms) — everything scales from this value. Tune this to change overall spin feel.
let spinDurationMs = 8000;
// overshoot/settle state
let overshootActive = false;
let overshootPhase = 0; // 0: to peak, 1: back to target
let overshootElapsed = 0;
let overshootDurationMs = 300;
let overshootStartAngle = 0;
let overshootPeakAngle = 0;
let overshootTargetAngle = 0;
let pendingWinnerAgent = null;
let pendingWinnerSound = null;
let lastWinnerAgent = null;
let lastSpinProofId = null;
let shareStatusTimer = null;
let lastWinnerTheme = null;
// Tick sound audio resources
let audioCtx = null;
let tickBuffer = null;
let fallbackTickAudio = null; // HTMLAudioElement fallback
let prevRel = null; // previous pointer-relative angle for tick detection
let prevIndex = null; // previous pointer index for tick detection
// tick offset in milliseconds (can be negative to play earlier); persisted
let tickOffsetMs = parseInt(localStorage.getItem('tickOffsetMs'));
if (isNaN(tickOffsetMs)) tickOffsetMs = 0;
// Drumroll audio resources
let drumBuffer = null;
let fallbackDrumAudio = null;
let drumEnabled = JSON.parse(localStorage.getItem('drumEnabled')) ?? true;
let drumVolume = parseFloat(localStorage.getItem('drumVolume'));
if (isNaN(drumVolume)) drumVolume = 0.9;
let drumLeadMs = 2200; // how long before selection to start drumroll
let drumScheduled = false;
let drumSources = []; // active AudioBufferSourceNodes or timeouts for fallback
let drumStopTimeout = null;
let drumFadeInterval = null;

// Center icon (stationary, non-spinning)
let centerIcon = null;
const centerIconBorderColor = 'rgba(0, 0, 0, 0.6)';
const mobileBreakpointPx = 768;
const centerIconMinDesktopPx = 260;
const centerIconMinMobilePx = 110;

function isMobileViewport() {
  try {
    const width = window.innerWidth || canvas.width || 0;
    const height = window.innerHeight || canvas.height || 0;
    const shortest = width && height ? Math.min(width, height) : width || height;
    return shortest <= mobileBreakpointPx;
  } catch (e) {
    return false;
  }
}

// Small helper: convert RGB to hex
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// (Removed dominant-color extraction functions.)

// Deterministic, vibrant color generator from a string (HSL -> hex) to avoid near-black colors
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const color = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function normalizeHex(hex) {
  if (!hex) return null;
  let h = hex.trim();
  if (h[0] !== '#') h = '#' + h;
  if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3];
  if (/^#([0-9a-f]{6})$/i.test(h)) return h.toLowerCase();
  return null;
}

function hexToRgb(hex) {
  const h = normalizeHex(hex);
  if (!h) return null;
  const int = parseInt(h.slice(1), 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

function hexToRgba(hex, alpha = 1) {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(98,108,255,${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function shadeColor(hex, percent) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex || '#777777';
  const t = percent < 0 ? 0 : 255;
  const p = Math.max(0, Math.min(1, Math.abs(percent)));
  const r = Math.round(rgb.r + (t - rgb.r) * p);
  const g = Math.round(rgb.g + (t - rgb.g) * p);
  const b = Math.round(rgb.b + (t - rgb.b) * p);
  return rgbToHex(r, g, b);
}

function relativeLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  const srgb = [rgb.r, rgb.g, rgb.b].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}

function computeWinnerTheme(baseHex) {
  const base = normalizeHex(baseHex) || '#7b8bff';
  const lum = relativeLuminance(base);
  const isLight = lum > 0.55;
  if (isLight) {
    const darker = shadeColor(base, -0.65);
    return {
      base,
      light: shadeColor(base, -0.2),
      dark: shadeColor(base, -0.75),
      accent: darker,
      contrast: shadeColor(base, -0.45),
      shadow: hexToRgba(darker, 0.45),
      text: '#0d111a',
      muted: 'rgba(8, 12, 24, 0.65)',
    };
  }
  return {
    base,
    light: shadeColor(base, 0.35),
    dark: shadeColor(base, -0.45),
    accent: shadeColor(base, 0.55),
    contrast: shadeColor(base, -0.2),
    shadow: hexToRgba(base, 0.45),
    text: '#f4f6ff',
    muted: 'rgba(255, 255, 255, 0.65)',
  };
}

function applyWinnerTheme(theme) {
  if (!theme) return;
  lastWinnerTheme = theme;
  const content = winnerModal ? winnerModal.querySelector('.modal-content') : null;
  if (!content) return;
  const vars = {
    '--winner-bg-lite': theme.light,
    '--winner-bg-dark': theme.dark,
    '--winner-primary': theme.base,
    '--winner-primary-dark': theme.contrast,
    '--winner-accent': theme.accent,
    '--winner-shadow': theme.shadow,
    '--winner-text': '#ffffff',
    '--winner-muted': 'rgba(255, 255, 255, 0.78)',
  };
  Object.entries(vars).forEach(([k, v]) => content.style.setProperty(k, v));
}

function nameToColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // keep in 32-bit
  }
  const hue = Math.abs(hash) % 360;
  const sat = 60 + (Math.abs(hash) % 20); // 60-79%
  const light = 45 + (Math.abs(hash) % 10); // 45-54%
  return hslToHex(hue, sat, light);
}
