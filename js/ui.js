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
    try { if (fallbackTickAudio) fallbackTickAudio.volume = tickVolume; } catch (e) {}
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

