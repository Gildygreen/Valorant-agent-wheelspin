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

let startAngle = 0;
let spinning = false;

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

// Debounced resize
let _resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(resizeCanvas, 80);
});

// Wheel spinning logic
function spinWheel() {
  if (spinning || agents.length === 0) return;
  spinning = true;

  let spinAngle = Math.random() * 10 + 10;
  let spinTime = 0;
  const spinTimeTotal = 4000 + Math.random() * 2000;

  function rotate() {
    spinTime += 20;
    if (spinTime >= spinTimeTotal) {
      spinning = false;
      stopRotateWheel();
      return;
    }
    const easeOut = easeOutQuad(spinTime, 0, spinAngle, spinTimeTotal);
    startAngle += easeOut * 0.05;
    drawWheel();
    requestAnimationFrame(rotate);
  }

  rotate();
}

// Stop and select winner
function stopRotateWheel() {
  const arc = Math.PI * 2 / agents.length;
  // Marker is at the top, pointing downwards (angle = -Math.PI/2). Find which slice covers that absolute angle
  const pointerAngle = -Math.PI / 2; // top marker pointing downwards
  // normalize startAngle to [0, 2PI)
  const normStart = ((startAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  // compute angle of pointer relative to wheel rotation
  const rel = ( (pointerAngle - normStart) + Math.PI * 2 ) % (Math.PI * 2);
  const index = Math.floor(rel / arc) % agents.length;

  const winnerAgent = agents[index];
  // Show winner modal
  if (winnerModal && winnerModalName && winnerModalImage) {
    winnerModalName.textContent = winnerAgent.name;
    winnerModalImage.src = winnerAgent.img || 'assets/images/default-avatar.jpg';
    winnerModal.setAttribute('aria-hidden', 'false');
  }
  
  const winSoundPath = randomizeWinSounds 
    ? winnerAgent.winSounds[Math.floor(Math.random() * winnerAgent.winSounds.length)].path
    : (useAgentSounds ? (winnerAgent.winSounds.find(s => s.isDefault)?.path || winnerAgent.winSounds[0].path) : globalWinSoundPath);

  // Play the win sound (if available)
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

// UI wiring and initialization
const globalWinSoundSelect = document.getElementById('globalWinSoundSelect');
const previewGlobalWinSound = document.getElementById('previewGlobalWinSound');

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

// Attach spin button
// Allow clicking the wheel canvas to spin
if (canvas) {
  canvas.addEventListener('click', (e) => {
    // ignore clicks if spinning
    if (!spinning && agents.length > 0) {
      spinWheel();
    }
  });
}

// Draw wheel immediately so users see it without interacting
drawWheel();

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
  closeWinner.addEventListener('click', () => winnerModal.setAttribute('aria-hidden', 'true'));
}
if (closeWinnerBtn && winnerModal) {
  closeWinnerBtn.addEventListener('click', () => winnerModal.setAttribute('aria-hidden', 'true'));
}

// Update canvas size on load
window.addEventListener('load', () => {
  resizeCanvas();
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
    drawWheel();
    populatePerAgentSettings();
  } catch (e) {
    console.warn('Failed to load agents from API', e);
  }
}

// Kick off agent loading
loadAgentsFromValorantApi();
