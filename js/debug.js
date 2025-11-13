function populateDebugAgentSelect() {
  if (!debugAgentSelect) return;
  const currentValue = debugAgentSelect.value;
  debugAgentSelect.innerHTML = '';
  const frag = document.createDocumentFragment();
  agents.forEach((agent, idx) => {
    const option = document.createElement('option');
    option.value = agent.name;
    option.textContent = agent.name;
    if (currentValue) {
      option.selected = agent.name === currentValue;
    } else if (idx === 0) {
      option.selected = true;
    }
    frag.appendChild(option);
  });
  debugAgentSelect.appendChild(frag);
}

function showDebugPanel() {
  if (!debugPanel) return;
  if (debugPanelVisible) return;
  populateDebugAgentSelect();
  debugPanel.classList.add('debug-visible');
  debugPanel.setAttribute('aria-hidden', 'false');
  debugPanelVisible = true;
}

function hideDebugPanel() {
  if (!debugPanel) return;
  if (!debugPanelVisible) return;
  debugPanel.classList.remove('debug-visible');
  debugPanel.setAttribute('aria-hidden', 'true');
  debugPanelVisible = false;
}

function shouldIgnoreDebugShortcut(target) {
  if (!target) return false;
  const tag = target.tagName ? target.tagName.toLowerCase() : '';
  if (['input', 'textarea', 'select'].includes(tag)) return true;
  return !!target.isContentEditable;
}

function trackDebugSequenceInput(key) {
  debugKeyBuffer.push(key);
  if (debugKeyBuffer.length > DEBUG_KEY_SEQUENCE.length) {
    debugKeyBuffer.shift();
  }
  if (debugSequenceTimer) {
    clearTimeout(debugSequenceTimer);
    debugSequenceTimer = null;
  }
  debugSequenceTimer = setTimeout(() => {
    debugKeyBuffer = [];
    debugSequenceTimer = null;
  }, DEBUG_SEQUENCE_RESET_MS);

  const matches = DEBUG_KEY_SEQUENCE.every((value, idx) => debugKeyBuffer[idx] === value);
  if (matches) {
    debugKeyBuffer = [];
    if (debugSequenceTimer) {
      clearTimeout(debugSequenceTimer);
      debugSequenceTimer = null;
    }
    showDebugPanel();
  }
}

function handleDebugKeydown(event) {
  if (event.key === 'Escape' && debugPanelVisible) {
    hideDebugPanel();
    return;
  }
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  if (!event.key || event.key.length !== 1) return;
  if (shouldIgnoreDebugShortcut(event.target)) return;
  trackDebugSequenceInput(event.key);
}

populateDebugAgentSelect();
if (debugShowWinnerBtn) {
  debugShowWinnerBtn.addEventListener('click', () => {
    const selectedName = debugAgentSelect?.value;
    const agent = agents.find((a) => a.name === selectedName) || agents[0];
    if (agent) {
      openWinnerModalForAgent(agent, { playSound: false, proofPrefix: 'DEBUG' });
    }
  });
}
if (debugHideBtn) {
  debugHideBtn.addEventListener('click', () => {
    hideDebugPanel();
  });
}
document.addEventListener('keydown', handleDebugKeydown);

