const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game Settings
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 100;
const BALL_RADIUS = 10;
const PLAYER_X = 24;
const AI_X = canvas.width - PLAYER_X - PADDLE_WIDTH;
const PADDLE_SPEED = 6; // For AI
const BALL_SPEED = 6;

// Game State
let playerY = (canvas.height - PADDLE_HEIGHT) / 2;
let aiY = (canvas.height - PADDLE_HEIGHT) / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballVelX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
let ballVelY = BALL_SPEED * (Math.random() * 2 - 1);

function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballVelX = BALL_SPEED * (Math.random() > 0.5 ? 1 : -1);
  ballVelY = BALL_SPEED * (Math.random() * 2 - 1);
}

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();
}

function drawNet() {
  ctx.strokeStyle = "#fff";
  ctx.setLineDash([10, 15]);
  ctx.beginPath();
  ctx.moveTo(canvas.width/2, 0);
  ctx.lineTo(canvas.width/2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function draw() {
  // Clear
  drawRect(0, 0, canvas.width, canvas.height, "#000");

  // Net
  drawNet();

  // Paddles
  drawRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, "#fff");
  drawRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT, "#fff");

  // Ball
  drawCircle(ballX, ballY, BALL_RADIUS, "#f5c518");
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

// Mouse input for player paddle
canvas.addEventListener('mousemove', function (e) {
  const rect = canvas.getBoundingClientRect();
  const mouseY = e.clientY - rect.top;
  playerY = clamp(mouseY - PADDLE_HEIGHT / 2, 0, canvas.height - PADDLE_HEIGHT);
});

// AI paddle logic
function updateAI() {
  const target = ballY - PADDLE_HEIGHT / 2;
  if (aiY < target) {
    aiY += PADDLE_SPEED;
  } else if (aiY > target) {
    aiY -= PADDLE_SPEED;
  }
  // Clamp to canvas
  aiY = clamp(aiY, 0, canvas.height - PADDLE_HEIGHT);
}

// Collision detection
function checkPaddleCollision(px, py) {
  // Is the ball inside the vertical range of the paddle?
  return (
    ballY + BALL_RADIUS > py &&
    ballY - BALL_RADIUS < py + PADDLE_HEIGHT
  );
}

function update() {
  // Ball movement
  ballX += ballVelX;
  ballY += ballVelY;

  // Top/Bottom wall collision
  if (ballY - BALL_RADIUS < 0) {
    ballY = BALL_RADIUS;
    ballVelY = -ballVelY;
  }
  if (ballY + BALL_RADIUS > canvas.height) {
    ballY = canvas.height - BALL_RADIUS;
    ballVelY = -ballVelY;
  }

  // Player paddle collision
  if (
    ballX - BALL_RADIUS < PLAYER_X + PADDLE_WIDTH &&
    ballX - BALL_RADIUS > PLAYER_X &&
    checkPaddleCollision(PLAYER_X, playerY)
  ) {
    ballX = PLAYER_X + PADDLE_WIDTH + BALL_RADIUS;
    ballVelX = -ballVelX;

    // Add a little "spin" based on where the ball hits the paddle
    let hitPos = (ballY - (playerY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
    ballVelY = BALL_SPEED * hitPos;
  }

  // AI paddle collision
  if (
    ballX + BALL_RADIUS > AI_X &&
    ballX + BALL_RADIUS < AI_X + PADDLE_WIDTH &&
    checkPaddleCollision(AI_X, aiY)
  ) {
    ballX = AI_X - BALL_RADIUS;
    ballVelX = -ballVelX;

    // Add spin
    let hitPos = (ballY - (aiY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
    ballVelY = BALL_SPEED * hitPos;
  }

  // Left or right wall: reset ball
  if (ballX < 0 || ballX > canvas.width) {
    resetBall();
  }

  updateAI();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

resetBall();
gameLoop();
