// UI wiring and initialization
const tickEnabledToggle = document.getElementById('tickEnabledToggle');
const tickVolumeRange = document.getElementById('tickVolumeRange');
const drumrollEnabledToggle = document.getElementById('drumrollEnabledToggle');
const drumrollVolumeRange = document.getElementById('drumrollVolumeRange');
const drumrollVolumeLabel = document.getElementById('drumrollVolumeLabel');
const agentWinVolumeRange = document.getElementById('agentWinVolumeRange');
const agentWinVolumeLabel = document.getElementById('agentVolumeLabel');
const tickVolumeLabel = document.getElementById('tickVolumeLabel');
const pointerColorInput = document.getElementById('pointerColor');
const usernameInputUi = document.getElementById('usernameInput');
const shareSetupBtn = document.getElementById('shareSetupBtn');
const resetAllBtn = document.getElementById('resetAllBtn');
const optionsStatus = document.getElementById('optionsStatus');
const roleFilterBar = document.getElementById('roleFilterBar');
const roleButtons = [
  { id: 'roleBtnController', role: 'Controller' },
  { id: 'roleBtnDuelist', role: 'Duelist' },
  { id: 'roleBtnInitiator', role: 'Initiator' },
  { id: 'roleBtnSentinel', role: 'Sentinel' },
];
const agentFilterBtn = document.getElementById('agentFilterBtn');

// Teams modal UI elements
const teamsBtnEl = document.getElementById('teamsBtn');
const teamsModalEl = document.getElementById('teamsModal');
const closeTeamsEl = document.getElementById('closeTeams');
const teamNameInput = document.getElementById('teamNameInput');
const teamPlayersContainer = document.getElementById('teamPlayers');
const teamCompEl = document.getElementById('teamComposition');
const teamSizeInput = document.getElementById('teamSizeInput');
const teamRandomizeRoles = document.getElementById('teamRandomizeRoles');
const savedTeamsSelect = document.getElementById('savedTeamsSelect');
const teamNewBtn = document.getElementById('teamNewBtn');
const teamSaveBtn = document.getElementById('teamSaveBtn');
const teamDeleteBtn = document.getElementById('teamDeleteBtn');
const teamRollBtn = document.getElementById('teamRollBtn');
const teamRollHint = document.getElementById('teamRollHint');
const teamResults = document.getElementById('teamResults');
const teamFeed = document.getElementById('teamFeed');
const teamCopyProofBtn = document.getElementById('teamCopyProofBtn');
const teamFeedCloseBtn = document.getElementById('teamFeedCloseBtn');
const teamFeedControls = document.querySelector('.team-feed-controls');
// Composition inputs
const compController = document.getElementById('compController');
const compDuelist = document.getElementById('compDuelist');
const compInitiator = document.getElementById('compInitiator');
const compSentinel = document.getElementById('compSentinel');
const wheelEmptyStateEl = document.getElementById('wheelEmptyState');

// Parse shared setup state from URL (if present) so it can be applied
// once agents and UI are fully initialized.
let __sharedSetupState = null;
(function parseSharedSetupFromUrl() {
  try {
    const url = new URL(window.location.href);
    const encoded = url.searchParams.get('state');
    if (!encoded) return;
    let json = null;
    try {
      json = atob(encoded);
    } catch (e) {
      // URL-safe base64 fallback
      try { json = atob(encoded.replace(/-/g, '+').replace(/_/g, '/')); } catch (err) { return; }
    }
    const obj = JSON.parse(json);
    if (obj && typeof obj === 'object') {
      __sharedSetupState = obj;
    }
  } catch (e) {}
})();

function setOptionsStatus(message, kind) {
  if (!optionsStatus) return;
  optionsStatus.textContent = message || '';
  optionsStatus.classList.remove('settings-status--success', 'settings-status--error');
  if (kind === 'success') optionsStatus.classList.add('settings-status--success');
  else if (kind === 'error') optionsStatus.classList.add('settings-status--error');
}

function setAgentPresetStatus(message, kind) {
  if (!agentPresetStatus) return;
  agentPresetStatus.textContent = message || '';
  agentPresetStatus.classList.remove('settings-status--success', 'settings-status--error');
  if (kind === 'success') agentPresetStatus.classList.add('settings-status--success');
  else if (kind === 'error') agentPresetStatus.classList.add('settings-status--error');
}

if (shareWinnerBtn) {
  shareWinnerBtn.disabled = true;
  shareWinnerBtn.addEventListener('click', async () => {
    if (!lastWinnerAgent) return;
    setShareStatus('Generating proof image...', 'info');
    shareWinnerBtn.disabled = true;
    const imageResult = await copyWinnerShareImage(lastWinnerAgent);
    if (imageResult.success) {
      setShareStatus('Proof image copied! Paste it with Ctrl+V.', 'success');
    } else {
      const textFallback = await copyWinnerShareMessage(lastWinnerAgent);
      if (textFallback) {
        setShareStatus('Image copy blocked; fallback text copied instead.', 'info');
      } else {
        setShareStatus('Copy failed. Please screenshot manually.', 'error');
      }
    }
    if (lastWinnerAgent) shareWinnerBtn.disabled = false;
  });
}

if (randomizeWinSoundsToggle) {
  randomizeWinSoundsToggle.checked = randomizeWinSounds;
  randomizeWinSoundsToggle.addEventListener('change', (e) => {
    randomizeWinSounds = e.target.checked;
    localStorage.setItem('randomizeWinSounds', JSON.stringify(randomizeWinSounds));
    if (typeof applyRandomizeSoundRules === 'function') {
      applyRandomizeSoundRules();
    }
    if (typeof updatePerAgentSectionVisibility === 'function') {
      updatePerAgentSectionVisibility();
    }
    populatePerAgentSettings();
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
  if (tickVolumeLabel) tickVolumeLabel.textContent = Math.round(tickVolume * 100) + '%';
  tickVolumeRange.addEventListener('input', (e) => {
    const v = parseFloat(e.target.value);
    tickVolume = isNaN(v) ? 0.5 : v;
    localStorage.setItem('tickVolume', String(tickVolume));
    // apply to fallback audio if present
    try {
      if (fallbackTickAudio) fallbackTickAudio.volume = tickVolume;
      if (window.tickAudioPool && Array.isArray(window.tickAudioPool)) {
        window.tickAudioPool.forEach((a) => { try { a.volume = tickVolume; } catch (e) {} });
      }
    } catch (e) {}
    if (tickVolumeLabel) tickVolumeLabel.textContent = Math.round(tickVolume * 100) + '%';
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
  if (drumrollVolumeLabel) drumrollVolumeLabel.textContent = Math.round(drumVolume * 100) + '%';
  drumrollVolumeRange.addEventListener('input', (e) => {
    const v = parseFloat(e.target.value);
    drumVolume = isNaN(v) ? 0.5 : v;
    localStorage.setItem('drumVolume', String(drumVolume));
    try { if (fallbackDrumAudio) fallbackDrumAudio.volume = drumVolume; } catch (e) {}
    // apply to active drum sources if playing
    try {
      if (drumSources && drumSources.length) {
        for (const s of drumSources) { s.gain.gain.value = drumVolume; }
      }
    } catch (e) {}
    if (drumrollVolumeLabel) drumrollVolumeLabel.textContent = Math.round(drumVolume * 100) + '%';
  });
}

if (agentWinVolumeRange) {
  agentWinVolumeRange.value = agentWinVolume;
  if (agentWinVolumeLabel) agentWinVolumeLabel.textContent = Math.round(agentWinVolume * 100) + '%';
  agentWinVolumeRange.addEventListener('input', (e) => {
    const v = parseFloat(e.target.value);
    agentWinVolume = isNaN(v) ? 0.5 : v;
    localStorage.setItem('agentWinVolume', String(agentWinVolume));
    if (agentWinVolumeLabel) agentWinVolumeLabel.textContent = Math.round(agentWinVolume * 100) + '%';
  });
}

// Username input wiring
if (usernameInputUi) {
  try { usernameInputUi.value = (typeof playerName === 'string' ? playerName : '') || ''; } catch (e) {}
  const persist = (val) => {
    try {
      const v = (val || '').trim();
      playerName = v;
      localStorage.setItem('playerName', v);
    } catch (e) {}
  };
  usernameInputUi.addEventListener('input', (e) => persist(e.target.value));
  usernameInputUi.addEventListener('change', (e) => persist(e.target.value));
}

// Share setup button: encode current configuration into the URL and copy it
// to the clipboard so it can be shared with friends.
if (shareSetupBtn) {
  shareSetupBtn.addEventListener('click', async () => {
    try {
      const state = buildShareableState();
      const json = JSON.stringify(state);
      const encoded = btoa(json);
      const url = new URL(window.location.href);
      url.searchParams.set('state', encoded);
      const shareUrl = url.toString();
      let copied = false;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(shareUrl);
          copied = true;
        }
      } catch (e) {}
      if (!copied) {
        // Fallback: surface the URL in the modal for manual copy
        setOptionsStatus(`Copy blocked. Share this link manually:\n${shareUrl}`, 'error');
      } else {
        setOptionsStatus('Shareable setup link copied to clipboard.', 'success');
      }
    } catch (e) {
      setOptionsStatus('Failed to generate shareable link.', 'error');
    }
  });
}

// Reset all settings to defaults: filters, exclusions, audio, options,
// and team configuration (but not saved presets).
if (resetAllBtn) {
  resetAllBtn.addEventListener('click', () => {
    try {
      // Clear role filters and exclusions
      if (typeof window.applyRoleFilter === 'function') {
        window.applyRoleFilter([]);
      }
      try {
        let list = (typeof allAgents !== 'undefined' && Array.isArray(allAgents) && allAgents.length)
          ? allAgents
          : (Array.isArray(agents) ? agents : []);
        if (Array.isArray(list) && typeof window.setAgentExcluded === 'function') {
          list.forEach((agent) => {
            if (agent && agent.name) window.setAgentExcluded(agent.name, false);
          });
        }
      } catch (e) {}

      // Reset options
      if (usernameInputUi) usernameInputUi.value = '';
      try {
        playerName = '';
        localStorage.setItem('playerName', '');
      } catch (e) {}
      try {
        const defaultColor = '#ffd45c';
        if (pointerColorInput) pointerColorInput.value = defaultColor;
        window.pointerColor = defaultColor;
        localStorage.setItem('pointerColor', defaultColor);
      } catch (e) {}

      // Reset audio settings
      try {
        randomizeWinSounds = true;
        if (randomizeWinSoundsToggle) randomizeWinSoundsToggle.checked = true;
        localStorage.setItem('randomizeWinSounds', JSON.stringify(randomizeWinSounds));
        if (typeof applyRandomizeSoundRules === 'function') applyRandomizeSoundRules();
        if (typeof updatePerAgentSectionVisibility === 'function') updatePerAgentSectionVisibility();
      } catch (e) {}
      try {
        tickEnabled = true;
        if (tickEnabledToggle) tickEnabledToggle.checked = true;
        localStorage.setItem('tickEnabled', JSON.stringify(tickEnabled));
      } catch (e) {}
      try {
        tickVolume = 0.5;
        if (tickVolumeRange) tickVolumeRange.value = tickVolume;
        if (tickVolumeLabel) tickVolumeLabel.textContent = '50%';
        localStorage.setItem('tickVolume', String(tickVolume));
      } catch (e) {}
      try {
        drumEnabled = true;
        if (drumrollEnabledToggle) drumrollEnabledToggle.checked = true;
        localStorage.setItem('drumEnabled', JSON.stringify(drumEnabled));
      } catch (e) {}
      try {
        drumVolume = 0.5;
        if (drumrollVolumeRange) drumrollVolumeRange.value = drumVolume;
        if (drumrollVolumeLabel) drumrollVolumeLabel.textContent = '50%';
        localStorage.setItem('drumVolume', String(drumVolume));
      } catch (e) {}
      try {
        agentWinVolume = 0.5;
        if (agentWinVolumeRange) agentWinVolumeRange.value = agentWinVolume;
        if (agentWinVolumeLabel) agentWinVolumeLabel.textContent = '50%';
        localStorage.setItem('agentWinVolume', String(agentWinVolume));
      } catch (e) {}

      // Reset team configuration (but keep saved teams)
      try {
        clearTeamForm();
        if (teamRandomizeRoles) teamRandomizeRoles.checked = false;
      } catch (e) {}

      try { updateTeamRolesVisibility(); } catch (e) {}
      try { updatePlayerRowsForTeamSize(); updateCompInputsMax(); enforceCompSum(); } catch (e) {}
      try { updateTeamRollButtonState(); } catch (e) {}
      setOptionsStatus('Settings reset to defaults.', 'success');
    } catch (e) {}
  });
}

function refreshWheelEmptyState() {
  try {
    if (!wheelEmptyStateEl) return;
    const list = Array.isArray(agents) ? agents : [];
    const hasAgents = list.length > 0;
    wheelEmptyStateEl.style.display = hasAgents ? 'none' : 'flex';
    wheelEmptyStateEl.setAttribute('aria-hidden', hasAgents ? 'true' : 'false');
  } catch (e) {}
}

// Role filter wiring
function getCurrentRoleSelection() {
  try {
    if (typeof getRoleFilterSelection === 'function') return getRoleFilterSelection();
  } catch (e) {}
  try {
    const raw = localStorage.getItem('roleFilterSelection');
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) { return []; }
}

function setRolePressed(btn, pressed) {
  try { btn.setAttribute('aria-pressed', pressed ? 'true' : 'false'); } catch (e) {}
  if (pressed) btn.classList.add('selected'); else btn.classList.remove('selected');
}

function applySelectionAndFilter(selection) {
  try {
    if (typeof applyRoleFilter === 'function') applyRoleFilter(selection);
  } catch (e) {}
  try { refreshWheelEmptyState(); } catch (e) {}
}

function wireRoleButtons() {
  if (!roleFilterBar) return;
  const selection = new Set(getCurrentRoleSelection());
  roleButtons.forEach(({ id, role }) => {
    const el = document.getElementById(id);
    if (!el) return;
    setRolePressed(el, selection.has(role));
    el.addEventListener('click', () => {
      if (selection.has(role)) selection.delete(role); else selection.add(role);
      setRolePressed(el, selection.has(role));
      applySelectionAndFilter(Array.from(selection));
    });
  });
}

function updateRoleButtonIcons(icons) {
  try {
    roleButtons.forEach(({ id, role }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const img = el.querySelector('img');
      const src = icons && icons[role];
      if (img && src) { img.src = src; img.style.opacity = '1'; }
    });
  } catch (e) {}
}

wireRoleButtons();
// Allow data.js to refresh icons after API load
window.refreshRoleFilterIcons = updateRoleButtonIcons;

// If present, move feed controls inside the feed so they sit closer
try {
  if (teamFeed && teamFeedControls && teamFeedControls.parentElement !== teamFeed) {
    teamFeed.appendChild(teamFeedControls);
  }
} catch (e) {}

// Teams: storage + roll helpers
const TEAMS_KEY = 'savedTeamsList';
function loadTeams() {
  try {
    const raw = localStorage.getItem(TEAMS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (e) { return []; }
}
function saveTeams(list) {
  try { localStorage.setItem(TEAMS_KEY, JSON.stringify(list || [])); } catch (e) {}
}
function renderSavedTeams() {
  if (!savedTeamsSelect) return;
  const teams = loadTeams();
  savedTeamsSelect.innerHTML = '';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Saved teams';
  savedTeamsSelect.appendChild(placeholder);
  teams.forEach((t, idx) => {
    const opt = document.createElement('option');
    opt.value = String(idx);
    opt.textContent = t.name || `Team ${idx+1}`;
    savedTeamsSelect.appendChild(opt);
  });
  // Restore last selected index
  try {
    const stored = localStorage.getItem('savedTeamsSelectedIndex');
    const selIdx = stored === null || stored === '' ? NaN : parseInt(stored, 10);
    if (!isNaN(selIdx) && teams[selIdx]) {
      savedTeamsSelect.value = String(selIdx);
      populateFormFromTeam(teams[selIdx]);
    }
  } catch (e) {}
}

// Toggle visibility of team composition vs per-player role selects
function updateTeamRolesVisibility() {
  const on = !!(teamRandomizeRoles && teamRandomizeRoles.checked);
  try { if (teamCompEl) teamCompEl.style.display = on ? '' : 'none'; } catch (e) {}
  try {
    if (teamPlayersContainer) {
      teamPlayersContainer.querySelectorAll('.team-player-role').forEach((sel) => {
        sel.style.display = on ? 'none' : '';
      });
    }
  } catch (e) {}
}
try { updateTeamRolesVisibility(); } catch (e) {}
if (teamRandomizeRoles) {
  teamRandomizeRoles.addEventListener('change', () => {
    updateTeamRolesVisibility();
  });
}

// Allow data.js to set team comp icons
window.refreshTeamCompIcons = function refreshTeamCompIcons(icons) {
  try {
    document.querySelectorAll('.team-comp-icon').forEach((img) => {
      const role = img.getAttribute('data-role');
      const src = icons && role ? icons[role] : null;
      if (src) img.src = src;
    });
  } catch (e) {}
};
function getFormPlayers() {
  const rows = teamPlayersContainer ? Array.from(teamPlayersContainer.querySelectorAll('.team-player-row')) : [];
  const size = getTeamSize();
  return rows.slice(0, size).map((row) => {
    const name = (row.querySelector('.team-player-name')?.value || '').trim();
    const role = (row.querySelector('.team-player-role')?.value || '').trim();
    return { name, role };
  });
}
function setFormPlayers(players = []) {
  const rows = teamPlayersContainer ? Array.from(teamPlayersContainer.querySelectorAll('.team-player-row')) : [];
  for (let i = 0; i < rows.length; i++) {
    const p = players[i] || { name: '', role: '' };
    const nameEl = rows[i].querySelector('.team-player-name');
    const roleEl = rows[i].querySelector('.team-player-role');
    if (nameEl) nameEl.value = p.name || '';
    if (roleEl) roleEl.value = p.role || '';
  }
}
function clearTeamForm() {
  if (teamNameInput) teamNameInput.value = '';
  setFormPlayers([{},{},{},{},{}]);
  if (teamRandomizeRoles) teamRandomizeRoles.checked = false;
  if (teamResults) teamResults.innerHTML = '';
  if (savedTeamsSelect) savedTeamsSelect.value = '';
  setRoleComposition({ Controller: 0, Duelist: 0, Initiator: 0, Sentinel: 0 });
  try { localStorage.removeItem('savedTeamsSelectedIndex'); } catch (e) {}
  try { if (teamSizeInput) teamSizeInput.value = 5; } catch (e) {}
  try { updatePlayerRowsForTeamSize(); } catch (e) {}
}
function collectTeamFromForm() {
  const { roleFilter, excludedAgents } = getCurrentFilterState();
  return {
    name: (teamNameInput?.value || '').trim() || 'Team',
    players: getFormPlayers(),
    comp: getRoleComposition(),
    randomize: !!(teamRandomizeRoles && teamRandomizeRoles.checked),
    size: getTeamSize(),
    roleFilter,
    excludedAgents,
  };
}

function getCurrentFilterState() {
  let roleFilter = null;
  let excludedAgents = null;
  try {
    if (typeof window.getRoleFilterSelection === 'function') {
      const sel = window.getRoleFilterSelection();
      if (Array.isArray(sel)) roleFilter = sel;
    }
  } catch (e) {}
  try {
    let list = (typeof allAgents !== 'undefined' && Array.isArray(allAgents) && allAgents.length)
      ? allAgents
      : (Array.isArray(agents) ? agents : []);
    if (typeof isAgentExcluded === 'function' && Array.isArray(list)) {
      excludedAgents = list
        .filter((a) => a && a.name && isAgentExcluded(a))
        .map((a) => a.name);
    }
  } catch (e) {}
  return { roleFilter, excludedAgents };
}
function populateFormFromTeam(team) {
  if (!team) return;
  if (teamNameInput) teamNameInput.value = team.name || '';
  setFormPlayers(team.players || []);
  setRoleComposition(team.comp || { Controller: 0, Duelist: 0, Initiator: 0, Sentinel: 0 });
  try {
    if (teamRandomizeRoles) teamRandomizeRoles.checked = !!team.randomize;
  } catch (e) {}
  try { updateTeamRolesVisibility(); } catch (e) {}
  try { if (teamSizeInput) teamSizeInput.value = clampInt(team.size, 1, 5) || 5; } catch (e) {}
  try { updatePlayerRowsForTeamSize(); updateCompInputsMax(); enforceCompSum(); } catch (e) {}
}

function applyTeamPresetFilters(team) {
  if (!team) return;
  try {
    if (Array.isArray(team.roleFilter) && typeof window.applyRoleFilter === 'function') {
      window.applyRoleFilter(team.roleFilter);
    }
  } catch (e) {}
  try {
    if (Array.isArray(team.excludedAgents) && typeof window.setAgentExcluded === 'function') {
      const targetNames = new Set(team.excludedAgents.map((n) => String(n || '').toLowerCase()));
      let list = (typeof allAgents !== 'undefined' && Array.isArray(allAgents) && allAgents.length)
        ? allAgents
        : (Array.isArray(agents) ? agents : []);
      if (Array.isArray(list)) {
        list.forEach((agent) => {
          const key = (agent && agent.name) ? agent.name.toLowerCase() : '';
          if (!key) return;
          const shouldExclude = targetNames.has(key);
          window.setAgentExcluded(agent.name, shouldExclude);
        });
      }
    }
  } catch (e) {}
}

function buildShareableState() {
  const state = {};
  try {
    state.filters = getCurrentFilterState();
  } catch (e) {}
  try {
    state.team = collectTeamFromForm();
  } catch (e) {}
  try {
    state.options = {
      username: (typeof playerName === 'string' ? playerName : '') || '',
      pointerColor: (typeof window.pointerColor === 'string' ? window.pointerColor : '#ffd45c'),
    };
  } catch (e) {}
  try {
    state.audio = {
      randomizeWinSounds: !!randomizeWinSounds,
      agentWinVolume,
      tickEnabled: !!tickEnabled,
      tickVolume,
      drumEnabled: !!drumEnabled,
      drumVolume,
    };
  } catch (e) {}
  try {
    state.spin = {
      durationMs: spinDurationMs,
    };
  } catch (e) {}
  try {
    const active = {};
    if (savedTeamsSelect) {
      const idx = parseInt(savedTeamsSelect.value, 10);
      const teams = loadTeams();
      if (!isNaN(idx) && teams[idx]) {
        active.teamPreset = teams[idx].name || null;
      }
    }
    if (agentPresetSelect) {
      const idx = parseInt(agentPresetSelect.value, 10);
      const presets = loadAgentPresets();
      if (!isNaN(idx) && presets[idx]) {
        active.agentPreset = presets[idx].name || null;
      }
    }
    state.activePresets = active;
  } catch (e) {}
  return state;
}

function applySharedSetupState(obj) {
  if (!obj || typeof obj !== 'object') return;
  try {
    if (obj.filters && typeof window.applyRoleFilter === 'function') {
      const f = obj.filters;
      if (Array.isArray(f.roleFilter)) {
        window.applyRoleFilter(f.roleFilter);
      }
      if (Array.isArray(f.excludedAgents) && typeof window.setAgentExcluded === 'function') {
        const targetNames = new Set(f.excludedAgents.map((n) => String(n || '').toLowerCase()));
        let list = (typeof allAgents !== 'undefined' && Array.isArray(allAgents) && allAgents.length)
          ? allAgents
          : (Array.isArray(agents) ? agents : []);
        if (Array.isArray(list)) {
          list.forEach((agent) => {
            const key = (agent && agent.name) ? agent.name.toLowerCase() : '';
            if (!key) return;
            const shouldExclude = targetNames.has(key);
            window.setAgentExcluded(agent.name, shouldExclude);
          });
        }
      }
    }
  } catch (e) {}

  try {
    if (obj.team) {
      populateFormFromTeam(obj.team);
    }
  } catch (e) {}

  try {
    if (obj.options) {
      if (typeof obj.options.username === 'string') {
        const v = obj.options.username;
        if (usernameInputUi) usernameInputUi.value = v;
        playerName = v;
        try { localStorage.setItem('playerName', v); } catch (e) {}
      }
      if (obj.options.pointerColor && pointerColorInput) {
        const val = normalizeHex(obj.options.pointerColor) || '#ffd45c';
        pointerColorInput.value = val;
        window.pointerColor = val;
        try { localStorage.setItem('pointerColor', val); } catch (e) {}
      }
    }
  } catch (e) {}

  try {
    if (obj.audio) {
      if (typeof obj.audio.randomizeWinSounds === 'boolean' && randomizeWinSoundsToggle) {
        randomizeWinSounds = obj.audio.randomizeWinSounds;
        randomizeWinSoundsToggle.checked = randomizeWinSounds;
        try { localStorage.setItem('randomizeWinSounds', JSON.stringify(randomizeWinSounds)); } catch (e) {}
      }
      if (typeof obj.audio.agentWinVolume === 'number' && agentWinVolumeRange) {
        agentWinVolume = obj.audio.agentWinVolume;
        agentWinVolumeRange.value = agentWinVolume;
        if (agentWinVolumeLabel) agentWinVolumeLabel.textContent = Math.round(agentWinVolume * 100) + '%';
        try { localStorage.setItem('agentWinVolume', String(agentWinVolume)); } catch (e) {}
      }
      if (typeof obj.audio.tickEnabled === 'boolean' && tickEnabledToggle) {
        tickEnabled = obj.audio.tickEnabled;
        tickEnabledToggle.checked = tickEnabled;
        try { localStorage.setItem('tickEnabled', JSON.stringify(tickEnabled)); } catch (e) {}
      }
      if (typeof obj.audio.tickVolume === 'number' && tickVolumeRange) {
        tickVolume = obj.audio.tickVolume;
        tickVolumeRange.value = tickVolume;
        if (tickVolumeLabel) tickVolumeLabel.textContent = Math.round(tickVolume * 100) + '%';
        try { localStorage.setItem('tickVolume', String(tickVolume)); } catch (e) {}
      }
      if (typeof obj.audio.drumEnabled === 'boolean' && drumrollEnabledToggle) {
        drumEnabled = obj.audio.drumEnabled;
        drumrollEnabledToggle.checked = drumEnabled;
        try { localStorage.setItem('drumEnabled', JSON.stringify(drumEnabled)); } catch (e) {}
      }
      if (typeof obj.audio.drumVolume === 'number' && drumrollVolumeRange) {
        drumVolume = obj.audio.drumVolume;
        drumrollVolumeRange.value = drumVolume;
        if (drumrollVolumeLabel) drumrollVolumeLabel.textContent = Math.round(drumVolume * 100) + '%';
        try { localStorage.setItem('drumVolume', String(drumVolume)); } catch (e) {}
      }
    }
  } catch (e) {}

  try {
    if (obj.spin && typeof obj.spin.durationMs === 'number') {
      spinDurationMs = obj.spin.durationMs;
    }
  } catch (e) {}

  // Try to reflect which presets were active when the state was shared
  try {
    if (obj.activePresets) {
      const { teamPreset, agentPreset } = obj.activePresets;
      if (typeof teamPreset === 'string' && savedTeamsSelect) {
        const teams = loadTeams();
        const idx = teams.findIndex((t) => (t.name || '').toLowerCase() === teamPreset.toLowerCase());
        if (idx >= 0) {
          savedTeamsSelect.value = String(idx);
          try { localStorage.setItem('savedTeamsSelectedIndex', String(idx)); } catch (e) {}
        }
      }
      if (typeof agentPreset === 'string' && agentPresetSelect) {
        const presets = loadAgentPresets();
        const idx = presets.findIndex((p) => (p.name || '').toLowerCase() === agentPreset.toLowerCase());
        if (idx >= 0) {
          agentPresetSelect.value = String(idx);
          try { localStorage.setItem(AGENT_PRESET_SELECTED_KEY, String(idx)); } catch (e) {}
          updateAgentPresetButtonsState();
        }
      }
    }
  } catch (e) {}

  try { updateTeamRolesVisibility(); } catch (e) {}
  try { updatePlayerRowsForTeamSize(); updateCompInputsMax(); enforceCompSum(); } catch (e) {}
  try { updateTeamRollButtonState(); } catch (e) {}
}

window.applySharedStateIfPresent = function applySharedStateIfPresent() {
  if (!__sharedSetupState) return;
  const obj = __sharedSetupState;
  __sharedSetupState = null;
  applySharedSetupState(obj);
};

if (savedTeamsSelect) {
  renderSavedTeams();
  savedTeamsSelect.addEventListener('change', () => {
    const idx = parseInt(savedTeamsSelect.value, 10);
    const teams = loadTeams();
    if (!isNaN(idx) && teams[idx]) {
      populateFormFromTeam(teams[idx]);
      applyTeamPresetFilters(teams[idx]);
    }
    try { localStorage.setItem('savedTeamsSelectedIndex', String(isNaN(idx) ? '' : idx)); } catch (e) {}
    try { updateTeamRollButtonState(); } catch (e) {}
  });
}
if (teamNewBtn) {
  teamNewBtn.addEventListener('click', clearTeamForm);
}
if (teamSaveBtn) {
  teamSaveBtn.addEventListener('click', () => {
    const teams = loadTeams();
    const current = collectTeamFromForm();
    // if a saved team is selected, overwrite; otherwise push new
    const idx = parseInt(savedTeamsSelect?.value || '', 10);
    if (!isNaN(idx) && teams[idx]) teams[idx] = current; else teams.push(current);
    saveTeams(teams);
    renderSavedTeams();
    // persist or set selection to saved team
    try {
      const newIndex = (!isNaN(idx) && teams[idx]) ? idx : (teams.length - 1);
      if (savedTeamsSelect) savedTeamsSelect.value = String(newIndex);
      localStorage.setItem('savedTeamsSelectedIndex', String(newIndex));
    } catch (e) {}
  });
}
if (teamDeleteBtn) {
  teamDeleteBtn.addEventListener('click', () => {
    const idx = parseInt(savedTeamsSelect?.value || '', 10);
    const teams = loadTeams();
    if (!isNaN(idx) && teams[idx]) {
      teams.splice(idx, 1);
      saveTeams(teams);
      renderSavedTeams();
      clearTeamForm();
    }
  });
}

function agentsByRole(role) {
  try {
    const list = (typeof allAgents !== 'undefined' && Array.isArray(allAgents) && allAgents.length)
      ? allAgents
      : agents;
    let out = (list || []).filter(a => (a.role || '').toLowerCase() === (role || '').toLowerCase());
    if (typeof isAgentExcluded === 'function') {
      out = out.filter((a) => !isAgentExcluded(a));
    }
    return out;
  } catch (e) { return []; }
}

// Evaluate whether the current team configuration can be satisfied with the
// enabled agents and filters. Returns an object with:
// { ok: boolean, shortages: [{role, need, have}], totalShort: boolean, totalAvailable, totalNeeded }.
function evaluateTeamRollFeasibility() {
  try {
    const size = getTeamSize();
    if (!size || size <= 0) {
      return { ok: false, shortages: [], totalShort: true, totalAvailable: 0, totalNeeded: 0 };
    }

    // Build role demand from either the composition inputs (when randomizing)
    // or from explicit per-player roles.
    const roleDemand = {
      Controller: 0,
      Duelist: 0,
      Initiator: 0,
      Sentinel: 0,
    };

    const randomize = !!(teamRandomizeRoles && teamRandomizeRoles.checked);
    if (randomize) {
      const comp = getRoleComposition();
      ['Controller', 'Duelist', 'Initiator', 'Sentinel'].forEach((role) => {
        roleDemand[role] = Math.max(0, parseInt(comp?.[role] || 0, 10) || 0);
      });
    } else if (teamPlayersContainer) {
      const rows = Array.from(teamPlayersContainer.querySelectorAll('.team-player-row')).slice(0, size);
      rows.forEach((row) => {
        const role = (row.querySelector('.team-player-role')?.value || '').trim();
        if (!role || role === 'Any') return;
        if (roleDemand.hasOwnProperty(role)) {
          roleDemand[role] += 1;
        }
      });
    }

    // Count available agents after exclusions/filters.
    let allList = (typeof allAgents !== 'undefined' ? allAgents : agents) || [];
    if (typeof isAgentExcluded === 'function') {
      allList = allList.filter((a) => !isAgentExcluded(a));
    }
    const totalAvailable = allList.length;
    const totalNeeded = size;

    const rolesOrderCheck = ['Controller', 'Duelist', 'Initiator', 'Sentinel'];
    const shortages = [];
    rolesOrderCheck.forEach((role) => {
      const need = roleDemand[role] || 0;
      if (!need) return;
      const supply = (agentsByRole(role) || []).length;
      if (supply < need) {
        shortages.push({ role, need, have: supply });
      }
    });
    const totalShort = totalAvailable < totalNeeded;

    const ok = !shortages.length && !totalShort;
    return { ok, shortages, totalShort, totalAvailable, totalNeeded };
  } catch (e) {
    return { ok: true, shortages: [], totalShort: false, totalAvailable: 0, totalNeeded: 0 };
  }
}

function updateTeamRollButtonState() {
  if (!teamRollBtn) return;
  const { ok, shortages, totalShort, totalAvailable, totalNeeded } = evaluateTeamRollFeasibility();

  if (ok) {
    teamRollBtn.disabled = false;
    if (teamRollHint) {
      teamRollHint.textContent = '';
      teamRollHint.classList.remove('team-roll-hint--error');
    }
    return;
  }

  teamRollBtn.disabled = true;
  if (teamRollHint) {
    teamRollHint.classList.add('team-roll-hint--error');
    teamRollHint.textContent = 'Not enough agents enabled for this team composition.';
  }
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function rollTeamAssignments(team, randomizeRolesFlag) {
  const players = (team?.players || []).map((p, i) => ({ idx: i, name: p.name || `Player ${i+1}`, role: p.role || '' }));
  if (!players.length) return [];
  let roles = players.map(p => p.role).filter(Boolean);
  if (randomizeRolesFlag) {
    roles = shuffle(roles.slice());
    // reassign shuffled roles to players who had a role specified; others remain blank
    let r = 0;
    for (let i = 0; i < players.length; i++) {
      if (players[i].role) {
        players[i].role = roles[r++] || players[i].role;
      }
    }
  }

  const assignedAgents = new Set();
  const results = players.map((p) => {
    let pool = p.role ? agentsByRole(p.role) : (typeof allAgents !== 'undefined' ? allAgents : agents);
    pool = pool || [];
    // prefer an unassigned agent
    const unpicked = pool.filter(a => !assignedAgents.has((a.name || '').toLowerCase()));
    const pickFrom = unpicked.length ? unpicked : pool;
    let chosen = null;
    if (pickFrom.length) {
      chosen = pickFrom[Math.floor(Math.random() * pickFrom.length)];
      assignedAgents.add((chosen.name || '').toLowerCase());
    }
    return { player: p.name, role: p.role || 'Any', agent: chosen?.name || 'Random', img: chosen?.img || '' };
  });
  return results;
}

function renderTeamResults(assignments) {
  if (!teamResults) return;
  teamResults.innerHTML = '';
  if (!assignments || !assignments.length) return;
  assignments.forEach((r) => {
    const row = document.createElement('div');
    row.className = 'team-result-row';
    const p = document.createElement('div');
    p.textContent = r.player || 'Player';
    const role = document.createElement('div');
    role.textContent = r.role;
    const agent = document.createElement('div');
    if (r.img) {
      const img = document.createElement('img');
      img.src = r.img; img.alt = r.agent; img.title = r.agent;
      agent.appendChild(img);
      const span = document.createElement('span');
      span.style.marginLeft = '8px';
      span.textContent = r.agent;
      agent.appendChild(span);
    } else {
      agent.textContent = r.agent;
    }
    row.appendChild(p);
    row.appendChild(role);
    row.appendChild(agent);
    teamResults.appendChild(row);
  });
}

// Agent availability list (exclude from wheel)
const agentListEl = document.getElementById('agentList');
const agentPoolClearBtn = document.getElementById('agentPoolClearBtn');
const agentPresetSelect = document.getElementById('agentPresetSelect');
const agentPresetNameInput = document.getElementById('agentPresetNameInput');
const agentPresetNewBtn = document.getElementById('agentPresetNewBtn');
const agentPresetSaveBtn = document.getElementById('agentPresetSaveBtn');
const agentPresetDeleteBtn = document.getElementById('agentPresetDeleteBtn');
const agentPresetStatus = document.getElementById('agentPresetStatus');

function renderAgentAvailabilityList() {
  if (!agentListEl) return;
  agentListEl.innerHTML = '';
  const list = (typeof allAgents !== 'undefined' && Array.isArray(allAgents) && allAgents.length)
    ? allAgents
    : (Array.isArray(agents) ? agents : []);
  if (!list.length) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'agent-availability-list';

  list.forEach((agent) => {
    const excluded = (typeof isAgentExcluded === 'function') ? isAgentExcluded(agent) : false;
    const include = !excluded;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'agent-availability-item';
    if (!include) btn.classList.add('agent-excluded');
    btn.setAttribute('aria-pressed', include ? 'true' : 'false');
    btn.setAttribute('title', `${include ? 'In wheel' : 'Excluded'}: ${agent.name || 'Agent'}`);

    const circle = document.createElement('div');
    circle.className = 'agent-availability-circle';

    const img = document.createElement('img');
    img.className = 'agent-availability-icon';
    img.src = agent.img || '';
    img.alt = agent.name || 'Agent';
    circle.appendChild(img);

    btn.appendChild(circle);

    btn.addEventListener('click', () => {
      const currentlyIncluded = !btn.classList.contains('agent-excluded');
      const nextInclude = !currentlyIncluded;
      if (typeof setAgentExcluded === 'function') {
        setAgentExcluded(agent.name, !nextInclude);
      }
      if (nextInclude) {
        btn.classList.remove('agent-excluded');
        btn.setAttribute('aria-pressed', 'true');
        btn.setAttribute('title', `In wheel: ${agent.name || 'Agent'}`);
      } else {
        btn.classList.add('agent-excluded');
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('title', `Excluded: ${agent.name || 'Agent'}`);
      }
    });

    wrapper.appendChild(btn);
  });

  agentListEl.appendChild(wrapper);
  try { refreshWheelEmptyState(); } catch (e) {}
}

if (typeof window !== 'undefined') {
  window.renderAgentAvailabilityList = renderAgentAvailabilityList;
  window.refreshWheelEmptyState = refreshWheelEmptyState;
}

if (agentPoolClearBtn) {
  agentPoolClearBtn.addEventListener('click', () => {
    try {
      const list = (typeof allAgents !== 'undefined' && Array.isArray(allAgents) && allAgents.length)
        ? allAgents
        : (Array.isArray(agents) ? agents : []);
      if (Array.isArray(list)) {
        list.forEach((agent) => {
          if (agent && agent.name && typeof setAgentExcluded === 'function') {
            setAgentExcluded(agent.name, false);
          }
        });
      }
    } catch (e) {}
    try { refreshWheelEmptyState(); } catch (e) {}
  });
}

// Agent filter presets stored separately from team presets
const AGENT_PRESETS_KEY = 'agentPoolPresets';
const AGENT_PRESET_SELECTED_KEY = 'agentPoolSelectedIndex';
let agentPresetIsNew = false;

function loadAgentPresets() {
  try {
    const raw = localStorage.getItem(AGENT_PRESETS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (e) { return []; }
}

function saveAgentPresets(list) {
  try { localStorage.setItem(AGENT_PRESETS_KEY, JSON.stringify(list || [])); } catch (e) {}
}

function renderAgentPresets() {
  if (!agentPresetSelect) return;
  const presets = loadAgentPresets();
  agentPresetSelect.innerHTML = '';
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = presets.length ? 'No preset' : 'No presets yet';
  agentPresetSelect.appendChild(placeholder);
  presets.forEach((p, idx) => {
    const opt = document.createElement('option');
    opt.value = String(idx);
    opt.textContent = p.name || `Preset ${idx + 1}`;
    agentPresetSelect.appendChild(opt);
  });
  // Restore last selected index if available
  try {
    const stored = localStorage.getItem(AGENT_PRESET_SELECTED_KEY);
    const selIdx = stored === null || stored === '' ? NaN : parseInt(stored, 10);
    if (!isNaN(selIdx) && presets[selIdx]) {
      agentPresetSelect.value = String(selIdx);
    }
  } catch (e) {}
  // When presets change, exit "new" mode and ensure select is visible
  agentPresetIsNew = false;
  if (agentPresetSelect) agentPresetSelect.style.display = 'inline-block';
  if (agentPresetNameInput) agentPresetNameInput.style.display = 'none';
  updateAgentPresetButtonsState();
}

function updateAgentPresetButtonsState() {
  if (!agentPresetSelect) return;
  const presets = loadAgentPresets();
  const hasPresets = presets.length > 0;
  const selectedVal = agentPresetSelect.value;
  const hasSelection = hasPresets && selectedVal !== '' && !isNaN(parseInt(selectedVal, 10));

  const showSave = agentPresetIsNew || hasSelection;
  const showDelete = !agentPresetIsNew && hasSelection;

  if (agentPresetSaveBtn) {
    agentPresetSaveBtn.style.display = showSave ? 'inline-block' : 'none';
  }
  if (agentPresetDeleteBtn) {
    agentPresetDeleteBtn.style.display = showDelete ? 'inline-block' : 'none';
  }
  // New is always visible to allow creating first preset
  if (agentPresetNewBtn) {
    agentPresetNewBtn.style.display = agentPresetIsNew ? 'none' : 'inline-block';
  }
}

if (agentPresetSelect) {
  renderAgentPresets();
  agentPresetSelect.addEventListener('change', () => {
    const idx = parseInt(agentPresetSelect.value, 10);
    const presets = loadAgentPresets();
    if (!isNaN(idx) && presets[idx]) {
      applyTeamPresetFilters(presets[idx]);
      try { updateTeamRollButtonState(); } catch (e) {}
      try { localStorage.setItem(AGENT_PRESET_SELECTED_KEY, String(idx)); } catch (e) {}
    } else {
      // "No preset" selected – remember that choice
      try { localStorage.setItem(AGENT_PRESET_SELECTED_KEY, ''); } catch (e) {}
    }
    agentPresetIsNew = false;
    if (agentPresetSelect) agentPresetSelect.style.display = 'inline-block';
    if (agentPresetNameInput) agentPresetNameInput.style.display = 'none';
    updateAgentPresetButtonsState();
    setAgentPresetStatus('', null);
  });
}

if (agentPresetNewBtn) {
  agentPresetNewBtn.addEventListener('click', () => {
    setAgentPresetStatus('', null);
    // Toggle new-preset mode: clicking New again cancels back to dropdown
    agentPresetIsNew = !agentPresetIsNew;
    if (agentPresetIsNew) {
      if (agentPresetSelect) {
        agentPresetSelect.value = '';
        agentPresetSelect.style.display = 'none';
      }
      if (agentPresetNameInput) {
        agentPresetNameInput.style.display = 'inline-block';
        agentPresetNameInput.value = '';
        try { agentPresetNameInput.focus(); } catch (e) {}
      }
    } else {
      if (agentPresetSelect) agentPresetSelect.style.display = 'inline-block';
      if (agentPresetNameInput) agentPresetNameInput.style.display = 'none';
    }
    updateAgentPresetButtonsState();
  });
}

if (agentPresetSaveBtn) {
  agentPresetSaveBtn.addEventListener('click', () => {
    const presets = loadAgentPresets();
    if (agentPresetIsNew) {
      const name = (agentPresetNameInput?.value || '').trim();
      if (!name) {
        setAgentPresetStatus('Enter a preset name first.', 'error');
        return;
      }
      const exists = presets.some((p) => (p.name || '').toLowerCase() === name.toLowerCase());
      if (exists) {
        setAgentPresetStatus('A preset with that name already exists.', 'error');
        return;
      }
      const state = getCurrentFilterState();
      const preset = {
        name,
        roleFilter: state.roleFilter,
        excludedAgents: state.excludedAgents,
      };
      presets.push(preset);
      saveAgentPresets(presets);
      renderAgentPresets();
      const idx = loadAgentPresets().findIndex((p) => (p.name || '').toLowerCase() === name.toLowerCase());
      if (idx >= 0 && agentPresetSelect) {
        agentPresetSelect.value = String(idx);
        try { localStorage.setItem(AGENT_PRESET_SELECTED_KEY, String(idx)); } catch (e) {}
      }
      agentPresetIsNew = false;
      if (agentPresetSelect) agentPresetSelect.style.display = 'inline-block';
      if (agentPresetNameInput) agentPresetNameInput.style.display = 'none';
      updateAgentPresetButtonsState();
      setAgentPresetStatus(`Preset "${name}" created.`, 'success');
      return;
    }

    if (!agentPresetSelect) return;
    const idx = parseInt(agentPresetSelect.value, 10);
    if (isNaN(idx) || !presets[idx]) return;
    const state = getCurrentFilterState();
    presets[idx].roleFilter = state.roleFilter;
    presets[idx].excludedAgents = state.excludedAgents;
    saveAgentPresets(presets);
    setAgentPresetStatus(`Preset "${presets[idx].name || `Preset ${idx + 1}`}" updated.`, 'success');
  });
}

if (agentPresetDeleteBtn) {
  agentPresetDeleteBtn.addEventListener('click', () => {
    if (!agentPresetSelect) return;
    const idx = parseInt(agentPresetSelect.value, 10);
    if (isNaN(idx)) return;
    const presets = loadAgentPresets();
    if (!presets[idx]) return;
    const ok = window.confirm(`Delete agent preset "${presets[idx].name || `Preset ${idx + 1}`}"?`);
    if (!ok) return;
    presets.splice(idx, 1);
    saveAgentPresets(presets);
    renderAgentPresets();
    setAgentPresetStatus('Preset deleted.', 'success');
  });
}

if (teamRollBtn) {
  teamRollBtn.addEventListener('click', async () => {
    const team = collectTeamFromForm();
    const randomize = !!(teamRandomizeRoles && teamRandomizeRoles.checked);
    // Close the team modal before rolling
    try { if (teamsModalEl) teamsModalEl.setAttribute('aria-hidden', 'true'); } catch (e) {}
    try { if (typeof refreshModalOpenClass === 'function') refreshModalOpenClass(); } catch (e) {}
    // If the button is disabled due to an invalid composition, do nothing.
    if (teamRollBtn.disabled) return;
    await animatedTeamRoll(team, randomize);
  });
}

function clampInt(n, min, max) {
  n = parseInt(n, 10); if (isNaN(n)) n = 0; return Math.max(min, Math.min(max, n));
}

function getRoleComposition() {
  const c = clampInt(compController?.value, 0, 5);
  const d = clampInt(compDuelist?.value, 0, 5);
  const i = clampInt(compInitiator?.value, 0, 5);
  const s = clampInt(compSentinel?.value, 0, 5);
  return { Controller: c, Duelist: d, Initiator: i, Sentinel: s };
}

function setRoleComposition(comp) {
  try { if (compController) compController.value = clampInt(comp?.Controller, 0, 5); } catch (e) {}
  try { if (compDuelist) compDuelist.value = clampInt(comp?.Duelist, 0, 5); } catch (e) {}
  try { if (compInitiator) compInitiator.value = clampInt(comp?.Initiator, 0, 5); } catch (e) {}
  try { if (compSentinel) compSentinel.value = clampInt(comp?.Sentinel, 0, 5); } catch (e) {}
  try { updateCompInputsMax(); enforceCompSum(); } catch (e) {}
  try { updateTeamRollButtonState(); } catch (e) {}
}

function getTeamSize() {
  return clampInt(teamSizeInput?.value || 5, 1, 5);
}

function updateCompInputsMax() {
  const max = getTeamSize();
  try { if (compController) compController.max = String(max); } catch (e) {}
  try { if (compDuelist) compDuelist.max = String(max); } catch (e) {}
  try { if (compInitiator) compInitiator.max = String(max); } catch (e) {}
  try { if (compSentinel) compSentinel.max = String(max); } catch (e) {}
}

function updatePlayerRowsForTeamSize() {
  try {
    if (!teamPlayersContainer) return;
    const size = getTeamSize();
    const rows = Array.from(teamPlayersContainer.querySelectorAll('.team-player-row'));
    rows.forEach((row, idx) => {
      row.style.display = idx < size ? '' : 'none';
    });
    // Keep role visibility consistent with randomize toggle
    try { updateTeamRolesVisibility(); } catch (e) {}
    try { updateTeamRollButtonState(); } catch (e) {}
  } catch (e) {}
}

function enforceCompSum(changedInput) {
  const maxSum = getTeamSize();
  const c = clampInt(compController?.value, 0, maxSum);
  const d = clampInt(compDuelist?.value, 0, maxSum);
  const i = clampInt(compInitiator?.value, 0, maxSum);
  const s = clampInt(compSentinel?.value, 0, maxSum);
  let total = c + d + i + s;
  if (total <= maxSum) return; // nothing to do
  const over = total - maxSum;
  // reduce the changed input by the overflow (not below 0)
  if (changedInput) {
    const newVal = clampInt((parseInt(changedInput.value, 10) || 0) - over, 0, maxSum);
    changedInput.value = String(newVal);
    return;
  }
  // fallback: reduce Sentinel first, then Initiator, Duelist, Controller
  const order = [compSentinel, compInitiator, compDuelist, compController];
  let remaining = over;
  for (const inp of order) {
    if (!inp) continue;
    const val = clampInt(inp.value, 0, maxSum);
    if (val > 0) {
      const dec = Math.min(val, remaining);
      inp.value = String(val - dec);
      remaining -= dec;
      if (remaining <= 0) break;
    }
  }
}

if (teamSizeInput) {
  teamSizeInput.addEventListener('input', () => { updatePlayerRowsForTeamSize(); updateCompInputsMax(); enforceCompSum(); });
}
if (compController) compController.addEventListener('input', (e) => { enforceCompSum(e.target); try { updateTeamRollButtonState(); } catch (err) {} });
if (compDuelist) compDuelist.addEventListener('input', (e) => { enforceCompSum(e.target); try { updateTeamRollButtonState(); } catch (err) {} });
if (compInitiator) compInitiator.addEventListener('input', (e) => { enforceCompSum(e.target); try { updateTeamRollButtonState(); } catch (err) {} });
if (compSentinel) compSentinel.addEventListener('input', (e) => { enforceCompSum(e.target); try { updateTeamRollButtonState(); } catch (err) {} });

if (teamPlayersContainer) {
  try {
    teamPlayersContainer.querySelectorAll('.team-player-role').forEach((sel) => {
      sel.addEventListener('change', () => {
        try { updateTeamRollButtonState(); } catch (e) {}
      });
    });
  } catch (e) {}
}

// Animated team roll using the main spinning wheel
async function animatedTeamRoll(team, randomizeRolesFlag) {
  try {
    // Prepare players list and optional role randomization
    let players = (team?.players || []).map((p, i) => ({ idx: i, name: p.name || `Player ${i+1}`, role: p.role || '' }));
    if (!players.length) return;
    if (teamResults) teamResults.innerHTML = '';
    // Apply team size (cap to available rows) — prefer live input for safety
    const liveSize = (typeof getTeamSize === 'function') ? getTeamSize() : null;
    const size = clampInt((team?.size || liveSize || players.length), 1, players.length) || players.length;
    players = players.slice(0, size);
    // Apply team composition if provided; otherwise optional shuffle of user-selected roles
    if (randomizeRolesFlag) {
      // Prefer live composition values when randomizing; fall back to saved
      const comp = (typeof getRoleComposition === 'function')
        ? getRoleComposition()
        : (team?.comp || { Controller: 0, Duelist: 0, Initiator: 0, Sentinel: 0 });
      const counts = ['Controller','Duelist','Initiator','Sentinel']
        .map((k) => Math.max(0, parseInt(comp?.[k] || 0, 10) || 0));
      let expanded = [];
      const rolesOrder = ['Controller','Duelist','Initiator','Sentinel'];
      for (let r = 0; r < rolesOrder.length; r++) {
        const remaining = size - expanded.length;
        if (remaining <= 0) break;
        const toAdd = Math.min(counts[r], remaining);
        for (let n = 0; n < toAdd; n++) {
          expanded.push(rolesOrder[r]);
        }
      }
      // If we still need roles, fill with Any; otherwise trim to size
      if (expanded.length < size) {
        while (expanded.length < size) expanded.push('Any');
      } else if (expanded.length > size) {
        expanded = expanded.slice(0, size);
      }
      const roles = shuffle(expanded);
      for (let i = 0; i < players.length; i++) players[i].role = roles[i];
      // Defensive: ensure no Any appears if composition fills team size
      try {
        if (expanded.length >= size) {
          const remaining = roles.reduce((acc, r) => { acc[r] = (acc[r]||0)+1; return acc; }, {});
          players.forEach(p => { if (p.role && p.role !== 'Any') remaining[p.role] = Math.max(0,(remaining[p.role]||0)-1); });
          const orderFix = ['Controller','Duelist','Initiator','Sentinel'];
          players.forEach(p => {
            if (!p.role || p.role === 'Any') {
              const fill = orderFix.find(k => (remaining[k]||0) > 0);
              if (fill) { p.role = fill; remaining[fill] = remaining[fill]-1; }
            }
          });
        }
      } catch (e) {}
    } else {
      let roles = players.map(p => p.role).filter(Boolean);
      roles = shuffle(roles.slice());
      let r = 0;
      for (let i = 0; i < players.length; i++) {
        if (players[i].role) players[i].role = roles[r++] || players[i].role;
      }
    }

    // Randomize the spin order of players for this run, but always give
    // precedence to players with a concrete role over "Any" so constrained
    // categories (e.g., Duelist) are filled before Any players are considered.
    const rolePlayers = players.filter((p) => p.role && p.role !== 'Any');
    const anyPlayers = players.filter((p) => !p.role || p.role === 'Any');
    shuffle(rolePlayers);
    shuffle(anyPlayers);
    players = rolePlayers.concat(anyPlayers);

    // Snapshot state to restore later
    const prevAgents = agents.slice();
    const prevPlayerName = typeof playerName === 'string' ? playerName : '';
    const assigned = new Set();
    // Disable roll button during sequence
    const prevDisabled = !!teamRollBtn.disabled;
    teamRollBtn.disabled = true;

    const resultsAccum = [];
    window.suppressWinnerModal = true;
    clearTeamFeed();
    showTeamFeedUI(false); // start visible, controls disabled until finished
    for (const p of players) {
      // Build pool: primary is role-specific (or Any), then remove already-assigned agents.
      let allList = (typeof allAgents !== 'undefined' ? allAgents : agents) || [];
      if (typeof isAgentExcluded === 'function') {
        allList = allList.filter((a) => !isAgentExcluded(a));
      }
      const primary = (p.role && p.role !== 'Any') ? agentsByRole(p.role) : allList;
      let pool = Array.isArray(primary) ? primary.slice() : allList.slice();
      // Remove agents already chosen in this session
      if (assigned.size) pool = pool.filter(a => !assigned.has((a.name || '').toLowerCase()));
      // If role pool exhausted, fall back to any role but still exclude assigned
      if (!pool.length) pool = allList.filter(a => !assigned.has((a.name || '').toLowerCase()));
      // As a last resort (should rarely happen), use all agents
      if (!pool.length) pool = allList.slice();

      // Apply pool to wheel and set temporary name for modal
      agents = pool.slice();
      try { prevRel = null; prevIndex = null; } catch (e) {}
      try { drawWheel(true); } catch (e) {}
      const oldName = typeof playerName === 'string' ? playerName : '';
      playerName = p.name;

      // Trigger a spin and wait for selection via interception
      await ensureAudioReady();
      const chosenPromise = waitForWinnerSelection();
      spinWheel();
      const chosen = await chosenPromise;

      // Record assignment and render incrementally
      if (chosen && chosen.name) assigned.add((chosen.name || '').toLowerCase());
      const entry = { player: p.name, role: p.role || 'Any', agent: chosen?.name || 'Random', img: chosen?.img || '' };
      resultsAccum.push(entry);
      renderTeamResults(resultsAccum);
      appendTeamFeedItem(entry);

      // Restore playerName default for next iterations (will be reset again per player)
      playerName = oldName;
    }

    // Restore wheel state
    agents = prevAgents.slice();
    try { drawWheel(true); } catch (e) {}
    playerName = prevPlayerName;
    teamRollBtn.disabled = prevDisabled;
    window.suppressWinnerModal = false;
    window.lastTeamAssignments = resultsAccum;
    try {
      if (teamCopyProofBtn) teamCopyProofBtn.disabled = !resultsAccum.length;
      if (teamFeedCloseBtn) teamFeedCloseBtn.disabled = !resultsAccum.length;
    } catch (e) {}
    showTeamFeedUI(true); // enable controls after completion
    // Ensure controls are visible and scrolled into view
    try {
      if (teamFeed && teamFeedControls && teamFeedControls.parentElement !== teamFeed) {
        teamFeed.appendChild(teamFeedControls);
      }
      if (teamFeedControls) {
        teamFeedControls.classList.remove('hidden');
        teamFeedControls.style.display = 'flex';
        try { teamFeedControls.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
      }
    } catch (e) {}
  } catch (e) {
    try { teamRollBtn.disabled = false; } catch (err) {}
    try { window.suppressWinnerModal = false; } catch (err) {}
  }
}

function ensureAudioReady() {
  try {
    if (audioCtx && audioCtx.state === 'suspended') return audioCtx.resume();
  } catch (e) {}
  return Promise.resolve();
}

function waitForWinnerSelection(timeoutMs = 20000) {
  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) { settled = true; try { window.onWinnerSelected = null; } catch (e) {} resolve(lastWinnerAgent || null); }
    }, Math.max(1000, timeoutMs));
    try {
      window.onWinnerSelected = (agent) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        try { window.onWinnerSelected = null; } catch (e) {}
        resolve(agent || null);
      };
    } catch (e) { /* ignore */ }
  });
}

function clearTeamFeed() {
  if (!teamFeed) return;
  teamFeed.innerHTML = '';
}
function appendTeamFeedItem(entry) {
  if (!teamFeed || !entry) return;
  const row = document.createElement('div');
  row.className = 'team-feed-item';
  // Color background from agent color if available
  try {
    const agentObj = findAgentByName(entry.agent);
    const base = (agentObj && agentObj.color) ? agentObj.color : (typeof nameToColor === 'function' ? nameToColor(entry.agent || '') : '#333');
    const bg1 = (typeof shadeColor === 'function') ? shadeColor(base, -0.4) : base;
    const bg2 = (typeof shadeColor === 'function') ? shadeColor(base, -0.2) : base;
    row.style.background = `linear-gradient(135deg, ${bg1}, ${bg2})`;
    row.style.borderColor = 'rgba(255,255,255,0.12)';
  } catch (e) {}
  const img = document.createElement('img');
  if (entry.img) { img.src = entry.img; img.alt = entry.agent; }
  const textWrap = document.createElement('div');
  const line1 = document.createElement('div'); line1.className = 'tf-player'; line1.textContent = entry.player;
  const line2 = document.createElement('div'); line2.className = 'tf-role'; line2.textContent = `${entry.role} · ${entry.agent}`;
  textWrap.appendChild(line1); textWrap.appendChild(line2);
  if (entry.img) row.appendChild(img);
  row.appendChild(textWrap);
  teamFeed.appendChild(row);
  requestAnimationFrame(() => { row.classList.add('entered'); });
}

function findAgentByName(name) {
  try {
    const list = (typeof allAgents !== 'undefined' && Array.isArray(allAgents)) ? allAgents : agents;
    return (list || []).find(a => (a.name || '').toLowerCase() === String(name || '').toLowerCase());
  } catch (e) { return null; }
}

function showTeamFeedUI(enableControls) {
  try { document.body.classList.add('team-feed-visible'); } catch (e) {}
  if (teamFeedControls) {
    if (enableControls) {
      teamFeedControls.classList.remove('hidden');
      try { teamFeedControls.style.display = 'flex'; } catch (e) {}
    } else {
      teamFeedControls.classList.add('hidden');
      try { teamFeedControls.style.display = 'none'; } catch (e) {}
    }
  }
  try {
    if (teamCopyProofBtn) teamCopyProofBtn.disabled = enableControls ? (window.lastTeamAssignments ? !window.lastTeamAssignments.length : true) : true;
    if (teamFeedCloseBtn) teamFeedCloseBtn.disabled = !enableControls;
  } catch (e) {}
}

function hideTeamFeedUI(clear = true) {
  try { document.body.classList.remove('team-feed-visible'); } catch (e) {}
  if (teamFeedControls) teamFeedControls.classList.add('hidden');
  try {
    if (teamCopyProofBtn) teamCopyProofBtn.disabled = true;
    if (teamFeedCloseBtn) teamFeedCloseBtn.disabled = true;
  } catch (e) {}
  if (clear) clearTeamFeed();
}

// Close team feed on button
if (teamFeedCloseBtn) {
  teamFeedCloseBtn.addEventListener('click', () => hideTeamFeedUI(true));
}

// Copy team proof image
if (teamCopyProofBtn) {
  teamCopyProofBtn.addEventListener('click', async () => {
    try {
      const list = Array.isArray(window.lastTeamAssignments) ? window.lastTeamAssignments : [];
      if (!list.length) return;
      teamCopyProofBtn.disabled = true;
      const { success } = await copyTeamShareImage(list, teamNameInput?.value || 'Team');
      teamCopyProofBtn.disabled = false;
    } catch (e) {}
  });
}

async function copyTeamShareImage(assignments, teamName = 'Team') {
  try {
    const canvas = await generateTeamShareCanvas(assignments, teamName);
    if (!canvas) return { success: false };
    return await new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) return resolve({ success: false });
        try {
          if (navigator?.clipboard?.write && window.ClipboardItem) {
            const item = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([item]);
            return resolve({ success: true });
          }
        } catch (e) {}
        resolve({ success: false });
      }, 'image/png');
    });
  } catch (e) {
    return { success: false };
  }
}

async function generateTeamShareCanvas(assignments, teamName = 'Team') {
  try {
    // Use settings modal greys for background
    const settingsLite = '#2b2c3d';
    const settingsDark = '#12131b';
    const lightText = 'rgba(255,255,255,0.9)';
    const mutedText = 'rgba(255,255,255,0.75)';
    const width = 900, height = 540;
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d'); if (!ctx) return null;
    // Background gradient similar to settings modal
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, settingsLite);
    gradient.addColorStop(1, settingsDark);
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = lightText; ctx.font = '18px "Segoe UI", "Montserrat", sans-serif';
    ctx.fillText('Valorant Agent Wheelspin', 32, 40);
    ctx.fillStyle = '#fff'; ctx.font = '36px "Montserrat", "Segoe UI", sans-serif';
    ctx.fillText(teamName + ' — Team Roll', 32, 84);

    const rowY0 = 140; const rowH = 88; const imgSize = 56; const cardRadius = 14; const cardPad = 12;
    for (let i = 0; i < assignments.length; i++) {
      const a = assignments[i]; const y = rowY0 + i * rowH;
      // Card rect
      const cardX = 24, cardY = y - 38, cardW = width - 48, cardH = 76;
      // Build agent-colored gradient like the left feed
      let baseCol = '#333';
      try {
        const agentObj = findAgentByName(a.agent);
        baseCol = (agentObj && agentObj.color) ? agentObj.color : (typeof nameToColor === 'function' ? nameToColor(a.agent || '') : '#333');
      } catch (e) {}
      const g = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
      try {
        const bg1 = (typeof shadeColor === 'function') ? shadeColor(baseCol, -0.4) : baseCol;
        const bg2 = (typeof shadeColor === 'function') ? shadeColor(baseCol, -0.2) : baseCol;
        g.addColorStop(0, bg1); g.addColorStop(1, bg2);
      } catch (e) { g.addColorStop(0, baseCol); g.addColorStop(1, baseCol); }
      ctx.fillStyle = g;
      ctx.save();
      if (ctx.roundRect) {
        ctx.beginPath(); ctx.roundRect(cardX, cardY, cardW, cardH, cardRadius); ctx.fill();
      } else {
        ctx.fillRect(cardX, cardY, cardW, cardH);
      }
      ctx.restore();
      // image
      if (a.img) {
        try {
          const bmp = await loadAgentImageBitmap({ img: a.img, name: a.agent });
          if (bmp) {
            const imgY = cardY + Math.max(6, Math.floor((cardH - imgSize) / 2));
            ctx.drawImage(bmp, cardX + cardPad, imgY, imgSize, imgSize);
          }
        } catch (e) {}
      }
      // text lines
      const textX = cardX + cardPad + imgSize + 16;
      const nameY = cardY + Math.floor(cardH / 2) - 4;
      const roleY = nameY + 24;
      ctx.fillStyle = '#fff'; ctx.font = '22px "Montserrat", "Segoe UI", sans-serif';
      ctx.fillText(a.player || 'Player', textX, nameY);
      ctx.fillStyle = mutedText; ctx.font = '18px "Segoe UI", sans-serif';
      const role = a.role || 'Any'; const agent = a.agent || 'Random';
      ctx.fillText(`${role} · ${agent}`, textX, roleY);
    }

    return canvas;
  } catch (e) { return null; }
}

// Pointer arrow color picker
if (pointerColorInput) {
  try {
    const initial = (typeof window !== 'undefined' && window.pointerColor) ? window.pointerColor : '#ffd45c';
    pointerColorInput.value = normalizeHex(initial) || '#ffd45c';
  } catch (e) {}
  pointerColorInput.addEventListener('input', (e) => {
    try {
      const val = normalizeHex(e.target.value);
      if (!val) return;
      window.pointerColor = val;
      try { localStorage.setItem('pointerColor', val); } catch (err) {}
      // Pointer styling changed; redraw without rebuilding the static wheel buffer.
      try { drawWheel(false); } catch (err) {}
    } catch (err) {}
  });
}

// Attach spin button
// Allow clicking the wheel canvas to spin
if (spinBtn) {
  spinBtn.addEventListener('click', () => {
    if (spinning || agents.length === 0) return;
    // Ensure Web Audio is created and resumed on first user gesture,
    // so mobile browsers allow subsequent programmatic playback (win lines, ticks, drumroll).
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!audioCtx && AudioContext) {
        audioCtx = new AudioContext();
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    } catch (e) {}
    // Hide/clear team feed on any new spin
    try { hideTeamFeedUI(true); } catch (e) {}
    spinWheel();
  });
}

if (canvas) {
  canvas.addEventListener('click', (e) => {
    // ignore clicks if spinning
    if (!spinning && agents.length > 0) {
      // resume audio context on first user gesture if needed (some browsers block audio until user interacts)
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!audioCtx && AudioContext) {
          audioCtx = new AudioContext();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
          audioCtx.resume();
        }
      } catch (e) {}
      try { hideTeamFeedUI(true); } catch (e) {}
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
    try { if (typeof refreshModalOpenClass === 'function') refreshModalOpenClass(); } catch (e) {}
  });
  closeSettings.addEventListener('click', () => {
    settingsModal.setAttribute('aria-hidden', 'true');
    try { if (typeof refreshModalOpenClass === 'function') refreshModalOpenClass(); } catch (e) {}
  });
  // Close when clicking outside modal-content
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      settingsModal.setAttribute('aria-hidden', 'true');
      try { if (typeof refreshModalOpenClass === 'function') refreshModalOpenClass(); } catch (err) {}
    }
  });
}

// Teams modal open/close
if (teamsBtnEl && teamsModalEl && closeTeamsEl) {
  teamsBtnEl.addEventListener('click', () => {
    teamsModalEl.setAttribute('aria-hidden', 'false');
    try { if (typeof refreshModalOpenClass === 'function') refreshModalOpenClass(); } catch (e) {}
  });
  closeTeamsEl.addEventListener('click', () => {
    teamsModalEl.setAttribute('aria-hidden', 'true');
    try { if (typeof refreshModalOpenClass === 'function') refreshModalOpenClass(); } catch (e) {}
  });
  teamsModalEl.addEventListener('click', (e) => {
    if (e.target === teamsModalEl) {
      teamsModalEl.setAttribute('aria-hidden', 'true');
      try { if (typeof refreshModalOpenClass === 'function') refreshModalOpenClass(); } catch (err) {}
    }
  });
}

// Agents modal (agent pool) open/close
const agentsModalEl = document.getElementById('agentsModal');
const closeAgentsEl = document.getElementById('closeAgents');
if (agentFilterBtn && agentsModalEl && closeAgentsEl) {
  agentFilterBtn.addEventListener('click', () => {
    agentsModalEl.setAttribute('aria-hidden', 'false');
    try { if (typeof refreshModalOpenClass === 'function') refreshModalOpenClass(); } catch (e) {}
    try { renderAgentAvailabilityList(); } catch (e) {}
  });
  closeAgentsEl.addEventListener('click', () => {
    agentsModalEl.setAttribute('aria-hidden', 'true');
    try { if (typeof refreshModalOpenClass === 'function') refreshModalOpenClass(); } catch (e) {}
  });
  agentsModalEl.addEventListener('click', (e) => {
    if (e.target === agentsModalEl) {
      agentsModalEl.setAttribute('aria-hidden', 'true');
      try { if (typeof refreshModalOpenClass === 'function') refreshModalOpenClass(); } catch (err) {}
    }
  });
}

// Winner modal close handlers
if (winnerModal && closeWinner) {
  closeWinner.addEventListener('click', () => {
    closeWinnerModal({restoreFocus: true});
  });
}
if (closeWinnerBtn && winnerModal) {
  closeWinnerBtn.addEventListener('click', () => {
    closeWinnerModal({restoreFocus: true});
  });
}

// Also close the winner modal when clicking outside the content and resume idle
if (winnerModal) {
  winnerModal.addEventListener('click', (e) => {
    if (e.target === winnerModal) {
      closeWinnerModal({restoreFocus: true});
    }
  });
}

// Keyboard shortcuts: Space to spin, Escape to close modals
document.addEventListener('keydown', (e) => {
  if (e.defaultPrevented) return;
  const key = e.key || e.code;
  const tag = (e.target && e.target.tagName ? e.target.tagName : '').toLowerCase();
  const isTyping = (e.target && (e.target.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select')); 

  // Close modals with Escape
  if (key === 'Escape' || key === 'Esc') {
    let handled = false;
    if (winnerModalOpen) {
      closeWinnerModal({restoreFocus: true});
      handled = true;
    }
    const settingsOpen = settingsModal && settingsModal.getAttribute('aria-hidden') === 'false';
    if (settingsOpen) {
      settingsModal.setAttribute('aria-hidden', 'true');
      handled = true;
    }
    const teamsOpen = teamsModalEl && teamsModalEl.getAttribute('aria-hidden') === 'false';
    if (teamsOpen) {
      teamsModalEl.setAttribute('aria-hidden', 'true');
      handled = true;
    }
    const agentsOpen = agentsModalEl && agentsModalEl.getAttribute('aria-hidden') === 'false';
    if (agentsOpen) {
      agentsModalEl.setAttribute('aria-hidden', 'true');
      handled = true;
    }
    try { if (typeof refreshModalOpenClass === 'function') refreshModalOpenClass(); } catch (e) {}
    if (handled) e.preventDefault();
    return;
  }

  // Start wheel with Space (when not typing and no modal open)
  if ((key === ' ' || key === 'Space' || key === 'Spacebar') && !isTyping) {
    const settingsOpen = settingsModal && settingsModal.getAttribute('aria-hidden') === 'false';
    if (!spinning && agents.length > 0 && !winnerModalOpen && !settingsOpen) {
      e.preventDefault();
      try {
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
      } catch (err) {}
      try { hideTeamFeedUI(true); } catch (e) {}
      spinWheel();
    }
  }
});

// Update canvas size on load
window.addEventListener('load', () => {
  resizeCanvas();
  loadCenterIcon();
});

// Populate per-agent settings DOM
function populatePerAgentSettings() {
  if (!perAgentSettingsDiv) return;
  perAgentSettingsDiv.innerHTML = '';
  agents.forEach((agent) => {
    const block = document.createElement('div');
    block.className = 'agent-setting';

    const header = document.createElement('div');
    header.className = 'agent-setting-header';

    const img = document.createElement('img');
    img.src = agent.img || '';
    img.alt = agent.name;
    img.width = 36;
    img.height = 36;
    img.style.objectFit = 'cover';
    img.style.borderRadius = '4px';

    const title = document.createElement('div');
    title.className = 'agent-setting-title';
    title.textContent = agent.name;

    header.appendChild(img);
    header.appendChild(title);
    block.appendChild(header);

    // Collapsible section for this agent's sounds
    const details = document.createElement('details');
    details.className = 'agent-sounds-collapsible';
    details.open = false; // start collapsed

    const summary = document.createElement('summary');
    summary.className = 'agent-sounds-summary';
    // Prefer manifest-based count (does not trigger network), fallback to known list if >1
    const manifest = (typeof window !== 'undefined') ? window.AGENT_SOUND_MANIFEST : null;
    const slug = (agent?.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    let count = 0;
    if (manifest && slug && Array.isArray(manifest[slug])) {
      count = manifest[slug].length | 0;
    } else {
      const known = Array.isArray(agent.winSounds) ? agent.winSounds.length : 0;
      if (known > 1) count = known;
    }
    summary.textContent = count > 0 ? `Voice lines (${count})` : 'Voice lines';
    details.appendChild(summary);

    const soundList = document.createElement('div');
    soundList.className = 'agent-sound-list';
    renderAgentSoundRows(agent, soundList);
    details.appendChild(soundList);

    // Lazy-load additional sound variants on first open
    let loadedVariants = !!agent._soundsBuilt || (Array.isArray(agent.winSounds) && agent.winSounds.length > 1);
    details.addEventListener('toggle', async () => {
      if (!details.open) return;
      if (loadedVariants) return;
      loadedVariants = true;
      try {
        if (typeof window.buildAgentSoundList === 'function') {
          await window.buildAgentSoundList(agent);
          // Re-render with any discovered sounds
          soundList.innerHTML = '';
          renderAgentSoundRows(agent, soundList);
          const newCount = Array.isArray(agent.winSounds) ? agent.winSounds.length : 0;
          summary.textContent = newCount ? `Voice lines (${newCount})` : 'Voice lines';
        }
      } catch (e) {
        // ignore
      }
    });

    block.appendChild(details);

    perAgentSettingsDiv.appendChild(block);
  });
}

function renderAgentSoundRows(agent, container) {
  const sounds = Array.isArray(agent.winSounds) && agent.winSounds.length ? agent.winSounds : null;
  if (!sounds) {
    const empty = document.createElement('div');
    empty.className = 'agent-sound-empty';
    empty.textContent = 'Loading sounds...';
    container.appendChild(empty);
    return;
  }

  sounds.forEach((sound) => {
    const row = document.createElement('div');
    row.className = 'agent-sound-row';

    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = sound.enabled !== false;
    const defaultLocked = !randomizeWinSounds && sound.isDefault;
    checkbox.disabled = defaultLocked;
    checkbox.addEventListener('change', (e) => {
      const enabled = !!e.target.checked;
      if (typeof setAgentSoundEnabled === 'function') {
        const finalState = setAgentSoundEnabled(agent.name, sound.path, enabled);
        sound.enabled = finalState;
        e.target.checked = finalState;
        if (finalState === false && !randomizeWinSounds && sound.isDefault) {
          checkbox.disabled = true;
        }
      }
    });

    const nameSpan = document.createElement('span');
    const friendlyName = sound.label || sound.path?.split('/').pop();
    nameSpan.textContent = friendlyName || 'Sound';

    label.appendChild(checkbox);
    label.appendChild(nameSpan);

    const actions = document.createElement('div');
    actions.className = 'agent-sound-actions';
    const previewBtn = document.createElement('button');
    previewBtn.type = 'button';
    previewBtn.className = 'agent-sound-preview';
    previewBtn.textContent = '▶';
    previewBtn.title = 'Preview sound';
    previewBtn.setAttribute('aria-label', `Preview ${friendlyName} for ${agent.name}`);
    previewBtn.addEventListener('click', () => previewAgentSound(sound.path));
    actions.appendChild(previewBtn);

    row.appendChild(label);
    row.appendChild(actions);
    container.appendChild(row);
  });
}

function previewAgentSound(path) {
  if (!path) return;
  try {
    const audio = new Audio(path);
    audio.volume = agentWinVolume;
    audio.play().catch(() => {});
  } catch (e) {}
}
