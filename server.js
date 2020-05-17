const express = require('express');

const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use('/public', express.static(`${__dirname}/public`));

const Game = require('./game/Game.js');

const ROWS = 21;
const COLUMNS = 21;


app.all('*', (req, res) => {
  res.sendFile(`${__dirname}/public/index.html`);
});

// roomID:{players:[], game:gameObj}
const rooms = {};

io.on('connection', (socket) => {
  const ID = socket.id;
  let ROOM = '';
  let GAME = '';
  socket.on('join', (room) => {
    // sanity check needed
    ROOM = escape(room);
    socket.join(ROOM);
    if (Object.prototype.hasOwnProperty.call(rooms, ROOM)) {
      rooms[ROOM].players.push(ID);
    } else {
      rooms[ROOM] = { players: [ID], game: new Game(ROWS, COLUMNS, ROOM, io) };
    }
    GAME = rooms[ROOM].game;
    GAME.addPlayer(ID);
  });

  socket.on('move', (direction) => {
    GAME.movePlayer(ID, direction);
  });

  socket.on('plantBomb', () => {
    GAME.plantBomb(ID);
  });

  socket.on('disconnect', () => {
    GAME.removePlayer(ID);
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
