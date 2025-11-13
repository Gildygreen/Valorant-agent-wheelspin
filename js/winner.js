function generateProofId(prefix = 'SPIN') {
  let token = null;
  try {
    if (crypto?.randomUUID) token = crypto.randomUUID();
  } catch (e) {}
  if (!token) {
    token = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
  return prefix ? `${prefix}-${token}` : token;
}

function getAvailableAgentSounds(agent) {
  if (!agent?.winSounds) return [];
  return agent.winSounds.filter((sound) => sound?.path && (sound.enabled !== false || sound.isDefault));
}

function getWinSoundPath(agent) {
  if (!agent) return null;
  const available = getAvailableAgentSounds(agent);
  if (!available.length) return null;
  if (randomizeWinSounds && available.length > 1) {
    const idx = Math.floor(Math.random() * available.length);
    return available[idx]?.path || null;
  }
  const defaultSound = available.find((s) => s.isDefault);
  return (defaultSound || available[0])?.path || null;
}

function playWinSound(path) {
  if (!path) return;
  try {
    const audio = new Audio(path);
    audio.volume = agentWinVolume;
    audio.preload = 'auto';
    audio.play().catch(() => {});
  } catch (e) {}
}

function openWinnerModalForAgent(agent, options = {}) {
  if (!agent) return;
  const {
    playSound = true,
    proofPrefix = 'SPIN',
  } = options;

  try {
    applyWinnerTheme(computeWinnerTheme(agent.color));
  } catch (e) {}

  lastWinnerAgent = agent;
  lastSpinProofId = proofPrefix ? generateProofId(proofPrefix) : null;
  if (shareWinnerBtn) shareWinnerBtn.disabled = false;
  if (shareStatus) shareStatus.textContent = '';

  if (winnerModal && winnerModalName && winnerModalImage) {
    winnerModalName.textContent = 'You will be playing ' + agent.name;
    winnerModalImage.src = agent.img || 'assets/images/default-avatar.jpg';
    winnerModal.setAttribute('aria-hidden', 'false');
    winnerModal.removeAttribute('inert');
    idlePaused = true;
    winnerModalOpen = true;
    angularVelocity = 0;
    // Blur only the wheel while the modal is visible
    try {
      const wheelContainer = document.getElementById('wheelContainer');
      if (wheelContainer) wheelContainer.classList.add('blurred');
    } catch (e) {}
    const focusTarget = closeWinnerBtn || closeWinner;
    if (focusTarget && typeof focusTarget.focus === 'function') {
      try { focusTarget.focus({preventScroll: true}); }
      catch (e) { try { focusTarget.focus(); } catch (err) {} }
    }
  }

  if (playSound) {
    playWinSound(getWinSoundPath(agent));
  }
}

function showWinnerModal() {
  if (!agents || agents.length === 0) return; // safety check
  try { scheduleDrumrollStop(1200); } catch (e) {}
  
  const arc = Math.PI * 2 / agents.length;
  // Marker is at the top, pointing downwards (angle = -Math.PI/2). Find which slice covers that absolute angle
  const pointerAngle = -Math.PI / 2; // top marker pointing downwards
  // normalize startAngle to [0, 2PI)
  const normStart = ((startAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  // compute angle of pointer relative to wheel rotation
  const rel = ( (pointerAngle - normStart) + Math.PI * 2 ) % (Math.PI * 2);
  let index = Math.floor(rel / arc);
  // ensure index is in valid range [0, agents.length)
  index = ((index % agents.length) + agents.length) % agents.length;

  const winnerAgent = agents[index];
  if (!winnerAgent) return; // safety check for undefined agent
  openWinnerModalForAgent(winnerAgent, { playSound: true, proofPrefix: 'SPIN' });

  // Re-enable the spin button after the spin completes
  if (spinBtn) spinBtn.disabled = false;
}

function closeWinnerModal(options = {}) {
  const { restoreFocus = true } = options;
  if (!winnerModal) return;
  try {
    const active = document.activeElement;
    if (active && winnerModal.contains(active) && typeof active.blur === 'function') {
      active.blur();
    }
  } catch (e) {}
  winnerModal.setAttribute('aria-hidden', 'true');
  winnerModal.setAttribute('inert', '');
  idlePaused = false;
  winnerModalOpen = false;
  // Remove wheel blur once the modal closes
  try {
    const wheelContainer = document.getElementById('wheelContainer');
    if (wheelContainer) wheelContainer.classList.remove('blurred');
  } catch (e) {}
  lastWinnerAgent = null;
  lastSpinProofId = null;
  try { stopDrumroll(); } catch (e) {}
  if (spinBtn) {
    spinBtn.disabled = false;
    if (restoreFocus && typeof spinBtn.focus === 'function') {
      try { spinBtn.focus({preventScroll: true}); }
      catch (e) { try { spinBtn.focus(); } catch (err) {} }
    }
  }
  if (shareWinnerBtn) shareWinnerBtn.disabled = true;
  setShareStatus('');
}

function getWinnerImageUrl(agent) {
  const src = agent?.img || 'assets/images/default-avatar.jpg';
  if (!src) return null;
  try {
    return new URL(src, window.location.href).href;
  } catch (e) {
    return src;
  }
}

function formatWinnerShareMessage(agent) {
  const name = agent?.name || 'Unknown Agent';
  const timestamp = new Date().toLocaleString();
  const imageUrl = getWinnerImageUrl(agent);
  const lines = [
    '**🎯 Valorant Wheel Spin Result**',
    `> Winner: **${name}**`,
    `> Spin Time: ${timestamp}`,
    lastSpinProofId ? `> Proof ID: \`${lastSpinProofId}\`` : null,
  ].filter(Boolean);
  if (imageUrl) {
    lines.push(`> Image: ${imageUrl}`);
  }
  if (window?.location?.href) {
    lines.push('');
    lines.push(`Spin for yourself: ${window.location.href}`);
  }
  if (imageUrl) {
    lines.push('');
    lines.push(`![${name}](${imageUrl})`);
  }
  lines.push('');
  lines.push('_Sent via Valorant Agent Wheelspin_');
  return lines.join('\n');
}

async function copyWinnerShareMessage(agent) {
  const message = formatWinnerShareMessage(agent);
  if (!message) return false;
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(message);
      return true;
    }
  } catch (e) {
    // fall through to fallback
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = message;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch (e) {
    return false;
  }
}

async function loadAgentImageBitmap(agent) {
  const url = getWinnerImageUrl(agent);
  if (!url) return null;
  try {
    const res = await fetch(url, {mode: 'cors'});
    if (res.ok) {
      const blob = await res.blob();
      if (window.createImageBitmap) {
        return await createImageBitmap(blob);
      }
      return await new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(blob);
      });
    }
  } catch (e) {
    // fall through to direct image load
  }
  return await new Promise((resolve, reject) => {
    const img = new Image();
    try {
      if (!url.startsWith('file:')) img.crossOrigin = 'anonymous';
    } catch (e) {}
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

async function generateWinnerShareCanvas(agent, theme = lastWinnerTheme) {
  const appliedTheme = theme || computeWinnerTheme(agent?.color);
  const base = appliedTheme?.base || '#7b8bff';
  const dark = appliedTheme?.dark || '#1c2240';
  const lightColor = appliedTheme?.light || shadeColor(base, 0.35);
  const brightText = '#ffffff';
  const lightText = 'rgba(255, 255, 255, 0.85)';
  const mutedText = 'rgba(255, 255, 255, 0.7)';
  const width = 900;
  const height = 480;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, shadeColor(base, -0.5));
  gradient.addColorStop(1, dark);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  for (let i = 0; i < 4; i++) {
    const w = 80 + Math.random() * 160;
    const h = 8 + Math.random() * 14;
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.fillRect(x, y, w, h);
  }
  ctx.fillStyle = hexToRgba(base, 0.25);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    const size = 120 + Math.random() * 60;
    ctx.arc(650 + Math.random() * 120, 80 + i * 120, size, 0, Math.PI * 2);
    ctx.fill();
  }

  const agentImage = await loadAgentImageBitmap(agent);
  if (agentImage) {
    const imgSize = 320;
    const imgX = 60;
    const imgY = (height - imgSize) / 2;
    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(imgX, imgY, imgSize, imgSize, 32);
    else {
      const r = 32;
      ctx.moveTo(imgX + r, imgY);
      ctx.lineTo(imgX + imgSize - r, imgY);
      ctx.quadraticCurveTo(imgX + imgSize, imgY, imgX + imgSize, imgY + r);
      ctx.lineTo(imgX + imgSize, imgY + imgSize - r);
      ctx.quadraticCurveTo(imgX + imgSize, imgY + imgSize, imgX + imgSize - r, imgY + imgSize);
      ctx.lineTo(imgX + r, imgY + imgSize);
      ctx.quadraticCurveTo(imgX, imgY + imgSize, imgX, imgY + imgSize - r);
      ctx.lineTo(imgX, imgY + r);
      ctx.quadraticCurveTo(imgX, imgY, imgX + r, imgY);
      ctx.closePath();
    }
    ctx.clip();
    ctx.drawImage(agentImage, imgX, imgY, imgSize, imgSize);
    ctx.restore();
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(imgX, imgY, imgSize, imgSize, 32);
    else ctx.strokeRect(imgX, imgY, imgSize, imgSize);
    ctx.stroke();
  }

  const name = agent?.name || 'Unknown Agent';
  const timestamp = new Date().toLocaleString();
  ctx.fillStyle = lightText;
  ctx.font = '18px "Segoe UI", "Montserrat", sans-serif';
  ctx.fillText('Valorant Agent Wheelspin', 420, 65);

  ctx.fillStyle = mutedText;
  ctx.font = '14px "Montserrat", "Segoe UI", sans-serif';
  ctx.fillText('AGENT SELECTED', 420, 100);

  ctx.fillStyle = brightText;
  ctx.shadowColor = appliedTheme?.shadow || 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 12;
  ctx.font = '56px "Montserrat", "Segoe UI", sans-serif';
  ctx.fillText(name, 420, 155);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  ctx.fillStyle = lightText;
  ctx.font = '22px "Segoe UI", sans-serif';
  ctx.fillText(`Spin Time: ${timestamp}`, 420, 210);

  const url = window?.location?.href;
  if (url) {
    ctx.fillStyle = lightText;
    ctx.font = '18px "Segoe UI", sans-serif';
    ctx.fillText(url, 420, 260);
  }

  ctx.fillStyle = mutedText;
  ctx.font = '18px "Segoe UI", sans-serif';
  ctx.fillText('_Generated via Valorant Agent Wheelspin_', 420, 305);

  return canvas;
}

async function copyWinnerShareImage(agent) {
  try {
    const canvas = await generateWinnerShareCanvas(agent);
    if (!canvas) return {success: false, reason: 'canvas'};
    return await new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) return resolve({success: false, reason: 'blob'});
        try {
          if (navigator?.clipboard?.write && window.ClipboardItem) {
            const item = new ClipboardItem({'image/png': blob});
            await navigator.clipboard.write([item]);
            return resolve({success: true, mode: 'image'});
          }
        } catch (e) {
          // continue to fallback
        }
        resolve({success: false, reason: 'unsupported'});
      }, 'image/png');
    });
  } catch (e) {
    return {success: false, reason: 'error'};
  }
}

function setShareStatus(message, type = 'info') {
  if (!shareStatus) return;
  shareStatus.textContent = message || '';
  let color = 'var(--winner-muted)';
  if (type === 'success') color = 'var(--winner-text)';
  else if (type === 'error') color = '#ff9a9a';
  shareStatus.style.color = color;
  if (shareStatusTimer) {
    clearTimeout(shareStatusTimer);
    shareStatusTimer = null;
  }
  if (message) {
    shareStatusTimer = setTimeout(() => {
      shareStatus.textContent = '';
      shareStatusTimer = null;
    }, 4000);
  }
}

