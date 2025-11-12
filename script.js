const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinButton');
const agentListDiv = document.getElementById('agentList');
const spinSound = document.getElementById('spinSound');
const defaultWinSound = document.getElementById('defaultWinSound');
const winnerBanner = document.getElementById('winnerBanner');
const winnerName = document.getElementById('winnerName');
const winnerImage = document.getElementById('winnerImage');
const toggleAgentSounds = document.getElementById('toggleAgentSounds');
const globalSoundSection = document.getElementById('globalSoundSection');
const globalWinSoundUpload = document.getElementById('globalWinSoundUpload');
const previewGlobalWinSound = document.getElementById('previewGlobalWinSound');

let agents = JSON.parse(localStorage.getItem('agents')) || [
  { name: 'Jett', color: '#00bfff', img: '', winSound: '' },
  { name: 'Phoenix', color: '#ff4500', img: '', winSound: '' },
  { name: 'Sage', color: '#00ff99', img: '', winSound: '' },
];

let useAgentSounds = JSON.parse(localStorage.getItem('useAgentSounds')) ?? true;
let globalWinSoundPath = localStorage.getItem('globalWinSoundPath') || 'assets/sounds/win.mp3';

let startAngle = 0;
let spinning = false;

// Draw the wheel with icons and names
function drawWheel() {
  const arc = Math.PI * 2 / agents.length;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  agents.forEach((agent, i) => {
    const angle = startAngle + i * arc;
    ctx.beginPath();
    ctx.fillStyle = agent.color;
    ctx.moveTo(250, 250);
    ctx.arc(250, 250, 250, angle, angle + arc, false);
    ctx.lineTo(250, 250);
    ctx.fill();

    // Agent image
    if (agent.img) {
      const img = new Image();
      img.src = agent.img;
      img.onload = () => {
        ctx.save();
        ctx.translate(250, 250);
        ctx.rotate(angle + arc / 2);
        ctx.drawImage(img, 150, -30, 60, 60);
        ctx.restore();
      };
    }

    // Agent name + sound icon
    ctx.save();
    ctx.translate(250, 250);
    ctx.rotate(angle + arc / 2);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px Poppins";
    ctx.textAlign = "right";
    ctx.fillText(agent.name, 230, 10);

    // Draw speaker icon if per-agent sounds are enabled
    if (useAgentSounds && agent.winSound) {
      ctx.font = "bold 14px Poppins";
      ctx.fillText("🔊", 215, -5);
    }

    ctx.restore();
  });
}

// Wheel spinning logic
function spinWheel() {
  if (spinning || agents.length === 0) return;
  spinning = true;
  spinSound.currentTime = 0;
  spinSound.play();

  let spinAngle = Math.random() * 10 + 10;
  let spinTime = 0;
  const spinTimeTotal = 4000 + Math.random() * 2000;

  function rotate() {
    spinTime += 20;
    if (spinTime >= spinTimeTotal) {
      spinning = false;
      stopRotateWheel();
      return;
    }
    const easeOut = easeOutQuad(spinTime, 0, spinAngle, spinTimeTotal);
    startAngle += easeOut * 0.05;
    drawWheel();
    requestAnimationFrame(rotate);
  }

  rotate();
}

// Stop and select winner
function stopRotateWheel() {
  const arc = Math.PI * 2 / agents.length;
  const degrees = startAngle * 180 / Math.PI + 90;
  const index = Math.floor((360 - (degrees % 360)) / (360 / agents.length)) % agents.length;
  const winner = agents[index];

  playWinSound(winner);
  confettiBurst();
  showWinnerBanner(winner);
}

// Play win sound
function playWinSound(agent) {
  if (useAgentSounds && agent.winSound) {
    new Audio(agent.winSound).play();
  } else {
    new Audio(globalWinSoundPath).play();
  }
}

// Animation easing
function easeOutQuad(t, b, c, d) {
  t /= d;
  return -c * t * (t - 2) + b;
}

// Winner overlay
function showWinnerBanner(agent) {
  winnerName.textContent = agent.name;
  winnerImage.src = agent.img || 'https://upload.wikimedia.org/wikipedia/en/5/53/Valorant_icon.png';
  winnerBanner.classList.add('show');
  setTimeout(() => winnerBanner.classList.remove('show'), 5000);
}

// Agent list UI
function updateAgentList() {
  agentListDiv.innerHTML = '';
  agents.forEach((agent, i) => {
    const row = document.createElement('div');
    row.className = 'agent-row';
    row.innerHTML = `
      <input type="text" value="${agent.name}" data-index="${i}" class="agent-name">
      <input type="color" value="${agent.color}" data-index="${i}" class="agent-color">
      <input type="file" accept="image/*" data-index="${i}" class="agent-img">
      <input type="file" accept="audio/*" data-index="${i}" class="agent-sound">
      <button data-index="${i}" class="preview-sound">🔊</button>
      <button data-index="${i}" class="remove-agent">🗑️</button>
    `;
    agentListDiv.appendChild(row);
  });

  document.querySelectorAll('.agent-name').forEach(input =>
    input.addEventListener('input', e => agents[e.target.dataset.index].name = e.target.value)
  );
  document.querySelectorAll('.agent-color').forEach(input =>
    input.addEventListener('input', e => agents[e.target.dataset.index].color = e.target.value)
  );
  document.querySelectorAll('.agent-img').forEach(input =>
    input.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => agents[e.target.dataset.index].img = reader.result;
        reader.readAsDataURL(file);
        drawWheel();
      }
    })
  );
  document.querySelectorAll('.agent-sound').forEach(input =>
    input.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        agents[e.target.dataset.index].winSound = url;
        drawWheel();
      }
    })
  );
  document.querySelectorAll('.preview-sound').forEach(btn =>
    btn.addEventListener('click', e => {
      const agent = agents[e.target.dataset.index];
      if (agent.winSound) new Audio(agent.winSound).play();
      else alert(`No sound uploaded for ${agent.name}`);
    })
  );
  document.querySelectorAll('.remove-agent').forEach(btn =>
    btn.addEventListener('click', e => {
      agents.splice(e.target.dataset.index, 1);
      updateAgentList();
      drawWheel();
    })
  );
}

// Add agent
document.getElementById('addAgent').addEventListener('click', () => {
  agents.push({ name: 'New Agent', color: '#ffffff', img: '', winSound: '' });
  updateAgentList();
  drawWheel();
});

// Save / load configuration
document.getElementById('saveConfig').addEventListener('click', () => {
  localStorage.setItem('agents', JSON.stringify(agents));
  localStorage.setItem('useAgentSounds', JSON.stringify(useAgentSounds));
  localStorage.setItem('globalWinSoundPath', globalWinSoundPath);
  alert('Saved!');
});

document.getElementById('loadConfig').addEventListener('click', () => {
  const savedAgents = localStorage.getItem('agents');
  const savedUseAgentSounds = localStorage.getItem('useAgentSounds');
  const savedGlobalPath = localStorage.getItem('globalWinSoundPath');

  if (savedAgents) agents = JSON.parse(savedAgents);
  if (savedUseAgentSounds) useAgentSounds = JSON.parse(savedUseAgentSounds);
  if (savedGlobalPath) globalWinSoundPath = savedGlobalPath;

  toggleAgentSounds.checked = useAgentSounds;
  globalSoundSection.style.opacity = useAgentSounds ? '0.4' : '1';
  updateAgentList();
  drawWheel();
});

// Per-agent toggle
toggleAgentSounds.addEventListener('change', () => {
  useAgentSounds = toggleAgentSounds.checked;
  globalSoundSection.style.opacity = useAgentSounds ? '0.4' : '1';
  drawWheel();
});

// Global win sound upload
globalWinSoundUpload.addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) {
    globalWinSoundPath = URL.createObjectURL(file);
  }
});

// Preview global sound
previewGlobalWinSound.addEventListener('click', () => {
  new Audio(globalWinSoundPath).play();
});

// Spin sound upload
document.getElementById('spinSoundUpload').addEventListener('change', e => {
  const file = e.target.files[0];
  if (file) spinSound.src = URL.createObjectURL(file);
});

// Confetti celebration
const confettiCanvas = document.getElementById('confetti');
const confettiCtx = confettiCanvas.getContext('2d');
confettiCanvas.width = window.innerWidth;
confettiCanvas.height = window.innerHeight;

function confettiBurst() {
  const particles = Array.from({ length: 100 }, () => ({
    x: Math.random() * confettiCanvas.width,
    y: 0,
    r: Math.random() * 6 + 4,
    c: `hsl(${Math.random() * 360}, 100%, 60%)`,
    v: Math.random() * 5 + 2
  }));

  function draw() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    particles.forEach(p => {
      p.y += p.v;
      confettiCtx.beginPath();
      confettiCtx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
      confettiCtx.fillStyle = p.c;
      confettiCtx.fill();
    });
    if (particles[0].y < confettiCanvas.height) requestAnimationFrame(draw);
  }
  draw();
}

// Hotkey support
document.addEventListener('keydown', e => {
  if (e.code === 'Space') spinWheel();
});

spinBtn.addEventListener('click', spinWheel);

// Init
toggleAgentSounds.checked = useAgentSounds;
globalSoundSection.style.opacity = useAgentSounds ? '0.4' : '1';
updateAgentList();
drawWheel();
