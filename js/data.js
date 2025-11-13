const AGENT_SOUND_PREFS_KEY = 'agentSoundPrefs';
const ROLE_FILTER_KEY = 'roleFilterSelection';
const MAX_AGENT_SOUND_VARIANTS = 8;
const agentSoundPrefs = loadAgentSoundPrefs();
const agentSoundExistenceCache = new Map();
const soundManifest = typeof window !== 'undefined' ? (window.AGENT_SOUND_MANIFEST || null) : null;
const isFileProtocol = typeof window !== 'undefined' && window.location && window.location.protocol === 'file:';
const agentOrderMap = new Map();
let ROLE_ICONS = { Controller: null, Duelist: null, Initiator: null, Sentinel: null };

function getStoredRoles() {
  try {
    const raw = localStorage.getItem(ROLE_FILTER_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) { return []; }
}

function persistStoredRoles(list) {
  try { localStorage.setItem(ROLE_FILTER_KEY, JSON.stringify(list || [])); } catch (e) {}
}

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

function slugifyAgentName(name) {
  return (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function seedAgentDefaultSounds(list) {
  if (!Array.isArray(list)) return;
  list.forEach((agent, index) => {
    if (!agent) return;
    const slug = slugifyAgentName(agent.name);
    agent._soundSlug = slug;
    if (!agent.winSounds || !agent.winSounds.length) {
      agent.winSounds = [{
        label: 'Default',
        path: `assets/sounds/${slug}.mp3`,
        isDefault: true,
        enabled: true,
      }];
    }
    const key = normalizedAgentKey(agent.name);
    if (!agentOrderMap.has(key)) {
      agentOrderMap.set(key, index);
    }
    ensureAgentHasEnabledSound(agent);
  });
}

seedAgentDefaultSounds(agents);

function ensureAgentHasEnabledSound(agent) {
  if (!agent?.winSounds?.length) return;
  const enabled = agent.winSounds.filter((s) => s.enabled !== false);
  if (!enabled.length) {
    const fallback = agent.winSounds.find((s) => s.isDefault) || agent.winSounds[0];
    if (fallback) fallback.enabled = true;
  }
}

function updateAgentSoundPrefs(agent) {
  const key = normalizedAgentKey(agent?.name);
  if (!key || !agent?.winSounds) return;
  const disabled = agent.winSounds.filter((s) => s.enabled === false).map((s) => s.path);
  if (disabled.length) agentSoundPrefs[key] = disabled;
  else delete agentSoundPrefs[key];
}

function applyRandomizeSoundRules() {
  if (!Array.isArray(agents)) return;
  agents.forEach((agent) => {
    if (!agent?.winSounds) return;
    if (!randomizeWinSounds) {
      const defaultSound = agent.winSounds.find((s) => s.isDefault);
      if (defaultSound) defaultSound.enabled = true;
    }
    ensureAgentHasEnabledSound(agent);
    updateAgentSoundPrefs(agent);
  });
  persistAgentSoundPrefs();
}

window.applyRandomizeSoundRules = applyRandomizeSoundRules;
applyRandomizeSoundRules();
// Expose builder for on-demand use by UI
window.buildAgentSoundList = buildAgentSoundList;

function isAgentSoundEnabled(agentName, soundPath, isDefault = false) {
  if (!soundPath) return false;
  if (isDefault) return true;
  const disabled = agentSoundPrefs[normalizedAgentKey(agentName)];
  return !disabled || !disabled.includes(soundPath);
}

function setAgentSoundEnabled(agentName, soundPath, enabled) {
  if (!agentName || !soundPath) return true;
  const key = normalizedAgentKey(agentName);
  const agent = agents.find((a) => normalizedAgentKey(a.name) === key);
  const sound = agent?.winSounds?.find((s) => s.path === soundPath);
  if (!agent || !sound) return true;

  let desired = !!enabled;
  if (!randomizeWinSounds && sound.isDefault && desired === false) {
    desired = true;
  }

  if (desired === false) {
    const otherEnabled = agent.winSounds.some((s) => s.path !== soundPath && s.enabled !== false);
    if (!otherEnabled) desired = true;
  }

  sound.enabled = desired;
  ensureAgentHasEnabledSound(agent);
  updateAgentSoundPrefs(agent);
  persistAgentSoundPrefs();
  return sound.enabled !== false;
}

function manifestKeyFromAgent(agent) {
  if (!agent) return null;
  if (!agent._soundSlug) {
    agent._soundSlug = slugifyAgentName(agent.name);
  }
  return agent._soundSlug || null;
}

function applyManifestSounds(agent) {
  if (!soundManifest) return false;
  const key = manifestKeyFromAgent(agent);
  if (!key || !soundManifest[key] || !soundManifest[key].length) return false;
  const entries = soundManifest[key];
  const sounds = entries.map((entry, idx) => {
    const entryPath = typeof entry === 'object' ? entry.path : entry;
    const entryLabel = typeof entry === 'object'
      ? (entry.label || (idx === 0 ? 'Default' : `Option ${idx + 1}`))
      : (idx === 0 ? 'Default' : `Option ${idx + 1}`);
    return {
      label: entryLabel,
      path: entryPath,
      isDefault: idx === 0,
      enabled: isAgentSoundEnabled(agent.name, entryPath, idx === 0),
    };
  });
  agent.winSounds = sounds;
  // Do not preload audio here; defer loading until playback or on-demand
  return true;
}

function preloadAudioSource(path) {
  // Intentionally disabled to prevent flooding the network with many audio requests.
  // We will let the browser load audio when it is actually played.
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
  seedAgentDefaultSounds([agent]);
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
  agent._soundsBuilt = true;
}

async function preloadAgentSoundVariants(list = []) {
  // Disabled aggressive preloading. Left in place for potential future use.
  for (const agent of list) {
    try { /* noop */ } catch (e) {}
  }
}

(async () => {
  // Skip bulk audio preloading to avoid hundreds of pending requests.
  try { applyRandomizeSoundRules(); } catch (e) {}
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
        role: (a.role && a.role.displayName) ? a.role.displayName : null,
        roleIcon: (a.role && a.role.displayIcon) ? a.role.displayIcon : null,
      }));

    seedAgentDefaultSounds(fetched);
    fetched.sort((a, b) => {
      const aKey = normalizedAgentKey(a.name);
      const bKey = normalizedAgentKey(b.name);
      const orderA = agentOrderMap.has(aKey) ? agentOrderMap.get(aKey) : Number.MAX_SAFE_INTEGER;
      const orderB = agentOrderMap.has(bKey) ? agentOrderMap.get(bKey) : Number.MAX_SAFE_INTEGER;
      if (orderA === orderB) {
        return (a.name || '').localeCompare(b.name || '');
      }
      return orderA - orderB;
    });

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

      // Capture role icons
      if (f.role && f.roleIcon && !ROLE_ICONS[f.role]) {
        ROLE_ICONS[f.role] = f.roleIcon;
      }
    });

    await Promise.all(loads);
    // Skip preloading sounds for fetched agents; they will be loaded on demand.

    // Replace agents and redraw; keep master list
    allAgents = fetched;
    const selectedRoles = getStoredRoles();
    if (selectedRoles && selectedRoles.length) {
      agents = allAgents.filter(a => a.role && selectedRoles.includes(a.role));
    } else {
      agents = allAgents;
    }
    applyRandomizeSoundRules();
    // reset pointer-relative tracking so tick detection doesn't fire spuriously
    prevRel = null;
    drawWheel();
    populatePerAgentSettings();
    populateDebugAgentSelect();
    try { if (typeof window.refreshRoleFilterIcons === 'function') window.refreshRoleFilterIcons(ROLE_ICONS); } catch (e) {}
    try { markWheelAssetsReady(); } catch (e) {}
    try { if (typeof window.refreshTeamCompIcons === 'function') window.refreshTeamCompIcons(ROLE_ICONS); } catch (e) {}
  } catch (e) {
    console.warn('Failed to load agents from API', e);
    try { markWheelAssetsReady(); } catch (err) {}
  }
}

// Kick off agent loading
loadAgentsFromValorantApi();

// Expose role filter helpers
window.applyRoleFilter = function applyRoleFilter(selectedRoles = []) {
  try {
    const list = Array.isArray(selectedRoles) ? selectedRoles : [];
    persistStoredRoles(list);
    if (!allAgents || !allAgents.length) { drawWheel(); return; }
    const hasRoleData = allAgents.some(a => !!a.role);
    if (!list.length || !hasRoleData) {
      agents = allAgents;
    } else {
      agents = allAgents.filter(a => a.role && list.includes(a.role));
    }
    // Redraw and refresh dependent UIs
    prevRel = null;
    drawWheel();
    try { populatePerAgentSettings(); } catch (e) {}
    try { populateDebugAgentSelect(); } catch (e) {}
  } catch (e) {}
};

window.getRoleFilterSelection = getStoredRoles;
