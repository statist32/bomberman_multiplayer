const gameStateDisplay = document.getElementById("game-state-display");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const TILE_SIZE = 20;
const ROWS = 21;
const COLUMNS = 21;

canvas.height = ROWS * TILE_SIZE;
canvas.width = COLUMNS * TILE_SIZE;

const C_HEIGHT = canvas.height;
const C_WIDTH = canvas.width;

const socket = io();

let board;
let player;

const ROOM = window.location.hash;

socket.on("connect", () => {
  socket.emit("join", ROOM);
});

socket.on("test", (msg) => {
  console.log(msg);
});

socket.on("update", (newBoard) => {
  board = JSON.parse(newBoard);
});
socket.on("gameStateUpdate", (state) => (gameStateDisplay.innerText = state));

function handleInput(e) {
  switch (e.key) {
    case "w":
      socket.emit("move", "moveUp");
      break;

    case "a":
      socket.emit("move", "moveLeft");
      break;

    case "s":
      socket.emit("move", "moveDown");
      break;

    case "d":
      socket.emit("move", "moveRight");
      break;
    case " ":
      socket.emit("plantBomb");
      break;
    default:
      break;
  }
}
document.addEventListener("keypress", handleInput);

function animate() {
  ctx.clearRect(0, 0, C_WIDTH, C_HEIGHT);

  board &&
    board.forEach((row, rowIndex) => {
      row.forEach((tile, tileIndex) => {
        if (tile !== 0) {
          switch (tile) {
            case 1:
              drawPlayer(ctx, rowIndex, tileIndex);
              break;
            case 2:
              drawBlock(ctx, rowIndex, tileIndex, true);
              break;
            case 3:
              drawBlock(ctx, rowIndex, tileIndex, false);
              break;
            case 4:
              drawBomb(ctx, rowIndex, tileIndex);
              break;
            case 5:
              drawFire(ctx, rowIndex, tileIndex);
              break;
            default:
              break;
          }
        }
      });
    });
  requestAnimationFrame(animate);
}

animate();

function drawPlayer(ctx, row, column) {
  ctx.fillStyle = "green";
  ctx.fillRect(column * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

function drawBlock(ctx, row, column, breakable = false) {
  ctx.fillStyle = breakable ? "brown" : "grey";
  ctx.fillRect(column * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}

function drawBomb(ctx, row, column) {
  ctx.fillStyle = "black";
  ctx.beginPath();
  const radius = TILE_SIZE / 2;
  ctx.arc(
    column * TILE_SIZE + TILE_SIZE / 2,
    row * TILE_SIZE + TILE_SIZE / 2,
    radius,
    0,
    2 * Math.PI
  );
  ctx.fill();
}

function drawFire(ctx, row, column) {
  ctx.fillStyle = "red";
  ctx.fillRect(column * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
}
