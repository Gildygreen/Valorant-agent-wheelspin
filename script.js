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
const agentListDiv = document.getElementById('agentList');
const randomizeWinSoundsToggle = document.getElementById('randomizeWinSoundsToggle');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');
const perAgentSettingsDiv = document.getElementById('perAgentSettings');

// List of agents (as of Nov 2025) — alphabetical
let agents = [
  { name: 'Astra', color: '#2e005c', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/astra.mp3', isDefault: true } , 
      { label: 'Option 2', path: 'assets/sounds/astra2.mp3', isDefault: false }
    ] },
  { name: 'Breach', color: '#f08c29', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/breach.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/breach2.mp3', isDefault: false }
    ] },
  { name: 'Brimstone', color: '#9c8340', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/brimstone.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/brimstone2.mp3', isDefault: false }
    ] },
  { name: 'Chamber', color: '#ffff99', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/chamber.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/chamber2.mp3', isDefault: false }
    ] },
  { name: 'Clove', color: '#a06cc4ff', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/clove.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/clove2.mp3', isDefault: false }
    ] },
  { name: 'Cypher', color: '#7f7f7f', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/cypher.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/cypher2.mp3', isDefault: false }
    ] },
  { name: 'Deadlock', color: '#ccffff', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/deadlock.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/deadlock2.mp3', isDefault: false }
    ] },
  { name: 'Fade', color: '#1d1636', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/fade.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/fade2.mp3', isDefault: false }
    ] },
  { name: 'Gekko', color: '#bae655', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/gekko.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/gekko2.mp3', isDefault: false }
    ] },
  { name: 'Harbor', color: '#11545e', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/harbor.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/harbor2.mp3', isDefault: false }
    ] },
  { name: 'Iso', color: '#6c00d6', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/iso.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/iso2.mp3', isDefault: false }
    ] },
  { name: 'Jett', color: '#bbd6f0', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/jett.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/jett2.mp3', isDefault: false }
    ] },
  { name: 'KAY/O', color: '#124da1', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/kayo.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/kayo2.mp3', isDefault: false }
    ] },
  { name: 'Killjoy', color: '#f7cb2d', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/killjoy.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/killjoy2.mp3', isDefault: false }
    ] },
  { name: 'Neon', color: '#1e4194', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/neon.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/neon2.mp3', isDefault: false }
    ] },
  { name: 'Omen', color: '#26195e', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/omen.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/omen2.mp3', isDefault: false }
    ] },
  { name: 'Phoenix', color: '#913d00', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/phoenix.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/phoenix2.mp3', isDefault: false }
    ] },
  { name: 'Raze', color: '#ffb366', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/raze.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/raze2.mp3', isDefault: false }
    ] },
  { name: 'Reyna', color: '#8610b5', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/reyna.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/reyna2.mp3', isDefault: false }
    ] },
  { name: 'Sage', color: '#00a38b', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/sage.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/sage2.mp3', isDefault: false }
    ] },
  { name: 'Skye', color: '#2ea646', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/skye.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/skye2.mp3', isDefault: false }
    ] },
  { name: 'Sova', color: '#7cabcc', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/sova.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/sova2.mp3', isDefault: false }
    ] },
  { name: 'Tejo', color: '#deca6f', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/tejo.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/tejo2.mp3', isDefault: false }
    ] },
  { name: 'Veto', color: '#4b8e9c', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/veto.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/veto2.mp3', isDefault: false }
    ] },
  { name: 'Viper', color: '#27c427', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/viper.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/viper2.mp3', isDefault: false }
    ] },
  { name: 'Vyse', color: '#6949d1', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/vyse.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/vyse2.mp3', isDefault: false }
    ] },
  { name: 'Waylay', color: '#0fd6ae', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/waylay.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/waylay2.mp3', isDefault: false }
    ] },
  { name: 'Yoru', color: '#1a1a91', img: '', winSounds: [
      { label: 'Default', path: 'assets/sounds/yoru.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/yoru2.mp3', isDefault: false }
    ] }
];

// Store user preferences
let useAgentSounds = JSON.parse(localStorage.getItem('useAgentSounds')) ?? true;
let globalWinSoundPath = localStorage.getItem('globalWinSoundPath') || 'assets/sounds/win.mp3';
let randomizeWinSounds = JSON.parse(localStorage.getItem('randomizeWinSounds')) ?? false;

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
let drumLeadMs = parseInt(localStorage.getItem('drumLeadMs'));
if (isNaN(drumLeadMs)) drumLeadMs = 2300; // how long before selection to start drumroll
let drumScheduled = true;
let drumSources = []; // active AudioBufferSourceNodes or timeouts for fallback

// Center icon (stationary, non-spinning)
let centerIcon = null;

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

// Draw the wheel with agent names and colors
function drawWheel() {
  // Use CSS pixel dimensions (account for devicePixelRatio via setTransform)
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.width / dpr;
  const cssHeight = canvas.height / dpr;
  const centerX = cssWidth / 2;
  const centerY = cssHeight / 2;
  const radius = Math.min(cssWidth, cssHeight) / 2 - 20; // margin
  const arc = Math.PI * 2 / agents.length;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  agents.forEach((agent, i) => {
    const angle = startAngle + i * arc;
    ctx.beginPath();
    ctx.fillStyle = agent.color || '#666';
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, angle, angle + arc, false);
    ctx.lineTo(centerX, centerY);
    ctx.fill();

    // Draw agent image if available — larger and spaced further out
    if (agent._image && agent._image.complete) {
      try {
        // place images at outer edge but ensure they fit the slice width
        const imgDist = Math.floor(radius * 0.85);
        const baseSize = Math.floor(radius);
        // chord length at imgDist gives max available width inside slice
        const maxWidth = 2 * imgDist * Math.sin(arc / 1.5);
        // also ensure image stays inside radial bounds
        const radialAvailable = Math.max(0, 2 * (radius - imgDist));
        let imgSize = Math.max(18, Math.min(baseSize, Math.floor(maxWidth * 0.82), Math.floor(radialAvailable * 0.9)));
        // if there's not enough radial space, move image slightly inward
        let dist = imgDist;
        if (imgSize < 18) {
          imgSize = Math.max(14, Math.floor(maxWidth * 0.6));
        }
        if (imgSize > radialAvailable) {
          dist = Math.floor(radius - imgSize / 2 - 2);
        }
        const midAngle = angle + arc / 2;
        const imgX = centerX + Math.cos(midAngle) * dist - imgSize / 2;
        const imgY = centerY + Math.sin(midAngle) * dist - imgSize / 2;
        ctx.save();
        // clip to slice to avoid overlap
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, angle, angle + arc, false);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(agent._image, imgX, imgY, imgSize, imgSize);
        ctx.restore();
      } catch (e) {
        // ignore draw errors
      }
    }
    // no agent name rendering (per request)
  });

  // Draw marker triangle at top, overlapping the wheel halfway
  try {
    const triWidth = Math.max(12, Math.floor(radius * 0.06)); // half-base
    const triHeight = Math.max(16, Math.floor(triWidth * 1.2));
    const tipX = centerX;
    const tipY = centerY - radius + (triHeight / 2); // tip placed half inside the wheel
    const leftX = tipX - triWidth;
    const leftY = tipY - triHeight;
    const rightX = tipX + triWidth;
    const rightY = leftY;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(leftX, leftY);
    ctx.lineTo(rightX, rightY);
    ctx.closePath();
    ctx.fillStyle = '#ffcc00';
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.restore();
  } catch (e) {
    // ignore marker render errors
  }

  // Draw center icon (stationary, non-spinning) as a circle
  try {
    if (centerIcon && centerIcon.complete) {
      const iconSize = Math.max(300, Math.floor(radius * 0.25));
      const iconX = centerX - iconSize / 2;
      const iconY = centerY - iconSize / 2;
      
      ctx.save();
      // Clip to circle and draw icon
      ctx.beginPath();
      ctx.arc(centerX, centerY, iconSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(centerIcon, iconX, iconY, iconSize, iconSize);
      ctx.restore();
    }
  } catch (e) {
    // ignore icon render errors
  }
}

// Resize canvas to match CSS size and device pixel ratio
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  // Ensure 1:1 mapping of CSS pixels to drawing commands
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawWheel();
}

// Load center icon image
function loadCenterIcon() {
  try {
    centerIcon = new Image();
    // Don't set crossOrigin for file:// URLs; only set for http(s)
    if (!window.location.protocol.startsWith('file')) {
      centerIcon.crossOrigin = 'Anonymous';
    }
    centerIcon.src = 'assets/images/icon.png';
    centerIcon.onload = () => {
      drawWheel();
    };
    centerIcon.onerror = () => {
      console.warn('Failed to load center icon from: assets/images/icon.png');
    };
  } catch (e) {
    console.warn('Error loading center icon:', e);
  }
}

// Debounced resize
let _resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(resizeCanvas, 80);
});

// Wheel spinning logic
// Wheel spinning logic (new): idle slow spin + user-triggered spin with smooth deceleration
function spinWheel() {
  if (spinning || agents.length === 0 || winnerModalOpen) return;
  spinning = true;
  spinTriggered = true;

  // Spin duration base (global) will scale ramp and deceleration
  // durationMs is slightly randomized around the global spinDurationMs to provide natural variance
  const durationMs = Math.max(300, Math.round(spinDurationMs * (0.9 + Math.random() * 0.2)));
  const durationSec = durationMs / 1000;

  // Scale peak velocity with overall duration so longer spins are faster
  const speedScale = Math.max(0.5, durationMs / 5200);
  const minVel = 6.0 * speedScale; // rad/s
  const maxVel = 12.0 * speedScale; // rad/s
  const initialVel = minVel + Math.random() * (maxVel - minVel);

  // Setup ramp: ramp length scales with duration (percentage)
  spinRampTotalMs = Math.max(120, Math.round(durationMs * 0.06));
  spinRampRemaining = spinRampTotalMs;
  spinTargetVelocity = initialVel;
  spinInDecel = false;
  spinDirection = Math.sign(spinTargetVelocity) || 1;

  // compute deceleration to reach 0 after ramp completes
  const decelDurationSec = Math.max(0.4, durationSec - (spinRampTotalMs / 1000));
  spinDecelDurationMs = Math.max(300, Math.round(decelDurationSec * 1000));
  spinDecelElapsedMs = 0;
  spinDecelInitialVelocity = spinTargetVelocity;
  spinPendingDecel = spinTargetVelocity / decelDurationSec;
  // do not set angularVelocity immediately; animationLoop will ramp it

  // disable spin button while spin is in progress
  if (spinBtn) spinBtn.disabled = true;
}

// Main animation loop to handle idle rotation + active spin
function animationLoop(ts) {
  if (!lastFrameTs) lastFrameTs = ts;
  const dt = Math.min(50, ts - lastFrameTs); // clamp to avoid huge jumps
  lastFrameTs = ts;
  const dtSec = dt / 1000;

  if (spinTriggered) {
    // active user-triggered spin: handle ramp up then deceleration
    if (spinRampRemaining > 0) {
      // ramping up
      const rampStep = Math.min(dt, spinRampRemaining);
      // linear ramp: increase angularVelocity toward spinTargetVelocity
      const prev = spinRampRemaining;
      spinRampRemaining -= rampStep;
        const t = 1 - (spinRampRemaining / spinRampTotalMs); // 0..1 progress
        // use ease-in cubic for a natural acceleration (slow start, faster finish)
        const eased = easeInCubic(Math.max(0, Math.min(1, t)));
        angularVelocity = spinTargetVelocity * eased;
      startAngle += angularVelocity * dtSec;
      // when ramp finishes, start decel
      if (spinRampRemaining <= 0) {
        spinInDecel = true;
        angularDecel = spinPendingDecel; // apply deceleration
      }
    } else if (spinInDecel) {
      // decelerating phase (non-linear easing using easeOutQuad)
      spinDecelElapsedMs += dt;
      // start drumroll shortly before selection
      try {
        const remainingMs = Math.max(0, spinDecelDurationMs - spinDecelElapsedMs);
        if (drumEnabled && !drumScheduled && remainingMs <= drumLeadMs) {
          // kick off drumroll loop
          startDrumroll();
        }
      } catch (e) {}
      const p = Math.min(1, spinDecelElapsedMs / spinDecelDurationMs);
      // eased progress 0..1
      const eased = easeOutQuad(Math.max(0, p), 0, 1, 1);
      // angular velocity scales from initial -> 0 following eased curve
      angularVelocity = spinDecelInitialVelocity * (1 - eased);
      startAngle += angularVelocity * dtSec;
      if (p >= 1 || angularVelocity <= 0.00001) {
        // spin finished
        // stop drumroll immediately when spin finishes
        try { stopDrumroll(); } catch (e) {}
        spinTriggered = false;
        spinInDecel = false;
        spinning = false;
        angularVelocity = 0;
        angularDecel = 0;
        // determine winner and show modal immediately (no overshoot/settle snap)
        showWinnerModal();
      }
    } else {
      // fallback: if not ramping or decelling, just advance
      startAngle += angularVelocity * dtSec;
    }
  } else {
    // idle slow rotation when not spinning (unless paused by modal)
    if (!idlePaused) {
      // gently approach idleAngularVelocity for smoothness
      const blend = 0.06; // how quickly to approach idle speed
      if (!spinning) {
        // use a small blended velocity so stops/starts feel smooth
        angularVelocity += (idleAngularVelocity - angularVelocity) * blend;
        startAngle += angularVelocity * dtSec;
      }
    }
  }
  // detect pointer crossing slice edges and play tick sound(s)
  try {
    // Only detect slice-edge crossings during an active user-triggered spin (not idle)
    if ((spinTriggered || spinInDecel) && agents && agents.length > 0) {
      const arc = Math.PI * 2 / agents.length;
      const pointerAngle = -Math.PI / 2;
      const normStart = ((startAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const rel = ((pointerAngle - normStart) + Math.PI * 2) % (Math.PI * 2);
      const idx = Math.floor(rel / arc);
      if (prevIndex != null && !winnerModalOpen) {
        // number of forward slice steps crossed (wrap-aware)
        const crossed = (prevIndex - idx + agents.length) % agents.length;
        if (crossed > 0) {
          // estimate crossing times within this frame for each boundary crossed
          const d = (prevRel - rel + Math.PI * 2) % (Math.PI * 2);
          for (let i = 1; i <= crossed; i++) {
            // tCrossSec is time since previous frame when the i-th boundary was crossed
            const tCrossSec = (i * arc) / (d || arc) * (dtSec);
            // crossing happened tCrossSec after previous frame, which is (dtSec - tCrossSec) seconds ago relative to now
            const relativeToNowSec = tCrossSec - dtSec;
            const desiredStartSec = relativeToNowSec + (tickOffsetMs / 1000);
            // schedule a single tick for this crossing
            playTick(1, desiredStartSec);
          }
        }
      }
      prevIndex = idx;
      prevRel = rel; // keep for backward compatibility
    }
  } catch (e) {
    // ignore tick detection errors
  }

  drawWheel();
  requestAnimationFrame(animationLoop);
}

// Utility: clamp
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

// Load the tick sound into an AudioBuffer (WebAudio), with an HTMLAudioElement fallback
async function loadTickSound() {
  const paths = ['assets/sounds/spin.mp3'];
  // If running from file:// protocol the fetch/decode route will fail due to browser restrictions.
  // In that case skip WebAudio fetch and use an HTMLAudioElement fallback which works from local file paths.
  const isFileProtocol = window.location && window.location.protocol === 'file:';
  if (isFileProtocol) {
    // Prefer the first candidate for file://, browser will decide if it can load it
    try {
      fallbackTickAudio = new Audio(paths[0]);
      fallbackTickAudio.preload = 'auto';
      fallbackTickAudio.volume = tickVolume;
    } catch (e) {
      console.warn('Failed to create fallback tick audio on file:// protocol', e);
    }
    return;
  }

  // try WebAudio first (preferred for low-latency and overlapping playback)
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!audioCtx && AudioContext) audioCtx = new AudioContext();
    if (audioCtx) {
      // try candidate paths until one decodes
      for (const p of paths) {
        try {
          const resp = await fetch(p);
          if (!resp.ok) continue;
          const ab = await resp.arrayBuffer();
          try {
            tickBuffer = await audioCtx.decodeAudioData(ab.slice(0));
            return;
          } catch (decErr) {
            // try next path
            console.warn('decodeAudioData failed for', p, decErr);
            continue;
          }
        } catch (fetchErr) {
          // try next path
          continue;
        }
      }
    }
  } catch (e) {
    // fall through to HTMLAudioElement fallback
    console.warn('WebAudio load failed, using fallback for tick sound', e);
  }

  // Fallback to HTMLAudioElement — try candidates and pick the first
  for (const p of paths) {
    try {
      const a = new Audio(p);
      a.preload = 'auto';
      a.volume = tickVolume;
      fallbackTickAudio = a;
      break;
    } catch (e) {
      continue;
    }
  }
}

// Play tick sound; supports scheduling with an offset (seconds relative to now)
// startOffsetSec may be negative (in which case playback will start immediately)
function playTick(times = 1, startOffsetSec = 0) {
  if (!tickEnabled) return;
  if (winnerModalOpen) return; // don't tick while modal open
  if (times <= 0) return;
  times = Math.max(1, Math.floor(times));
  const spacing = 0.035; // seconds between successive ticks when multiple scheduled

  if (audioCtx && tickBuffer) {
    const gain = audioCtx.createGain();
    gain.gain.value = tickVolume;
    gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;
    for (let i = 0; i < times; i++) {
      const src = audioCtx.createBufferSource();
      src.buffer = tickBuffer;
      src.connect(gain);
      const scheduledTime = now + Math.max(0, startOffsetSec) + i * spacing;
      try {
        // if scheduledTime is very close to now, start immediately
        if (scheduledTime <= now + 0.01) src.start(now);
        else src.start(scheduledTime);
      } catch (e) { /* ignore */ }
    }
  } else if (fallbackTickAudio) {
    for (let i = 0; i < times; i++) {
      try {
        const a = new Audio(fallbackTickAudio.src);
        a.volume = tickVolume;
        const delayMs = Math.max(0, Math.round((startOffsetSec + i * spacing) * 1000));
        setTimeout(() => { a.play().catch(() => {}); }, delayMs);
      } catch (e) {
        // ignore
      }
    }
  }
}

// Start loading tick sound immediately
loadTickSound().catch(() => {});

// Drumroll loader/start/stop functions
async function loadDrumrollSound() {
  const paths = ['assets/sounds/drumroll.mp3', 'assets/drumroll.mp3'];
  const isFileProtocol = window.location && window.location.protocol === 'file:';
  if (isFileProtocol) {
    try {
      fallbackDrumAudio = new Audio(paths[0]);
      fallbackDrumAudio.preload = 'auto';
      fallbackDrumAudio.loop = true;
      fallbackDrumAudio.volume = drumVolume;
    } catch (e) {
      console.warn('Failed to create fallback drum audio on file:// protocol', e);
    }
    return;
  }

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!audioCtx && AudioContext) audioCtx = new AudioContext();
    if (audioCtx) {
      for (const p of paths) {
        try {
          const resp = await fetch(p);
          if (!resp.ok) continue;
          const ab = await resp.arrayBuffer();
          try {
            drumBuffer = await audioCtx.decodeAudioData(ab.slice(0));
            return;
          } catch (decErr) {
            console.warn('decodeAudioData failed for', p, decErr);
            continue;
          }
        } catch (fetchErr) {
          continue;
        }
      }
    }
  } catch (e) {
    console.warn('WebAudio load failed for drumroll', e);
  }

  for (const p of paths) {
    try {
      const a = new Audio(p);
      a.preload = 'auto';
      a.loop = true;
      a.volume = drumVolume;
      fallbackDrumAudio = a;
      break;
    } catch (e) {
      continue;
    }
  }
}

function startDrumroll() {
  if (!drumEnabled) return;
  if (drumScheduled) return;
  drumScheduled = true;
  drumSources = [];
  if (audioCtx && drumBuffer) {
    try {
      const src = audioCtx.createBufferSource();
      src.buffer = drumBuffer;
      src.loop = true;
      const gain = audioCtx.createGain();
      gain.gain.value = drumVolume;
      src.connect(gain);
      gain.connect(audioCtx.destination);
      try { src.start(); } catch (e) { /* ignore */ }
      drumSources.push({src, gain});
    } catch (e) {
      console.warn('Failed to start drumroll via WebAudio', e);
    }
  } else if (fallbackDrumAudio) {
    try {
      fallbackDrumAudio.loop = true;
      fallbackDrumAudio.volume = drumVolume;
      fallbackDrumAudio.currentTime = 0;
      fallbackDrumAudio.play().catch(() => {});
    } catch (e) {
      // ignore
    }
  }
}

function stopDrumroll() {
  if (!drumScheduled) return;
  drumScheduled = false;
  try {
    if (audioCtx && drumSources.length) {
      for (const s of drumSources) {
        try { s.src.stop(); } catch (e) {}
        try { s.src.disconnect(); } catch (e) {}
        try { s.gain.disconnect(); } catch (e) {}
      }
      drumSources = [];
    }
  } catch (e) {}
  try {
    if (fallbackDrumAudio) {
      fallbackDrumAudio.pause();
      fallbackDrumAudio.currentTime = 0;
    }
  } catch (e) {}
}

// Start loading drumroll sound immediately
loadDrumrollSound().catch(() => {});

// Stop and select winner — show modal immediately without overshoot snap
function showWinnerModal() {
  // ensure drumroll is stopped when showing winner
  try { stopDrumroll(); } catch (e) {}
  if (!agents || agents.length === 0) return; // safety check
  
  const arc = Math.PI * 2 / agents.length;
  // Marker is at the top, pointing downwards (angle = -Math.PI/2). Find which slice covers that absolute angle
  const pointerAngle = -Math.PI / 2; // top marker pointing downwards
  // normalize startAngle to [0, 2PI)
  const normStart = ((startAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  // compute angle of pointer relative to wheel rotation
  const rel = ( (pointerAngle - normStart) + Math.PI * 2 ) % (Math.PI * 2);
  let index = Math.floor(rel / arc);
  // ensure index is in valid range [0, agents.length)
  index = ((index % agents.length) + agents.length) % agents.length;

  const winnerAgent = agents[index];
  if (!winnerAgent) return; // safety check for undefined agent
  
  // Show winner modal immediately
  if (winnerModal && winnerModalName && winnerModalImage) {
    winnerModalName.textContent = 'You will be playing ' + winnerAgent.name;
    winnerModalImage.src = winnerAgent.img || 'assets/images/default-avatar.jpg';
    winnerModal.setAttribute('aria-hidden', 'false');
    // Pause idle spinning while the winner popup is visible
    idlePaused = true;
    winnerModalOpen = true;
    // ensure any residual idle velocity is stopped immediately
    angularVelocity = 0;
  }
  
  const winSoundPath = randomizeWinSounds 
    ? winnerAgent.winSounds[Math.floor(Math.random() * winnerAgent.winSounds.length)].path
    : (useAgentSounds ? (winnerAgent.winSounds.find(s => s.isDefault)?.path || winnerAgent.winSounds[0].path) : globalWinSoundPath);

  // Play the win sound immediately (no delay) so it plays alongside the drumroll
  if (winSoundPath) {
    const audio = new Audio(winSoundPath);
    audio.play().catch(() => {});
  }

  // Re-enable the spin button after the spin completes
  if (spinBtn) spinBtn.disabled = false;
}

// Easing function used for the spin animation
function easeOutQuad(t, b, c, d) {
  t /= d;
  return -c * t * (t - 2) + b;
}

// Ease-in cubic for a natural acceleration feel (0..1 -> 0..1)
function easeInCubic(t) {
  return t * t * t;
}

// UI wiring and initialization
const globalWinSoundSelect = document.getElementById('globalWinSoundSelect');
const previewGlobalWinSound = document.getElementById('previewGlobalWinSound');
const tickEnabledToggle = document.getElementById('tickEnabledToggle');
const tickVolumeRange = document.getElementById('tickVolumeRange');
const tickOffsetRange = document.getElementById('tickOffsetRange');
const tickOffsetLabel = document.getElementById('tickOffsetLabel');
const drumrollEnabledToggle = document.getElementById('drumrollEnabledToggle');
const drumrollVolumeRange = document.getElementById('drumrollVolumeRange');
const drumrollLeadRange = document.getElementById('drumrollLeadRange');
const drumrollLeadLabel = document.getElementById('drumrollLeadLabel');

if (globalWinSoundSelect) {
  globalWinSoundSelect.value = globalWinSoundPath;
  globalWinSoundSelect.addEventListener('change', (e) => {
    globalWinSoundPath = e.target.value;
    localStorage.setItem('globalWinSoundPath', globalWinSoundPath);
  });
}

if (previewGlobalWinSound) {
  previewGlobalWinSound.addEventListener('click', () => {
    if (globalWinSoundPath) new Audio(globalWinSoundPath).play().catch(() => {});
  });
}

if (randomizeWinSoundsToggle) {
  randomizeWinSoundsToggle.checked = randomizeWinSounds;
  randomizeWinSoundsToggle.addEventListener('change', (e) => {
    randomizeWinSounds = e.target.checked;
    localStorage.setItem('randomizeWinSounds', JSON.stringify(randomizeWinSounds));
  });
}

// Tick sound UI wiring
if (tickEnabledToggle) {
  tickEnabledToggle.checked = tickEnabled;
  tickEnabledToggle.addEventListener('change', (e) => {
    tickEnabled = !!e.target.checked;
    localStorage.setItem('tickEnabled', JSON.stringify(tickEnabled));
  });
}
if (tickVolumeRange) {
  tickVolumeRange.value = tickVolume;
  tickVolumeRange.addEventListener('input', (e) => {
    const v = parseFloat(e.target.value);
    tickVolume = isNaN(v) ? 0.9 : v;
    localStorage.setItem('tickVolume', String(tickVolume));
    // apply to fallback audio if present
    try { if (fallbackTickAudio) fallbackTickAudio.volume = tickVolume; } catch (e) {}
  });
}
if (tickOffsetRange) {
  tickOffsetRange.value = tickOffsetMs;
  if (tickOffsetLabel) tickOffsetLabel.textContent = tickOffsetMs + ' ms';
  tickOffsetRange.addEventListener('input', (e) => {
    const v = parseInt(e.target.value, 10);
    tickOffsetMs = isNaN(v) ? 0 : v;
    localStorage.setItem('tickOffsetMs', String(tickOffsetMs));
    if (tickOffsetLabel) tickOffsetLabel.textContent = tickOffsetMs + ' ms';
  });
}
// Drumroll settings wiring
if (drumrollEnabledToggle) {
  drumrollEnabledToggle.checked = drumEnabled;
  drumrollEnabledToggle.addEventListener('change', (e) => {
    drumEnabled = !!e.target.checked;
    localStorage.setItem('drumEnabled', JSON.stringify(drumEnabled));
  });
}
if (drumrollVolumeRange) {
  drumrollVolumeRange.value = drumVolume;
  drumrollVolumeRange.addEventListener('input', (e) => {
    const v = parseFloat(e.target.value);
    drumVolume = isNaN(v) ? 0.9 : v;
    localStorage.setItem('drumVolume', String(drumVolume));
    try { if (fallbackDrumAudio) fallbackDrumAudio.volume = drumVolume; } catch (e) {}
    // apply to active drum sources if playing
    try {
      if (drumSources && drumSources.length) {
        for (const s of drumSources) { s.gain.gain.value = drumVolume; }
      }
    } catch (e) {}
  });
}
if (drumrollLeadRange) {
  drumrollLeadRange.value = drumLeadMs;
  if (drumrollLeadLabel) drumrollLeadLabel.textContent = drumLeadMs + ' ms';
  drumrollLeadRange.addEventListener('input', (e) => {
    const v = parseInt(e.target.value, 10);
    drumLeadMs = isNaN(v) ? 2200 : v;
    localStorage.setItem('drumLeadMs', String(drumLeadMs));
    if (drumrollLeadLabel) drumrollLeadLabel.textContent = drumLeadMs + ' ms';
  });
}

// Attach spin button
// Allow clicking the wheel canvas to spin
if (canvas) {
  canvas.addEventListener('click', (e) => {
    // ignore clicks if spinning
    if (!spinning && agents.length > 0) {
      // resume audio context on first user gesture if needed (some browsers block audio until user interacts)
      try {
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
      } catch (e) {}
      spinWheel();
    }
  });
}

// Start the animation loop (handles idle rotation and user-triggered spins)
requestAnimationFrame(animationLoop);

// Settings modal open/close
if (settingsBtn && settingsModal && closeSettings) {
  settingsBtn.addEventListener('click', () => {
    settingsModal.setAttribute('aria-hidden', 'false');
  });
  closeSettings.addEventListener('click', () => {
    settingsModal.setAttribute('aria-hidden', 'true');
  });
  // Close when clicking outside modal-content
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) settingsModal.setAttribute('aria-hidden', 'true');
  });
}

// Winner modal close handlers
if (winnerModal && closeWinner) {
  closeWinner.addEventListener('click', () => {
    winnerModal.setAttribute('aria-hidden', 'true');
    idlePaused = false;
    // allow idle to gracefully resume (angularVelocity will blend toward idleAngularVelocity)
    winnerModalOpen = false;
    if (spinBtn) spinBtn.disabled = false;
  });
}
if (closeWinnerBtn && winnerModal) {
  closeWinnerBtn.addEventListener('click', () => {
    winnerModal.setAttribute('aria-hidden', 'true');
    idlePaused = false;
    winnerModalOpen = false;
    if (spinBtn) spinBtn.disabled = false;
  });
}

// Also close the winner modal when clicking outside the content and resume idle
if (winnerModal) {
  winnerModal.addEventListener('click', (e) => {
    if (e.target === winnerModal) {
      winnerModal.setAttribute('aria-hidden', 'true');
      idlePaused = false;
      winnerModalOpen = false;
      if (spinBtn) spinBtn.disabled = false;
    }
  });
}

// Update canvas size on load
window.addEventListener('load', () => {
  resizeCanvas();
  loadCenterIcon();
});

// Populate per-agent settings DOM
function populatePerAgentSettings() {
  if (!perAgentSettingsDiv) return;
  perAgentSettingsDiv.innerHTML = '';
  agents.forEach((agent, idx) => {
    const row = document.createElement('div');
    row.className = 'agent-setting';
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.marginBottom = '8px';

    const img = document.createElement('img');
    img.src = agent.img || '';
    img.alt = agent.name;
    img.style.width = '36px';
    img.style.height = '36px';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '4px';
    img.style.marginRight = '8px';

    const label = document.createElement('div');
    label.textContent = agent.name;
    label.style.flex = '0 0 120px';
    label.style.color = '#fff';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Win sound URL or path';
    input.style.flex = '1';
    input.value = (agent.winSounds && agent.winSounds[0]) ? agent.winSounds[0].path : '';
    input.addEventListener('change', (e) => {
      const val = e.target.value.trim();
      agent.winSounds = agent.winSounds || [];
      if (agent.winSounds[0]) agent.winSounds[0].path = val;
      else agent.winSounds.push({label: 'Custom', path: val, isDefault: true});
    });

    const preview = document.createElement('button');
    preview.textContent = '🔊';
    preview.style.marginLeft = '8px';
    preview.addEventListener('click', () => {
      const path = input.value || (agent.winSounds && agent.winSounds[0]?.path);
      if (path) new Audio(path).play().catch(() => {});
    });

    row.appendChild(img);
    row.appendChild(label);
    row.appendChild(input);
    row.appendChild(preview);
    perAgentSettingsDiv.appendChild(row);
  });
}

// Fetch agents from a public Valorant API and populate agent list/colors
async function loadAgentsFromValorantApi() {
  try {
    const res = await fetch('https://valorant-api.com/v1/agents');
    const json = await res.json();
    if (!json || !json.data) return;
    const fetched = json.data.filter(a => a.isPlayableCharacter).map(a => ({
      name: a.displayName,
      img: a.displayIcon || a.bustPortrait || '',
      color: '#888888',
      winSounds: []
    }));

    // Preload images; use colors from the local `agents` list when available, otherwise fall back to a generated color
    const loads = fetched.map(async (f) => {
      const existing = agents.find(x => x.name.toLowerCase() === f.name.toLowerCase());
      if (existing) {
        f.winSounds = existing.winSounds;
        if (existing.color) f.color = existing.color;
      }

      if (f.img) {
        let img = new Image();
        img.crossOrigin = 'Anonymous';
        await new Promise((resolve) => {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = f.img;
        });
        f._image = img;
      }

      // Ensure a color exists: prefer listed color, otherwise fallback to name-based generator
      if (!f.color) f.color = nameToColor(f.name);
    });

    await Promise.all(loads);

    // Replace agents and redraw
    agents = fetched;
  // reset pointer-relative tracking so tick detection doesn't fire spuriously
  prevRel = null;
  drawWheel();
    populatePerAgentSettings();
  } catch (e) {
    console.warn('Failed to load agents from API', e);
  }
}

// Kick off agent loading
loadAgentsFromValorantApi();
