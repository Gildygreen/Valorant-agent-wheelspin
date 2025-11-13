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
const roleFilterBar = document.getElementById('roleFilterBar');
const roleButtons = [
  { id: 'roleBtnController', role: 'Controller' },
  { id: 'roleBtnDuelist', role: 'Duelist' },
  { id: 'roleBtnInitiator', role: 'Initiator' },
  { id: 'roleBtnSentinel', role: 'Sentinel' },
];

// Teams modal UI elements
const teamsBtnEl = document.getElementById('teamsBtn');
const teamsModalEl = document.getElementById('teamsModal');
const closeTeamsEl = document.getElementById('closeTeams');
const teamNameInput = document.getElementById('teamNameInput');
const teamPlayersContainer = document.getElementById('teamPlayers');
const teamRandomizeRoles = document.getElementById('teamRandomizeRoles');
const savedTeamsSelect = document.getElementById('savedTeamsSelect');
const teamNewBtn = document.getElementById('teamNewBtn');
const teamSaveBtn = document.getElementById('teamSaveBtn');
const teamDeleteBtn = document.getElementById('teamDeleteBtn');
const teamRollBtn = document.getElementById('teamRollBtn');
const teamResults = document.getElementById('teamResults');
// Composition inputs
const compController = document.getElementById('compController');
const compDuelist = document.getElementById('compDuelist');
const compInitiator = document.getElementById('compInitiator');
const compSentinel = document.getElementById('compSentinel');

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
}
function getFormPlayers() {
  const rows = teamPlayersContainer ? Array.from(teamPlayersContainer.querySelectorAll('.team-player-row')) : [];
  return rows.map((row) => {
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
}
function collectTeamFromForm() {
  return {
    name: (teamNameInput?.value || '').trim() || 'Team',
    players: getFormPlayers(),
    comp: getRoleComposition(),
  };
}
function populateFormFromTeam(team) {
  if (!team) return;
  if (teamNameInput) teamNameInput.value = team.name || '';
  setFormPlayers(team.players || []);
  setRoleComposition(team.comp || { Controller: 0, Duelist: 0, Initiator: 0, Sentinel: 0 });
}

if (savedTeamsSelect) {
  renderSavedTeams();
  savedTeamsSelect.addEventListener('change', () => {
    const idx = parseInt(savedTeamsSelect.value, 10);
    const teams = loadTeams();
    if (!isNaN(idx) && teams[idx]) {
      populateFormFromTeam(teams[idx]);
    }
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
    const list = (typeof allAgents !== 'undefined' && Array.isArray(allAgents)) ? allAgents : agents;
    return (list || []).filter(a => (a.role || '').toLowerCase() === (role || '').toLowerCase());
  } catch (e) { return []; }
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

if (teamRollBtn) {
  teamRollBtn.addEventListener('click', async () => {
    const team = collectTeamFromForm();
    const randomize = !!(teamRandomizeRoles && teamRandomizeRoles.checked);
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
}

// Animated team roll using the main spinning wheel
async function animatedTeamRoll(team, randomizeRolesFlag) {
  try {
    // Prepare players list and optional role randomization
    const players = (team?.players || []).map((p, i) => ({ idx: i, name: p.name || `Player ${i+1}`, role: p.role || '' }));
    if (!players.length) return;
    if (teamResults) teamResults.innerHTML = '';
    // Apply team composition if provided; otherwise optional shuffle of user-selected roles
    const comp = team?.comp || { Controller: 0, Duelist: 0, Initiator: 0, Sentinel: 0 };
    const compSum = ['Controller','Duelist','Initiator','Sentinel']
      .map((k) => parseInt(comp?.[k] || 0, 10) || 0)
      .reduce((a,b)=>a+b,0);
    if (compSum > 0) {
      const teamSize = players.length;
      const desired = [];
      const pushMany = (role, count) => { for (let n=0; n<Math.min(count, teamSize - desired.length); n++) desired.push(role); };
      pushMany('Controller', parseInt(comp.Controller||0,10)||0);
      pushMany('Duelist', parseInt(comp.Duelist||0,10)||0);
      pushMany('Initiator', parseInt(comp.Initiator||0,10)||0);
      pushMany('Sentinel', parseInt(comp.Sentinel||0,10)||0);
      while (desired.length < teamSize) desired.push('Any');
      const roles = shuffle(desired);
      for (let i = 0; i < players.length; i++) players[i].role = roles[i];
    } else if (randomizeRolesFlag) {
      let roles = players.map(p => p.role).filter(Boolean);
      roles = shuffle(roles.slice());
      let r = 0;
      for (let i = 0; i < players.length; i++) {
        if (players[i].role) players[i].role = roles[r++] || players[i].role;
      }
    }

    // Snapshot state to restore later
    const prevAgents = agents.slice();
    const prevPlayerName = typeof playerName === 'string' ? playerName : '';
    const assigned = new Set();
    // Disable roll button during sequence
    const prevDisabled = !!teamRollBtn.disabled;
    teamRollBtn.disabled = true;

    const resultsAccum = [];
    for (const p of players) {
      // Build pool: agents of role (if specified), excluding already assigned
      let pool = (p.role ? agentsByRole(p.role) : (typeof allAgents !== 'undefined' ? allAgents : agents)) || [];
      if (!pool.length) pool = (typeof allAgents !== 'undefined' ? allAgents : agents) || [];
      if (assigned.size) {
        pool = pool.filter(a => !assigned.has((a.name || '').toLowerCase()));
      }
      if (!pool.length) pool = prevAgents.slice();

      // Apply pool to wheel and set temporary name for modal
      agents = pool.slice();
      try { prevRel = null; prevIndex = null; } catch (e) {}
      try { drawWheel(); } catch (e) {}
      const oldName = typeof playerName === 'string' ? playerName : '';
      playerName = p.name;

      // Trigger a spin and wait for selection
      await ensureAudioReady();
      spinWheel();
      const chosen = await waitForWinnerAndAutoClose();

      // Record assignment and render incrementally
      if (chosen && chosen.name) assigned.add((chosen.name || '').toLowerCase());
      resultsAccum.push({ player: p.name, role: p.role || 'Any', agent: chosen?.name || 'Random', img: chosen?.img || '' });
      renderTeamResults(resultsAccum);

      // Restore playerName default for next iterations (will be reset again per player)
      playerName = oldName;
    }

    // Restore wheel state
    agents = prevAgents.slice();
    try { drawWheel(); } catch (e) {}
    playerName = prevPlayerName;
    teamRollBtn.disabled = prevDisabled;
  } catch (e) {
    try { teamRollBtn.disabled = false; } catch (err) {}
  }
}

function ensureAudioReady() {
  try {
    if (audioCtx && audioCtx.state === 'suspended') return audioCtx.resume();
  } catch (e) {}
  return Promise.resolve();
}

function waitForWinnerAndAutoClose(timeoutMs = 20000, displayMs = 1200) {
  return new Promise((resolve) => {
    const start = Date.now();
    const poll = () => {
      if (lastWinnerAgent && winnerModalOpen) {
        const chosen = lastWinnerAgent;
        setTimeout(() => {
          try { closeWinnerModal({ restoreFocus: false }); } catch (e) {}
          resolve(chosen);
        }, Math.max(400, displayMs));
        return;
      }
      if (Date.now() - start > timeoutMs) {
        resolve(lastWinnerAgent || null);
        return;
      }
      requestAnimationFrame(poll);
    };
    poll();
  });
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
      try { drawWheel(); } catch (err) {}
    } catch (err) {}
  });
}

// Attach spin button
// Allow clicking the wheel canvas to spin
if (spinBtn) {
  spinBtn.addEventListener('click', () => {
    if (spinning || agents.length === 0) return;
    try {
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    } catch (e) {}
    spinWheel();
  });
}

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

