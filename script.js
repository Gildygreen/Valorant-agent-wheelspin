const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinButton');
const spinSound = document.getElementById('spinSound');
const defaultWinSound = document.getElementById('defaultWinSound');
const winnerBanner = document.getElementById('winnerBanner');
const winnerName = document.getElementById('winnerName');
const winnerImage = document.getElementById('winnerImage');
const agentListDiv = document.getElementById('agentList');
const toggleAgentSounds = document.getElementById('toggleAgentSounds');
const globalSoundSection = document.getElementById('globalSoundSection');
const globalSelect = document.getElementById('globalWinSoundSelect');
const previewGlobalWinSound = document.getElementById('previewGlobalWinSound');

// List of available sounds in your `assets/sounds/` folder (this should be updated as per your files)
const availableSounds = [
  'assets/sounds/jett.mp3',
  'assets/sounds/phoenix.mp3',
  'assets/sounds/sage.mp3',
  'assets/sounds/win.mp3'
];

let agents = JSON.parse(localStorage.getItem('agents')) || [
  { name: 'Jett', color: '#00bfff', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/jett.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/jett2.mp3', isDefault: false }
    ]
  },
  { name: 'Phoenix', color: '#ff4500', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/phoenix.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/phoenix2.mp3', isDefault: false }
    ]
  }
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
    if (useAgentSounds && agent.winSounds.length > 0) {
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
  const soundToPlay = useAgentSounds && agent.winSounds.length > 0 ? 
    agent.winSounds.find(sound => sound.isDefault).path : globalWinSoundPath;

  new Audio(soundToPlay).play();
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
      <div class="sound-list">
        ${agent.winSounds.map((sound, idx) => `
          <div class="sound-option">
            <span>${sound.label}</span>
            <button class="preview-sound" data-agent="${i}" data-index="${idx}">🔊 Preview</button>
            <button class="select-sound" data-agent="${i}" data-index="${idx}">${sound.isDefault ? '✔️ Default' : 'Select'}</button>
          </div>
        `).join('')}
        <button class="add-sound" data-agent="${i}">+ Add Sound</button>
      </div>
      <button data-index="${i}" class="remove-agent">🗑️ Remove</button>
    `;
    agentListDiv.appendChild(row);
  });

  document.querySelectorAll('.preview-sound').forEach(btn =>
    btn.addEventListener('click', e => {
      const agentIndex = e.target.dataset.agent;
      const soundIndex = e.target.dataset.index;
      new Audio(agents[agentIndex].winSounds[soundIndex].path).play();
    })
  );

  document.querySelectorAll('.select-sound').forEach(btn =>
    btn.addEventListener('click', e => {
      const agentIndex = e.target.dataset.agent;
      const soundIndex = e.target.dataset.index;
      agents[agentIndex].winSounds.forEach((sound, idx) => {
        sound.isDefault = idx === soundIndex;  // Set only the clicked sound as default
      });
      updateAgentList();  // Re-render to reflect changes
    })
  );

  document.querySelectorAll('.add-sound').forEach(btn =>
    btn.addEventListener('click', e => {
      const agentIndex = e.target.dataset.agent;
      const newSound = { 
        label: `Option ${agents[agentIndex].winSounds.length + 1}`,
        path: '', 
        isDefault: false 
      };
      agents[agentIndex].winSounds.push(newSound);
      updateAgentList();
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
  agents.push({ name: 'New Agent', color: '#ffffff', img: '', winSounds: [{ label: 'Option 1', path: '', isDefault: true }] });
  updateAgentList();
  drawWheel();
});

// Save / load configuration
document.getElementById('saveConfig').addEventListener('click', () => {
  localStorage.setItem('agents', JSON.stringify(agents));
  localStorage.setItem('useAgentSounds', JSON.stringify(useAgentSounds));
  localStorage.setItem('globalWinSoundPath', globalWinSoundPath);
  alert('Configuration Saved!');
});

document.getElementBy
