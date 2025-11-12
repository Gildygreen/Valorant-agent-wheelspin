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

// List of agents (full list as of 2023)
let agents = [
  { name: 'Jett', color: '#00bfff', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/jett.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/jett2.mp3', isDefault: false }
    ]
  },
  { name: 'Phoenix', color: '#ff4500', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/phoenix.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/phoenix2.mp3', isDefault: false }
    ]
  },
  { name: 'Sage', color: '#32cd32', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/sage.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/sage2.mp3', isDefault: false }
    ]
  },
  { name: 'Omen', color: '#660066', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/omen.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/omen2.mp3', isDefault: false }
    ]
  },
  { name: 'Breach', color: '#ff0000', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/breach.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/breach2.mp3', isDefault: false }
    ]
  },
  { name: 'Raze', color: '#ff6f00', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/raze.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/raze2.mp3', isDefault: false }
    ]
  },
  { name: 'Killjoy', color: '#ffaa00', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/killjoy.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/killjoy2.mp3', isDefault: false }
    ]
  },
  { name: 'Astra', color: '#9b4d96', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/astra.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/astra2.mp3', isDefault: false }
    ]
  },
  { name: 'Yoru', color: '#b7b7b7', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/yoru.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/yoru2.mp3', isDefault: false }
    ]
  },
  { name: 'Viper', color: '#00ff00', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/viper.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/viper2.mp3', isDefault: false }
    ]
  },
  { name: 'Skye', color: '#9fa3a9', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/skye.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/skye2.mp3', isDefault: false }
    ]
  },
  { name: 'Sova', color: '#00eaff', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/sova.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/sova2.mp3', isDefault: false }
    ]
  },
  { name: 'Reyna', color: '#8b008b', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/reyna.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/reyna2.mp3', isDefault: false }
    ]
  },
  { name: 'KAY/O', color: '#6e6e6e', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/kayo.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/kayo2.mp3', isDefault: false }
    ]
  },
  { name: 'Chamber', color: '#c0c0c0', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/chamber.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/chamber2.mp3', isDefault: false }
    ]
  },
  { name: 'Fade', color: '#3e0e6d', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/fade.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/fade2.mp3', isDefault: false }
    ]
  }
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

// Get dominant color of an image URL by drawing to a small canvas and counting quantized colors
async function getDominantColor(imageUrl) {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = imageUrl;
      img.onload = () => {
        const w = 40, h = 40;
        const tmp = document.createElement('canvas');
        tmp.width = w; tmp.height = h;
        const tctx = tmp.getContext('2d');
        tctx.drawImage(img, 0, 0, w, h);
        const data = tctx.getImageData(0,0,w,h).data;
        const counts = {};
        for (let i = 0; i < data.length; i += 4) {
          // quantize by reducing color resolution
          const r = Math.round(data[i] / 16) * 16;
          const g = Math.round(data[i+1] / 16) * 16;
          const b = Math.round(data[i+2] / 16) * 16;
          const key = r+','+g+','+b;
          counts[key] = (counts[key] || 0) + 1;
        }
        let best = null, bestCount = 0;
        for (const k in counts) {
          if (counts[k] > bestCount) { best = k; bestCount = counts[k]; }
        }
        if (!best) return resolve('#888888');
        const [r,g,b] = best.split(',').map(Number);
        resolve(rgbToHex(r,g,b));
      };
      img.onerror = () => resolve('#888888');
    } catch (e) { resolve('#888888'); }
  });
}

// Compute dominant color from an already-loaded Image element
function getDominantColorFromImage(img) {
  try {
    const w = 40, h = 40;
    const tmp = document.createElement('canvas');
    tmp.width = w; tmp.height = h;
    const tctx = tmp.getContext('2d');
    tctx.drawImage(img, 0, 0, w, h);
    const data = tctx.getImageData(0,0,w,h).data;
    const counts = {};
    for (let i = 0; i < data.length; i += 4) {
      const r = Math.round(data[i] / 16) * 16;
      const g = Math.round(data[i+1] / 16) * 16;
      const b = Math.round(data[i+2] / 16) * 16;
      const key = r+','+g+','+b;
      counts[key] = (counts[key] || 0) + 1;
    }
    let best = null, bestCount = 0;
    for (const k in counts) {
      if (counts[k] > bestCount) { best = k; bestCount = counts[k]; }
    }
    if (!best) return '#888888';
    const [r,g,b] = best.split(',').map(Number);
    return rgbToHex(r,g,b);
  } catch (e) { return '#888888'; }
}

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
  // Marker points downwards (angle = +Math.PI/2). Find which slice covers that absolute angle
  const pointerAngle = Math.PI / 2; // downward pointing marker
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
if (spinBtn) {
  spinBtn.addEventListener('click', () => {
    if (!spinning) {
      spinBtn.disabled = true;
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

    // Preload images and compute colors reliably
    const loads = fetched.map(async (f) => {
      const existing = agents.find(x => x.name.toLowerCase() === f.name.toLowerCase());
      if (existing) f.winSounds = existing.winSounds;
          if (f.img) {
            // Try loading with CORS first (so getImageData can be used). If that fails,
            // retry without CORS so the image still displays (but canvas may be tainted).
            let img = new Image();
            img.crossOrigin = 'Anonymous';
            let loaded = await new Promise((resolve) => {
              let done = false;
              img.onload = () => { if (!done) { done = true; resolve(true); } };
              img.onerror = () => { if (!done) { done = false; resolve(false); } };
              img.src = f.img;
            });

            if (!loaded) {
              // Retry without crossOrigin (this will load in many CDN cases but will taint canvas)
              img = new Image();
              await new Promise((resolve) => {
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
                img.src = f.img;
              });
            }

            f._image = img;

            // Try to compute dominant color; if getImageData is blocked, fallback to a name-based color
            try {
              const color = getDominantColorFromImage(img);
              if (color) f.color = color;
            } catch (e) {
              // Fallback: deterministic color based on agent name
              f.color = nameToColor(f.name);
            }
          } else {
            // No image: use name-based color
            f.color = nameToColor(f.name);
          }
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
