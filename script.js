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
const randomizeWinSoundsToggle = document.getElementById('randomizeWinSoundsToggle');

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
let randomizeWinSounds = JSON.parse(localStorage.getItem('randomizeWinSounds')) ?? false;

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

    ctx.save();
    ctx.translate(250, 250);
    ctx.rotate(angle + arc / 2);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px Poppins";
    ctx.textAlign = "right";
    ctx.fillText(agent.name, 230, 10);

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
  const
