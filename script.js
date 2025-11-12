const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinButton');
const spinSound = document.getElementById('spinSound');

let agents = [
  { name: 'Jett', color: '#00bfff', img: 'assets/images/jett.png' },
  { name: 'Phoenix', color: '#ff4500', img: 'assets/images/phoenix.png' },
  { name: 'Sage', color: '#00ff99', img: 'assets/images/sage.png' },
  // add as needed
];

let startAngle = 0;
let arc = Math.PI * 2 / agents.length;
let spinAngle = 0;
let spinTime = 0;
let spinTimeTotal = 0;
let spinning = false;

function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  agents.forEach((agent, i) => {
    const angle = startAngle + i * arc;
    ctx.fillStyle = agent.color;
    ctx.beginPath();
    ctx.moveTo(250, 250);
    ctx.arc(250, 250, 250, angle, angle + arc, false);
    ctx.lineTo(250, 250);
    ctx.fill();

    // Text or image
    const img = new Image();
    img.src = agent.img;
    const textAngle = angle + arc / 2;
    ctx.save();
    ctx.translate(250, 250);
    ctx.rotate(textAngle);
    ctx.drawImage(img, 150, -25, 50, 50);
    ctx.restore();
  });
}

function rotateWheel() {
  spinAngle += Math.PI / 30;
  startAngle += spinAngle * 0.01;
  drawWheel();
  if (spinTime < spinTimeTotal) {
    requestAnimationFrame(rotateWheel);
    spinTime += 30;
  } else {
    spinning = false;
    const winnerIndex = Math.floor(agents.length - (startAngle % (2 * Math.PI)) / arc) % agents.length;
    alert(`Winner: ${agents[winnerIndex].name}`);
  }
}

spinBtn.addEventListener('click', () => {
  if (spinning) return;
  spinning = true;
  spinSound.play();
  spinAngle = Math.random() * 10 + 10;
  spinTime = 0;
  spinTimeTotal = 3000 + Math.random() * 2000;
  rotateWheel();
});

drawWheel();
