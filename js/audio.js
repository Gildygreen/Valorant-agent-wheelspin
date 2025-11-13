let tickAudioPool = [];
let tickAudioPoolIdx = 0;
const TICK_POOL_SIZE = 6; // small pool for overlapping ticks when WebAudio unavailable

function buildTickAudioPool() {
  try {
    tickAudioPool = [];
    if (!fallbackTickAudio || !fallbackTickAudio.src) return;
    for (let i = 0; i < TICK_POOL_SIZE; i++) {
      const a = new Audio(fallbackTickAudio.src);
      a.preload = 'auto';
      a.volume = tickVolume;
      try { a.load(); } catch (e) {}
      tickAudioPool.push(a);
    }
    tickAudioPoolIdx = 0;
    try { window.tickAudioPool = tickAudioPool; } catch (e) {}
  } catch (e) { /* ignore */ }
}

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
      try { fallbackTickAudio.load(); } catch (e) {}
      buildTickAudioPool();
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
          const resp = await fetch(p, { cache: 'force-cache' });
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
      try { fallbackTickAudio.load(); } catch (e) {}
      buildTickAudioPool();
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
        // rotate through a small pool of preloaded elements to avoid re-downloading
        if (!tickAudioPool || !tickAudioPool.length) buildTickAudioPool();
        const a = tickAudioPool[(tickAudioPoolIdx++) % tickAudioPool.length] || fallbackTickAudio;
        try { a.pause(); } catch (e) {}
        try { a.currentTime = 0; } catch (e) {}
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
  if (drumStopTimeout) {
    clearTimeout(drumStopTimeout);
    drumStopTimeout = null;
  }
  if (drumFadeInterval) {
    clearInterval(drumFadeInterval);
    drumFadeInterval = null;
  }
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

function fadeOutDrumroll(fadeDurationMs = 800) {
  if (!drumScheduled) return;
  const duration = Math.max(60, fadeDurationMs | 0);

  if (audioCtx && drumSources.length) {
    try {
      const now = audioCtx.currentTime;
      const fadeSeconds = duration / 1000;
      for (const s of drumSources) {
        if (s?.gain?.gain) {
          const current = s.gain.gain.value;
          s.gain.gain.cancelScheduledValues(now);
          s.gain.gain.setValueAtTime(current, now);
          s.gain.gain.linearRampToValueAtTime(0.0001, now + fadeSeconds);
        }
      }
    } catch (e) {}
  }

  if (fallbackDrumAudio) {
    try {
      const startVol = fallbackDrumAudio.volume;
      const stepCount = Math.max(2, Math.floor(duration / 50));
      const stepMs = duration / stepCount;
      const delta = startVol / stepCount;
      if (drumFadeInterval) {
        clearInterval(drumFadeInterval);
        drumFadeInterval = null;
      }
      let steps = 0;
      drumFadeInterval = setInterval(() => {
        steps++;
        fallbackDrumAudio.volume = Math.max(0, startVol - delta * steps);
        if (steps >= stepCount) {
          clearInterval(drumFadeInterval);
          drumFadeInterval = null;
        }
      }, stepMs);
    } catch (e) {}
  }

  if (drumStopTimeout) {
    clearTimeout(drumStopTimeout);
    drumStopTimeout = null;
  }
  drumStopTimeout = setTimeout(() => {
    drumStopTimeout = null;
    try { stopDrumroll(); } catch (e) {}
  }, duration + 20);
}

function scheduleDrumrollStop(delayMs = 1800, fadeDurationMs = 300) {
  const delay = Math.max(0, delayMs | 0);
  if (drumStopTimeout) {
    clearTimeout(drumStopTimeout);
    drumStopTimeout = null;
  }
  drumStopTimeout = setTimeout(() => {
    drumStopTimeout = null;
    fadeOutDrumroll(fadeDurationMs);
  }, delay);
}

// Start loading drumroll sound immediately
loadDrumrollSound().catch(() => {});
