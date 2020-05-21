// eslint-disable-next-line import/extensions
import Draw from './Draw.js';

let board;
let username;

const socket = io();

socket.on('connect', () => {
  const room = window.location.hash;
  socket.emit('join', room);
});

socket.on('message', (msg) => {
  const chat = document.getElementById('chat');
  const divNode = document.createElement('div');
  divNode.classList.add('message');
  const textNode = document.createTextNode(`${msg}`);
  divNode.appendChild(textNode);
  chat.append(divNode);
  divNode.scrollIntoView();
});

socket.on('update', (newBoard) => {
  board = JSON.parse(newBoard);
});

const sendButton = document.getElementById('message-button');


sendButton.addEventListener('click', (e) => {
  e.preventDefault();
  const messageField = document.getElementById('message-field');
  if (!username) {
    const notification = document.getElementById('notification');
    username = messageField.value;
    socket.emit('setUsername', username);
    notification.parentElement.removeChild(notification);
  } else {
    socket.emit('message', messageField.value);
  }
  messageField.value = '';
});


function handleInput(e) {
  if (document.activeElement.id !== 'message-field') {
    switch (e.key) {
      case 'w':
        socket.emit('move', 'moveUp');
        break;

      case 'a':
        socket.emit('move', 'moveLeft');
        break;

      case 's':
        socket.emit('move', 'moveDown');
        break;

      case 'd':
        socket.emit('move', 'moveRight');
        break;
      case ' ':
        socket.emit('plantBomb');
        break;

      default:
        break;
    }
  }
}
document.addEventListener('keypress', handleInput);

const draw = new Draw(['bomb', 'fire', 'character', 'block_hard', 'block_breakable']);

function animate() {
  draw.clear();
  if (board) {
    board.forEach((row, rowIndex) => {
      row.forEach((tile, tileIndex) => {
        if (tile !== 0) {
          switch (tile) {
            case 1:
              draw.player(rowIndex, tileIndex);
              break;
            case 2:
              draw.block(rowIndex, tileIndex, true);
              break;
            case 3:
              draw.block(rowIndex, tileIndex, false);
              break;
            case 4:
              draw.bomb(rowIndex, tileIndex);
              break;
            case 5:
              draw.fire(rowIndex, tileIndex);
              break;
            default:
              break;
          }
        }
      });
    });
  }
  requestAnimationFrame(animate);
}

animate();
