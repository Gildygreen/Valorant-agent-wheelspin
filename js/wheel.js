function drawWheel() {
  // Use CSS pixel dimensions (account for devicePixelRatio via setTransform)
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.width / dpr;
  const cssHeight = canvas.height / dpr;
  const centerX = cssWidth / 2;
  const centerY = cssHeight / 2;
  const radius = Math.min(cssWidth, cssHeight) / 2; // margin
  const arc = Math.PI * 2 / agents.length;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  agents.forEach((agent, i) => {
    const angle = startAngle + i * arc;
    const midAngle = angle + arc / 2;
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = agent.color || '#666';
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, angle, angle + arc, false);
    ctx.closePath();
    // add subtle drop shadow per slice for depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = Math.max(4, radius * 0.03);
    ctx.shadowOffsetX = Math.cos(midAngle) * 2;
    ctx.shadowOffsetY = Math.sin(midAngle) * 2;
    ctx.fill();
    // outline slice to separate colors visually
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = Math.max(1, radius * 0.01);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.stroke();
    ctx.restore();

    // Draw agent image if available — larger and spaced further out
    if (agent._image && agent._image.complete) {
      try {
        // place images at outer edge but ensure they fit the slice width
        const imgDist = Math.floor(radius * 0.85);
        const baseSize = Math.floor(radius);
        // chord length at imgDist gives max available width inside slice
        const maxWidth = 2 * imgDist * Math.sin(arc / 1.5);
        // also ensure image stays inside radial bounds
        const radialAvailable = Math.max(0, 2 * (radius - imgDist));
        let imgSize = Math.max(18, Math.min(baseSize, Math.floor(maxWidth * 0.82), Math.floor(radialAvailable * 0.9)));
        // if there's not enough radial space, move image slightly inward
        let dist = imgDist;
        if (imgSize < 18) {
          imgSize = Math.max(14, Math.floor(maxWidth * 0.6));
        }
        if (imgSize > radialAvailable) {
          dist = Math.floor(radius - imgSize / 2 - 2);
        }
        const midAngle = angle + arc / 2;
        const imgX = centerX + Math.cos(midAngle) * dist - imgSize / 2;
        const imgY = centerY + Math.sin(midAngle) * dist - imgSize / 2;
        ctx.save();
        // clip to slice to avoid overlap
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, angle, angle + arc, false);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(agent._image, imgX, imgY, imgSize, imgSize);
        ctx.restore();
      } catch (e) {
        // ignore draw errors
      }
    }
    // no agent name rendering (per request)
  });

  // Draw marker triangle at top, overlapping the wheel halfway
  try {
    const triWidth = Math.max(12, Math.floor(radius * 0.06)); // half-base
    const triHeight = Math.max(16, Math.floor(triWidth * 1.2));
    const tipX = centerX;
    const tipY = centerY - radius + (triHeight / 2); // tip placed half inside the wheel
    const leftX = tipX - triWidth;
    const leftY = tipY - triHeight;
    const rightX = tipX + triWidth;
    const rightY = leftY;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(leftX, leftY);
    ctx.lineTo(rightX, rightY);
    ctx.closePath();
    ctx.fillStyle = '#ffcc00';
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.restore();
  } catch (e) {
    // ignore marker render errors
  }

  // Draw center icon (stationary, non-spinning) as a circle
  try {
    if (centerIcon && centerIcon.complete) {
      const desiredSize = Math.floor(radius * 0.5);
      const baseMin = isMobileViewport() ? centerIconMinMobilePx : centerIconMinDesktopPx;
      const minSize = Math.max(baseMin, Math.floor(radius * 0.25));
      const maxSize = Math.max(minSize + 1, Math.floor(radius * 0.7));
      const iconSize = clamp(desiredSize, minSize, maxSize);
      const iconX = centerX - iconSize / 2;
      const iconY = centerY - iconSize / 2;
      
      ctx.save();
      // Draw subtle halo for depth before clipping
      ctx.beginPath();
      ctx.arc(centerX, centerY, iconSize / 2, 0, Math.PI * 2);
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = Math.max(10, radius * 0.08);
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = Math.max(4, radius * 0.02);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      // Clip to circle and draw icon
      ctx.beginPath();
      ctx.arc(centerX, centerY, iconSize / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(centerIcon, iconX, iconY, iconSize, iconSize);
      ctx.restore();

      // Border ring to make the icon pop
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, iconSize / 2, 0, Math.PI * 2);
      ctx.lineWidth = Math.max(4, radius * 0.025);
      ctx.strokeStyle = centerIconBorderColor;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = Math.max(6, radius * 0.05);
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
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  // Ensure 1:1 mapping of CSS pixels to drawing commands
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawWheel();
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
    centerIcon.onload = () => {
      drawWheel();
      try { markCenterIconReady(); } catch (e) {}
    };
    centerIcon.onerror = () => {
      console.warn('Failed to load center icon from: assets/images/icon.png');
      try { markCenterIconReady(); } catch (e) {}
    };
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

  // Spin duration base (global) will scale ramp and deceleration
  // durationMs is slightly randomized around the global spinDurationMs to provide natural variance
  const durationMs = Math.max(300, Math.round(spinDurationMs * (0.9 + Math.random() * 0.2)));
  const durationSec = durationMs / 1000;

  // Scale peak velocity with overall duration so longer spins are faster
  const speedScale = Math.max(0.5, durationMs / 5200);
  const minVel = 6.0 * speedScale; // rad/s
  const maxVel = 12.0 * speedScale; // rad/s
  const initialVel = minVel + Math.random() * (maxVel - minVel);

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
}

// Main animation loop to handle idle rotation + active spin
function animationLoop(ts) {
  if (!lastFrameTs) lastFrameTs = ts;
  const dt = Math.min(50, ts - lastFrameTs); // clamp to avoid huge jumps
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
        if (crossed > 0) {
          // estimate crossing times within this frame for each boundary crossed
          const d = (prevRel - rel + Math.PI * 2) % (Math.PI * 2);
          for (let i = 1; i <= crossed; i++) {
            // tCrossSec is time since previous frame when the i-th boundary was crossed
            const tCrossSec = (i * arc) / (d || arc) * (dtSec);
            // crossing happened tCrossSec after previous frame, which is (dtSec - tCrossSec) seconds ago relative to now
            const relativeToNowSec = tCrossSec - dtSec;
            const desiredStartSec = relativeToNowSec + (tickOffsetMs / 1000);
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

  drawWheel();
  requestAnimationFrame(animationLoop);
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
