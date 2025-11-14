let wheelEffectiveDpr = 1;

// Offscreen buffer used for the heavy slice + agent rendering so that
// the main canvas only needs to rotate/blit the pre-rendered wheel each frame.
let wheelBufferCanvas = null;
let wheelBufferCtx = null;
let wheelBufferRadius = 0;
let wheelBufferDirty = true;
// Small offscreen buffer used to pre-mask agent icons so their soft edge
// fade does not disturb the underlying slice colors.
let wheelIconCanvas = null;
let wheelIconCtx = null;

function renderWheelToBuffer(radius, isMobile) {
  if (!agents || !agents.length || radius <= 0) {
    return;
  }
  const size = Math.max(2, Math.floor(radius * 2));
  if (!wheelBufferCanvas) {
    wheelBufferCanvas = document.createElement('canvas');
    wheelBufferCtx = wheelBufferCanvas.getContext('2d');
  }
  if (wheelBufferCanvas.width !== size || wheelBufferCanvas.height !== size) {
    wheelBufferCanvas.width = size;
    wheelBufferCanvas.height = size;
  }

  const bctx = wheelBufferCtx;
  const centerX = size / 2;
  const centerY = size / 2;
  const arc = Math.PI * 2 / agents.length;
  const sliceShadowScale = isMobile ? 0.55 : 1;

  bctx.setTransform(1, 0, 0, 1, 0, 0);
  bctx.clearRect(0, 0, size, size);

  agents.forEach((agent, i) => {
    const angle = i * arc;
    const midAngle = angle + arc / 2;
    const baseColor = agent.color || '#666';
    const innerRadius = radius * 0.6;

    bctx.save();
    bctx.beginPath();
    const gradient = bctx.createRadialGradient(
      centerX,
      centerY,
      innerRadius * 0.9,
      centerX,
      centerY,
      radius
    );
    gradient.addColorStop(0, shadeColor(baseColor, 0.18));
    gradient.addColorStop(0.32, shadeColor(baseColor, 0.08));
    gradient.addColorStop(0.6, baseColor);
    gradient.addColorStop(0.82, shadeColor(baseColor, -0.14));
    gradient.addColorStop(1, shadeColor(baseColor, -0.26));
    bctx.fillStyle = gradient;
    bctx.moveTo(centerX, centerY);
    bctx.arc(centerX, centerY, radius, angle, angle + arc, false);
    bctx.closePath();
    bctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    bctx.shadowBlur = sliceShadowScale * Math.max(6, radius * 0.04);
    bctx.shadowOffsetX = sliceShadowScale * Math.cos(midAngle) * 4;
    bctx.shadowOffsetY = sliceShadowScale * Math.sin(midAngle) * 4;
    bctx.fill();

    bctx.lineWidth = Math.max(1.2, radius * 0.005);
    const borderGradient = bctx.createLinearGradient(
      centerX + Math.cos(angle) * radius,
      centerY + Math.sin(angle) * radius,
      centerX + Math.cos(angle + arc) * radius,
      centerY + Math.sin(angle + arc) * radius
    );
    borderGradient.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
    borderGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
    borderGradient.addColorStop(1, 'rgba(0, 0, 0, 0.18)');
    bctx.strokeStyle = borderGradient;
    bctx.stroke();

    // Accent separator along the leading slice edge
    bctx.save();
    bctx.lineCap = 'round';
    const separatorStart = radius * 0.25;
    const sepInnerX = centerX + Math.cos(angle) * separatorStart;
    const sepInnerY = centerY + Math.sin(angle) * separatorStart;
    const sepOuterX = centerX + Math.cos(angle) * radius;
    const sepOuterY = centerY + Math.sin(angle) * radius;
    bctx.lineWidth = Math.max(2.2, radius * 0.0095);
    bctx.strokeStyle = 'rgba(0, 0, 0, 0.32)';
    bctx.beginPath();
    bctx.moveTo(sepInnerX, sepInnerY);
    bctx.lineTo(sepOuterX, sepOuterY);
    bctx.stroke();

    bctx.lineWidth = Math.max(1.2, radius * 0.006);
    const separatorGradient = bctx.createLinearGradient(
      sepInnerX,
      sepInnerY,
      sepOuterX,
      sepOuterY
    );
    separatorGradient.addColorStop(0, 'rgba(255,255,255,0.08)');
    separatorGradient.addColorStop(0.4, 'rgba(255,255,255,0.25)');
    separatorGradient.addColorStop(1, 'rgba(255,255,255,0.1)');
    bctx.strokeStyle = separatorGradient;
    bctx.stroke();
    bctx.restore();

    // Clipped gloss overlay: darken slightly toward the wheel center for depth (skip on mobile for performance)
    if (!isMobile) {
      bctx.save();
      bctx.beginPath();
      bctx.moveTo(centerX, centerY);
      bctx.arc(centerX, centerY, radius, angle, angle + arc, false);
      bctx.closePath();
      bctx.clip();
      const glossGradient = bctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        radius
      );
      glossGradient.addColorStop(0.0, 'rgba(0,0,0,0.16)');
      glossGradient.addColorStop(0.35, 'rgba(0,0,0,0.10)');
      glossGradient.addColorStop(0.65, 'rgba(0,0,0,0.04)');
      glossGradient.addColorStop(1.0, 'rgba(0,0,0,0.0)');
      const prevOp = bctx.globalCompositeOperation;
      bctx.globalCompositeOperation = 'multiply';
      bctx.fillStyle = glossGradient;
      bctx.fillRect(
        centerX - radius,
        centerY - radius,
        radius * 2,
        radius * 2
      );
      bctx.globalCompositeOperation = prevOp;
      bctx.restore();
    }
    bctx.restore();
  });

  wheelBufferRadius = radius;
}

function drawWheel(invalidateBuffer = false) {
  const dpr = wheelEffectiveDpr || 1;
  const cssWidth = canvas.width / dpr;
  const cssHeight = canvas.height / dpr;
  const centerX = cssWidth / 2;
  const centerY = cssHeight / 2;
  const maxRadius = Math.min(cssWidth, cssHeight) / 2;
  const edgeInset = Math.min(Math.max(maxRadius * 0.02, 32), 32);
  const radius = maxRadius - edgeInset;
  const isMobile = (typeof isMobileViewport === 'function' && isMobileViewport());

  if (invalidateBuffer) {
    wheelBufferDirty = true;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  if (!agents || !agents.length || radius <= 0) {
    return;
  }

  if (!wheelBufferCanvas || wheelBufferDirty || wheelBufferRadius !== radius) {
    renderWheelToBuffer(radius, isMobile);
    wheelBufferDirty = false;
  }

  // Draw pre-rendered wheel, rotated by the current startAngle
  if (wheelBufferCanvas) {
    const size = wheelBufferCanvas.width;
    const bufferRadius = size / 2;
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle);
    ctx.drawImage(
      wheelBufferCanvas,
      -bufferRadius,
      -bufferRadius,
      size,
      size
    );
    ctx.restore();
  }

  // Draw agent images in screen space so they always remain upright
  try {
    const arc = Math.PI * 2 / agents.length;
    agents.forEach((agent, i) => {
      if (!agent._image || !agent._image.complete) return;
      try {
        const imgDist = Math.floor(radius * 0.85);
        const baseSize = Math.floor(radius);
        const maxWidth = 3 * imgDist * Math.sin(arc / 2.5);
        const radialAvailable = Math.max(0, 2 * (radius - imgDist));
        let imgSize = Math.max(
          18,
          Math.min(
            baseSize,
            Math.floor(maxWidth * 0.82),
            Math.floor(radialAvailable * 0.9)
          )
        );
        let dist = imgDist;
        if (imgSize < 18) {
          imgSize = Math.max(14, Math.floor(maxWidth * 0.6));
        }
        if (imgSize > radialAvailable) {
          dist = Math.floor(radius - imgSize / 2 - 2);
        }
        const baseAngle = startAngle + i * arc;
        const midAngle = baseAngle + arc / 2;
        const imgX = centerX + Math.cos(midAngle) * dist - imgSize / 2;
        const imgY = centerY + Math.sin(midAngle) * dist - imgSize / 2;
        const r = imgSize / 2;

        // Prepare (or resize) the offscreen icon buffer
        if (!wheelIconCanvas) {
          wheelIconCanvas = document.createElement('canvas');
          wheelIconCtx = wheelIconCanvas.getContext('2d');
        }
        if (wheelIconCanvas.width !== imgSize || wheelIconCanvas.height !== imgSize) {
          wheelIconCanvas.width = imgSize;
          wheelIconCanvas.height = imgSize;
        }

        const ic = wheelIconCtx;
        ic.setTransform(1, 0, 0, 1, 0, 0);
        ic.clearRect(0, 0, imgSize, imgSize);
        // Draw the raw agent image into the buffer
        ic.drawImage(agent._image, 0, 0, imgSize, imgSize);
        // Apply a radial alpha mask so only the outer edge softly fades
        // to transparency, keeping the center fully opaque.
        ic.globalCompositeOperation = 'destination-in';
        const g = ic.createRadialGradient(r, r, 0, r, r, r);
        g.addColorStop(0.0, 'rgba(255,255,255,1)');
        g.addColorStop(0.65, 'rgba(255,255,255,1)');
        g.addColorStop(1.0, 'rgba(255,255,255,0)');
        ic.fillStyle = g;
        ic.fillRect(0, 0, imgSize, imgSize);
        // Reset composite mode for future draws on the icon buffer
        ic.globalCompositeOperation = 'source-over';

        // Now draw the pre-masked icon into the main canvas, clipped to its slice,
        // so the fade only affects the icon and not the underlying slice colors.
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, baseAngle, baseAngle + arc, false);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(wheelIconCanvas, imgX, imgY, imgSize, imgSize);
        ctx.restore();
      } catch (e) {
        // ignore per-image draw errors
      }
    });
  } catch (e) {
    // ignore agent image rendering errors
  }

  // Draw marker triangle at top, overlapping the wheel halfway (non-rotating)
  try {
    const triWidth = Math.max(12, Math.floor(radius * 0.06));
    const triHeight = Math.max(16, Math.floor(triWidth * 1.2));
    const tipX = centerX;
    const tipY = centerY - radius + triHeight / 2;
    const leftX = tipX - triWidth;
    const leftY = tipY - triHeight;
    const rightX = tipX + triWidth;
    const rightY = leftY;

    ctx.save();
    const baseMidX = (leftX + rightX) / 2;
    const baseMidY = leftY;
    const pointerGradient = ctx.createLinearGradient(
      tipX,
      tipY,
      baseMidX,
      baseMidY
    );
    const selectedPtr =
      typeof window !== 'undefined' && window.pointerColor
        ? window.pointerColor
        : '#ffd45c';
    const lightPtr = shadeColor(selectedPtr, 0.35);
    const darkPtr = shadeColor(selectedPtr, -0.45);
    pointerGradient.addColorStop(0, lightPtr);
    pointerGradient.addColorStop(0.45, selectedPtr);
    pointerGradient.addColorStop(1, darkPtr);

    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(leftX, leftY);
    ctx.lineTo(rightX, rightY);
    ctx.closePath();
    ctx.fillStyle = pointerGradient;
    ctx.shadowColor = 'rgba(0,0,0,0.55)';
    const pointerShadowScale = isMobile ? 0.6 : 1;
    ctx.shadowBlur = pointerShadowScale * Math.max(8, radius * 0.05);
    ctx.shadowOffsetY = pointerShadowScale * Math.max(3, radius * 0.015);
    ctx.fill();

    ctx.lineWidth = Math.max(1.5, radius * 0.007);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.stroke();

    ctx.save();
    ctx.clip();
    ctx.beginPath();
    ctx.moveTo(tipX, tipY + Math.max(2, triHeight * 0.12));
    ctx.lineTo(centerX - triWidth * 0.35, leftY + triHeight * 0.2);
    ctx.lineTo(centerX + triWidth * 0.35, rightY + triHeight * 0.2);
    ctx.closePath();
    const highlightGradient = ctx.createLinearGradient(
      tipX,
      tipY,
      baseMidX,
      baseMidY
    );
    highlightGradient.addColorStop(0, 'rgba(255,255,255,0.9)');
    highlightGradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = highlightGradient;
    ctx.globalCompositeOperation = 'lighter';
    ctx.fill();
    ctx.restore();

    ctx.restore();
  } catch (e) {
    // ignore marker render errors
  }

  // Draw center icon (stationary, non-spinning) as a circle
  try {
    if (centerIcon && centerIcon.complete) {
      const desiredSize = Math.floor(radius * 0.5);
      const baseMin = isMobileViewport()
        ? centerIconMinMobilePx
        : centerIconMinDesktopPx;
      const minSize = Math.max(baseMin, Math.floor(radius * 0.25));
      const maxSize = Math.max(minSize + 1, Math.floor(radius * 0.7));
      const iconSize = clamp(desiredSize, minSize, maxSize);
      const iconX = centerX - iconSize / 2;
      const iconY = centerY - iconSize / 2;

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, iconSize / 2, 0, Math.PI * 2);
      const centerShadowScale = isMobile ? 0.6 : 1;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = centerShadowScale * Math.max(10, radius * 0.08);
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = centerShadowScale * Math.max(4, radius * 0.02);
      const iconGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        iconSize * 0.05,
        centerX,
        centerY,
        iconSize * 0.5
      );
      iconGradient.addColorStop(0, '#ffffff');
      iconGradient.addColorStop(1, 'rgba(255,255,255,0.85)');
      ctx.fillStyle = iconGradient;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(centerX, centerY, iconSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(centerIcon, iconX, iconY, iconSize, iconSize);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, iconSize / 2, 0, Math.PI * 2);
      ctx.lineWidth = Math.max(5, radius * 0.03);
      const outerRingGradient = ctx.createLinearGradient(
        iconX,
        iconY,
        iconX + iconSize,
        iconY + iconSize
      );
      outerRingGradient.addColorStop(0, 'rgba(255,255,255,0.9)');
      outerRingGradient.addColorStop(1, 'rgba(200,200,200,0.6)');
      ctx.strokeStyle = outerRingGradient;
      const centerShadowScale2 = isMobile ? 0.6 : 1;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = centerShadowScale2 * Math.max(8, radius * 0.06);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(
        centerX,
        centerY,
        iconSize / 2 - ctx.lineWidth,
        0,
        Math.PI * 2
      );
      ctx.lineWidth = Math.max(2.5, radius * 0.015);
      const ringGradient = ctx.createLinearGradient(
        iconX,
        iconY,
        iconX + iconSize,
        iconY + iconSize
      );
      ringGradient.addColorStop(0, '#0a0a0aff');
      ringGradient.addColorStop(1, '#ffffffff');
      ctx.strokeStyle = ringGradient;
      const centerShadowScale3 = isMobile ? 0.6 : 1;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = centerShadowScale3 * Math.max(6, radius * 0.05);
      ctx.stroke();
      ctx.restore();
    }
  } catch (e) {
    // ignore icon render errors
  }
}

// Resize canvas to match CSS size and device pixel ratio
	function resizeCanvas() {
	  const rect = canvas.getBoundingClientRect();
	  const rawDpr = window.devicePixelRatio || 1;
	  const isMobile = (typeof isMobileViewport === 'function' && isMobileViewport());
	  let maxDpr = 1.5;
	  if (isMobile) {
	    const w = window.innerWidth || rect.width || 0;
	    const h = window.innerHeight || rect.height || 0;
	    const isLandscape = w > h && h > 0;
	    // In mobile landscape, be even more aggressive to keep things smooth
	    maxDpr = isLandscape ? 1.2 : 1.5;
	  }
	  const dpr = Math.max(1, Math.min(rawDpr, maxDpr));
	  wheelEffectiveDpr = dpr;
	  canvas.width = Math.round(rect.width * dpr);
	  canvas.height = Math.round(rect.height * dpr);
	  // Ensure 1:1 mapping of CSS pixels to drawing commands
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  // Canvas size changed — invalidate buffer so it is re-rendered at the new radius.
  drawWheel(true);
}

// Load center icon image
function loadCenterIcon() {
  try {
    centerIcon = new Image();
    // Don't set crossOrigin for file:// URLs; only set for http(s)
    if (!window.location.protocol.startsWith('file')) {
      centerIcon.crossOrigin = 'Anonymous';
    }
    centerIcon.src = 'assets/images/icon.png';
    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      try { markCenterIconReady(); } catch (e) {}
    };
    centerIcon.onload = () => {
      // Center icon asset is ready — redraw, but keep the heavy wheel slices cached.
      drawWheel(false);
      settle();
    };
    centerIcon.onerror = () => {
      console.warn('Failed to load center icon from: assets/images/icon.png');
      settle();
    };
    // Fallback: if neither load nor error fires promptly, unblock UI after a short timeout
    setTimeout(() => { settle(); }, 3000);
  } catch (e) {
    console.warn('Error loading center icon:', e);
    try { markCenterIconReady(); } catch (err) {}
  }
}

// Debounced resize
let _resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(resizeCanvas, 80);
});

// Wheel spinning logic
// Wheel spinning logic (new): idle slow spin + user-triggered spin with smooth deceleration
function spinWheel() {
  if (spinning || agents.length === 0 || winnerModalOpen) return;
  // ensure any previous drumroll loop is cleared before a new spin
  try { stopDrumroll(); } catch (e) {}
  spinning = true;
  spinTriggered = true;
  try {
    if (document && document.body && document.body.classList) {
      document.body.classList.add('wheel-spinning');
    }
  } catch (e) {}

	  // Spin duration base (global) will scale ramp and deceleration.
	  // Add extra jitter so each spin length feels more unique.
	  const baseJitter = 0.9 + Math.random() * 0.2;        // 0.9–1.1 (original range)
	  const extraJitter = 0.85 + Math.random() * 0.3;      // 0.85–1.15
	  const durationFactor = baseJitter * extraJitter;     // ≈0.76–1.27 overall
	  const durationMs = Math.max(300, Math.round(spinDurationMs * durationFactor));
	  const durationSec = durationMs / 1000;

	  // Scale peak velocity with overall duration so longer spins are faster,
	  // and add per-spin randomness to how "aggressive" the spin feels.
	  const speedScaleBase = Math.max(0.5, durationMs / 5200);
	  const speedJitter = 0.85 + Math.random() * 0.4;      // 0.85–1.25
	  const speedScale = speedScaleBase * speedJitter;
	  const minVel = 5.5 * speedScale; // rad/s
	  const maxVel = 13.0 * speedScale; // rad/s
	  const initialVel = minVel + Math.random() * Math.max(0.5, (maxVel - minVel));

  // Setup ramp: ramp length scales with duration (percentage)
  spinRampTotalMs = Math.max(120, Math.round(durationMs * 0.06));
  spinRampRemaining = spinRampTotalMs;
  spinTargetVelocity = initialVel;
  spinInDecel = false;
  spinDirection = Math.sign(spinTargetVelocity) || 1;

  // compute deceleration to reach 0 after ramp completes
  const decelDurationSec = Math.max(0.4, durationSec - (spinRampTotalMs / 1000));
  spinDecelDurationMs = Math.max(300, Math.round(decelDurationSec * 1000));
  spinDecelElapsedMs = 0;
  spinDecelInitialVelocity = spinTargetVelocity;
  spinPendingDecel = spinTargetVelocity / decelDurationSec;
  // do not set angularVelocity immediately; animationLoop will ramp it

  // disable spin button while spin is in progress
  if (spinBtn) spinBtn.disabled = true;
  // Ensure the animation loop is running in case it was stopped when idle.
  try {
    if (typeof requestAnimationFrame === 'function' && !animationLoopRunning) {
      requestAnimationFrame(animationLoop);
    }
  } catch (e) {}
}

// Main animation loop to handle idle rotation + active spin
function animationLoop(ts) {
  // Mark the loop as active whenever a frame is processed.
  animationLoopRunning = true;
  if (!lastFrameTs) lastFrameTs = ts;
  const isHidden = (typeof document !== 'undefined' && document.hidden) ? true : false;
  const rawDt = ts - lastFrameTs;
  // Allow larger catch-up when the tab is hidden so spins complete on time
  const dt = isHidden ? Math.min(800, rawDt) : Math.min(50, rawDt);
  lastFrameTs = ts;
  const dtSec = dt / 1000;

  if (spinTriggered) {
    // active user-triggered spin: handle ramp up then deceleration
    if (spinRampRemaining > 0) {
      // ramping up
      const rampStep = Math.min(dt, spinRampRemaining);
      // linear ramp: increase angularVelocity toward spinTargetVelocity
      const prev = spinRampRemaining;
      spinRampRemaining -= rampStep;
        const t = 1 - (spinRampRemaining / spinRampTotalMs); // 0..1 progress
        // use ease-in cubic for a natural acceleration (slow start, faster finish)
        const eased = easeInCubic(Math.max(0, Math.min(1, t)));
        angularVelocity = spinTargetVelocity * eased;
      startAngle += angularVelocity * dtSec;
      // when ramp finishes, start decel
      if (spinRampRemaining <= 0) {
        spinInDecel = true;
        angularDecel = spinPendingDecel; // apply deceleration
      }
    } else if (spinInDecel) {
      // decelerating phase (non-linear easing using easeOutQuad)
      spinDecelElapsedMs += dt;
      // start drumroll shortly before selection
      try {
        const remainingMs = Math.max(0, spinDecelDurationMs - spinDecelElapsedMs);
        if (drumEnabled && !drumScheduled && remainingMs <= drumLeadMs) {
          // kick off drumroll loop
          startDrumroll();
        }
      } catch (e) {}
      const p = Math.min(1, spinDecelElapsedMs / spinDecelDurationMs);
      // eased progress 0..1
      const eased = easeOutQuad(Math.max(0, p), 0, 1, 1);
      // angular velocity scales from initial -> 0 following eased curve
      angularVelocity = spinDecelInitialVelocity * (1 - eased);
      startAngle += angularVelocity * dtSec;
      if (p >= 1 || angularVelocity <= 0.00001) {
        // spin finished
        spinTriggered = false;
        spinInDecel = false;
        spinning = false;
        try {
          if (document && document.body && document.body.classList) {
            document.body.classList.remove('wheel-spinning');
          }
        } catch (e) {}
        angularVelocity = 0;
        angularDecel = 0;
        // determine winner and show modal immediately (no overshoot/settle snap)
        showWinnerModal();
      }
    } else {
      // fallback: if not ramping or decelling, just advance
      startAngle += angularVelocity * dtSec;
    }
  } else {
    // idle slow rotation when not spinning (unless paused by modal)
    if (!idlePaused) {
      // gently approach idleAngularVelocity for smoothness
      const blend = 0.06; // how quickly to approach idle speed
      if (!spinning) {
        // use a small blended velocity so stops/starts feel smooth
        // use a small blended velocity so stops/starts feel smooth
        angularVelocity += (idleAngularVelocity - angularVelocity) * blend;
        startAngle += angularVelocity * dtSec;
      }
    }
  }
  // detect pointer crossing slice edges and play tick sound(s)
  try {
    // Only detect slice-edge crossings during an active user-triggered spin (not idle)
    if ((spinTriggered || spinInDecel) && agents && agents.length > 0) {
      const arc = Math.PI * 2 / agents.length;
      const pointerAngle = -Math.PI / 2;
      const normStart = ((startAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      const rel = ((pointerAngle - normStart) + Math.PI * 2) % (Math.PI * 2);
      const idx = Math.floor(rel / arc);
      if (prevIndex != null && !winnerModalOpen) {
        // number of forward slice steps crossed (wrap-aware)
        const crossed = (prevIndex - idx + agents.length) % agents.length;
        // Suppress ticks when rotation speed is extremely low to avoid stray ticks near stop
        const allowTicking = (typeof angularVelocity === 'number') ? (Math.abs(angularVelocity) > 0.15) : true;
        if (crossed > 0 && allowTicking) {
          // estimate crossing times within this frame for each boundary crossed
          const d = (prevRel - rel + Math.PI * 2) % (Math.PI * 2);
          for (let i = 1; i <= crossed; i++) {
            // tCrossSec is time since previous frame when the i-th boundary was crossed
            const tCrossSec = (i * arc) / (d || arc) * (dtSec);
            // crossing happened tCrossSec after previous frame, which is (dtSec - tCrossSec) seconds ago relative to now
            const relativeToNowSec = tCrossSec - dtSec;
            // Only play ticks that occurred within this frame (or with a tiny lead)
            // Never schedule ticks in the future to avoid post-stop stray ticks
            let desiredStartSec = relativeToNowSec + (tickOffsetMs / 1000);
            if (desiredStartSec > 0) desiredStartSec = 0; // clamp to now
            // schedule a single tick for this crossing
            playTick(1, desiredStartSec);
          }
        }
      }
      prevIndex = idx;
      prevRel = rel; // keep for backward compatibility
    }
  } catch (e) {
    // ignore tick detection errors
  }

  // Draw using the cached static wheel image; do not invalidate buffer during animation.
  drawWheel(false);
  // Decide whether we actually need another frame.
  // Continue while a spin is active, or while idle rotation is enabled.
  const needsAnimation =
    (spinTriggered || spinInDecel) ||
    (!idlePaused && Math.abs(idleAngularVelocity || 0) > 0.0001);

  // When visible, drive via rAF; when hidden, a background timer will call animationLoop.
  if ((typeof document === 'undefined' || !document.hidden) && needsAnimation) {
    requestAnimationFrame(animationLoop);
  } else if (!needsAnimation) {
    // No more work to do — mark the loop as inactive so it can be restarted on demand.
    animationLoopRunning = false;
  }
}

// Utility: clamp
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

function easeOutQuad(t, b, c, d) {
  t /= d;
  return -c * t * (t - 2) + b;
}

function easeInCubic(t) {
  return t * t * t;
}

// Keep animation progressing when tab is hidden by driving updates with a timer
let _hiddenDriver = null;
function startHiddenDriver() {
  if (_hiddenDriver) return;
  try {
    _hiddenDriver = setInterval(() => {
      // Only advance animations in the background while an actual spin is in progress.
      if (!spinTriggered && !spinInDecel) return;
      animationLoop(performance.now());
    }, 160);
  } catch (e) {
    _hiddenDriver = null;
  }
}
function stopHiddenDriver() {
  if (_hiddenDriver) { try { clearInterval(_hiddenDriver); } catch (e) {} _hiddenDriver = null; }
}
try {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) startHiddenDriver();
    else {
      stopHiddenDriver();
      try {
        if (typeof requestAnimationFrame === 'function') {
          requestAnimationFrame(animationLoop);
        }
      } catch (e) {}
    }
  });
} catch (e) {}
