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

