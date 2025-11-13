const AGENT_SOUND_PREFS_KEY = 'agentSoundPrefs';
const agentOrderMap = new Map();
if (Array.isArray(agents)) {
  agents.forEach((agent, index) => {
    const key = (agent?.name || '').toLowerCase();
    if (key) agentOrderMap.set(key, index);
  });
}
const MAX_AGENT_SOUND_VARIANTS = 8;
const agentSoundPrefs = loadAgentSoundPrefs();
const agentSoundExistenceCache = new Map();
const soundManifest = typeof window !== 'undefined' ? (window.AGENT_SOUND_MANIFEST || null) : null;
const isFileProtocol = typeof window !== 'undefined' && window.location && window.location.protocol === 'file:';

function loadAgentSoundPrefs() {
  try {
    const raw = localStorage.getItem(AGENT_SOUND_PREFS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch (e) {
    return {};
  }
}

function persistAgentSoundPrefs() {
  try {
    localStorage.setItem(AGENT_SOUND_PREFS_KEY, JSON.stringify(agentSoundPrefs));
  } catch (e) {}
}

function normalizedAgentKey(name) {
  return (name || '').toLowerCase();
}

function isAgentSoundEnabled(agentName, soundPath, isDefault = false) {
  if (!soundPath) return false;
  if (isDefault) return true;
  const disabled = agentSoundPrefs[normalizedAgentKey(agentName)];
  return !disabled || !disabled.includes(soundPath);
}

function setAgentSoundEnabled(agentName, soundPath, enabled) {
  if (!agentName || !soundPath) return;
  const key = normalizedAgentKey(agentName);
  const agent = agents.find((a) => normalizedAgentKey(a.name) === key);
  const sound = agent?.winSounds?.find((s) => s.path === soundPath);
  if (sound?.isDefault) {
    if (agentSoundPrefs[key]) {
      agentSoundPrefs[key] = agentSoundPrefs[key].filter((p) => p !== soundPath);
      if (!agentSoundPrefs[key].length) delete agentSoundPrefs[key];
      persistAgentSoundPrefs();
    }
    if (sound) sound.enabled = true;
    return;
  }
  const list = agentSoundPrefs[key] || [];
  const idx = list.indexOf(soundPath);
  if (!enabled) {
    if (idx === -1) list.push(soundPath);
    agentSoundPrefs[key] = list;
  } else if (idx >= 0) {
    list.splice(idx, 1);
  }
  if (agentSoundPrefs[key] && !agentSoundPrefs[key].length) {
    delete agentSoundPrefs[key];
  }
  persistAgentSoundPrefs();
  if (sound) {
    sound.enabled = enabled || sound.isDefault;
  }
}

function manifestKeyFromAgent(agent) {
  const basePath = agent?.winSounds?.[0]?.path || '';
  if (!basePath) return null;
  const stem = basePath.replace(/^assets\/sounds\//i, '').replace(/\.mp3$/i, '');
  return stem.replace(/\d+$/g, '').toLowerCase();
}

function applyManifestSounds(agent) {
  if (!soundManifest) return false;
  const key = manifestKeyFromAgent(agent);
  if (!key || !soundManifest[key] || !soundManifest[key].length) return false;
  const entries = soundManifest[key];
  const sounds = entries.map((path, idx) => ({
    label: idx === 0 ? 'Default' : `Option ${idx + 1}`,
    path,
    isDefault: idx === 0,
    enabled: isAgentSoundEnabled(agent.name, path, idx === 0),
  }));
  agent.winSounds = sounds;
  sounds.forEach((s) => preloadAudioSource(s.path));
  return true;
}

function preloadAudioSource(path) {
  try {
    const audio = new Audio(path);
    audio.preload = 'auto';
  } catch (e) {}
}

function assetExistsViaAudio(url, timeoutMs = 1800) {
  return new Promise((resolve) => {
    try {
      const audio = new Audio();
      let settled = false;
      let timer = null;
      const cleanup = () => {
        audio.removeEventListener('canplaythrough', handleSuccess);
        audio.removeEventListener('loadeddata', handleSuccess);
        audio.removeEventListener('error', handleError);
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      };
      const finish = (result) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(result);
      };
      const handleSuccess = () => finish(true);
      const handleError = () => finish(false);
      audio.addEventListener('canplaythrough', handleSuccess, { once: true });
      audio.addEventListener('loadeddata', handleSuccess, { once: true });
      audio.addEventListener('error', handleError, { once: true });
      audio.preload = 'auto';
      audio.src = url;
      timer = setTimeout(() => finish(false), timeoutMs);
      audio.load();
    } catch (e) {
      resolve(false);
    }
  });
}

async function assetExists(url) {
  if (agentSoundExistenceCache.has(url)) {
    return agentSoundExistenceCache.get(url);
  }
  if (isFileProtocol) {
    const exists = await assetExistsViaAudio(url);
    agentSoundExistenceCache.set(url, exists);
    return exists;
  }
  try {
    const resp = await fetch(url, { method: 'HEAD' });
    if (resp.ok) {
      agentSoundExistenceCache.set(url, true);
      return true;
    }
    if (resp.status === 405) {
      const getResp = await fetch(url);
      const ok = getResp.ok;
      agentSoundExistenceCache.set(url, ok);
      return ok;
    }
    agentSoundExistenceCache.set(url, false);
    return false;
  } catch (e) {
    agentSoundExistenceCache.set(url, false);
    return false;
  }
}

async function buildAgentSoundList(agent) {
  if (applyManifestSounds(agent)) return;
  const baseEntry = agent?.winSounds && agent.winSounds[0];
  const basePath = baseEntry?.path;
  if (!basePath) return;
  const dot = basePath.lastIndexOf('.');
  if (dot === -1) return;
  const prefix = basePath.slice(0, dot);
  const ext = basePath.slice(dot);
  const sounds = [{
    label: 'Default',
    path: basePath,
    isDefault: true,
    enabled: true,
  }];
  preloadAudioSource(basePath);
  for (let idx = 2; idx <= MAX_AGENT_SOUND_VARIANTS; idx++) {
    const candidate = `${prefix}${idx}${ext}`;
    const exists = await assetExists(candidate);
    if (!exists) break;
    sounds.push({
      label: `Option ${idx}`,
      path: candidate,
      isDefault: false,
    });
    preloadAudioSource(candidate);
  }
  sounds.forEach((sound) => {
    sound.enabled = isAgentSoundEnabled(agent.name, sound.path, sound.isDefault);
  });
  agent.winSounds = sounds;
}

async function preloadAgentSoundVariants(list = []) {
  await Promise.all(list.map(async (agent) => {
    try {
      await buildAgentSoundList(agent);
    } catch (e) {
      console.warn('Failed to preload win sounds for', agent?.name, e);
    }
  }));
}

(async () => {
  try {
    await preloadAgentSoundVariants(agents);
  } catch (e) {
    console.warn('Agent sound discovery failed', e);
  }
  try { populatePerAgentSettings(); } catch (e) {}
  try { populateDebugAgentSelect(); } catch (e) {}
  try { markWheelAssetsReady(); } catch (e) {}
})();

// Fetch agents from a public Valorant API and populate agent list/colors
async function loadAgentsFromValorantApi() {
  try {
    const res = await fetch('https://valorant-api.com/v1/agents');
    const json = await res.json();
    if (!json || !json.data) return;
    const fetched = json.data
      .filter(a => a.isPlayableCharacter)
      .map(a => ({
        name: a.displayName,
        img: a.displayIcon || a.bustPortrait || '',
        color: '#888888',
        winSounds: [],
      }));
    fetched.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

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
    await preloadAgentSoundVariants(fetched);

    // Replace agents and redraw
    agents = fetched;
    // reset pointer-relative tracking so tick detection doesn't fire spuriously
    prevRel = null;
    drawWheel();
    populatePerAgentSettings();
    populateDebugAgentSelect();
    try { markWheelAssetsReady(); } catch (e) {}
  } catch (e) {
    console.warn('Failed to load agents from API', e);
    try { markWheelAssetsReady(); } catch (err) {}
  }
}

// Kick off agent loading
loadAgentsFromValorantApi();
