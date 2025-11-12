const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinButton');
const spinSound = document.getElementById('spinSound');
const winnerBanner = document.getElementById('winnerBanner');
const winnerName = document.getElementById('winnerName');
const winnerImage = document.getElementById('winnerImage');
const agentListDiv = document.getElementById('agentList');
const randomizeWinSoundsToggle = document.getElementById('randomizeWinSoundsToggle');

// List of agents (full list as of 2023)
let agents = [
  { name: 'Jett', color: '#00bfff', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/jett.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/jett2.mp3', isDefault: false }
    ]
  },
  { name: 'Phoenix', color: '#ff4500', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/phoenix.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/phoenix2.mp3', isDefault: false }
    ]
  },
  { name: 'Sage', color: '#32cd32', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/sage.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/sage2.mp3', isDefault: false }
    ]
  },
  { name: 'Omen', color: '#660066', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/omen.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/omen2.mp3', isDefault: false }
    ]
  },
  { name: 'Breach', color: '#ff0000', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/breach.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/breach2.mp3', isDefault: false }
    ]
  },
  { name: 'Raze', color: '#ff6f00', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/raze.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/raze2.mp3', isDefault: false }
    ]
  },
  { name: 'Killjoy', color: '#ffaa00', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/killjoy.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/killjoy2.mp3', isDefault: false }
    ]
  },
  { name: 'Astra', color: '#9b4d96', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/astra.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/astra2.mp3', isDefault: false }
    ]
  },
  { name: 'Yoru', color: '#b7b7b7', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/yoru.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/yoru2.mp3', isDefault: false }
    ]
  },
  { name: 'Viper', color: '#00ff00', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/viper.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/viper2.mp3', isDefault: false }
    ]
  },
  { name: 'Skye', color: '#9fa3a9', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/skye.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/skye2.mp3', isDefault: false }
    ]
  },
  { name: 'Sova', color: '#00eaff', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/sova.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/sova2.mp3', isDefault: false }
    ]
  },
  { name: 'Reyna', color: '#8b008b', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/reyna.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/reyna2.mp3', isDefault: false }
    ]
  },
  { name: 'KAY/O', color: '#6e6e6e', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/kayo.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/kayo2.mp3', isDefault: false }
    ]
  },
  { name: 'Chamber', color: '#c0c0c0', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/chamber.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/chamber2.mp3', isDefault: false }
    ]
  },
  { name: 'Fade', color: '#3e0e6d', img: '', winSounds: [
      { label: 'Option 1', path: 'assets/sounds/fade.mp3', isDefault: true },
      { label: 'Option 2', path: 'assets/sounds/fade2.mp3', isDefault: false }
    ]
  }
];

// Store user preferences
let useAgentSounds = JSON.parse(localStorage.getItem('useAgentSounds')) ?? true;
let globalWinSoundPath = localStorage.getItem('globalWinSoundPath') || 'assets/sounds/win.mp3';
let randomizeWinSounds = JSON.parse(localStorage.getItem('randomizeWinSounds')) ?? false;

let startAngle = 0;
let spinning = false;

// Draw the wheel with agent names and colors
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

    ctx.save();
    ctx.translate(250, 250);
    ctx.rotate(angle + arc / 2);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px Poppins";
    ctx.textAlign = "right";
    ctx.fillText(agent.name, 230, 10);
    ctx.restore();
  });
}

// Wheel spinning logic
function spinWheel() {
  if (spinning || agents.length === 0) return;
  spinning = true;

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
  const spinAngle = startAngle % (Math.PI * 2);
  const index = Math.floor((spinAngle + Math.PI / agents.length) / (Math.PI * 2 / agents.length));
  
  const winnerAgent = agents[index];
  winnerName.textContent = winnerAgent.name;
  winnerImage.src = winnerAgent.img || 'assets/images/default-avatar.jpg';
  winnerBanner.style.display = 'block';
  
  const winSoundPath = randomizeWinSounds 
    ? winnerAgent.winSounds[Math.floor(Math.random() * winnerAgent.winSounds.length)].path
