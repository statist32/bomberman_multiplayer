const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use("/public", express.static(__dirname + "/public"));

const Board = require("./game/Board.js");
const Character = require("./game/Character.js");

const ROWS = 21;
const COLUMNS = 21;
const FRAME_RATE = 60;

class Game {
  constructor(rows, columns, room) {
    this.rows = rows;
    this.columns = columns;
    this.room = room;
    this.players = {};
    this.board = new Board(this.rows, this.columns, this.room);
    this.hasStarted = false;

    setInterval(() => {
      this.run();
    }, 1000 / FRAME_RATE);
  }
  restart() {
    console.log("Restarting");
    this.board.init();
    Object.values(this.players).forEach((player, index) => {
      const id = player.id;
      this.removePlayer(id);
      this.addPlayer(id, index);
    });
  }
  isWon() {
    const playerCount = Object.keys(this.players).length;
    let playerAlive = 0;
    Object.entries(this.players).forEach(([_, { isAlive }]) => {
      if (isAlive) {
        playerAlive++;
      }
    });
    return playerAlive === 1 && this.hasStarted && playerCount > 1
      ? true
      : false;
  }
  idExists(id) {
    return this.players.hasOwnProperty(id);
  }
  addPlayer(id, position) {
    let row, column;
    const playerCount = Object.keys(this.players).length;
    if (typeof position != "number") {
      row = Math.floor(playerCount / 2) * (this.rows - 1);
      column = (playerCount % 2) * (this.columns - 1);
    } else {
      row = Math.floor(position / 2) * (this.rows - 1);
      column = (position % 2) * (this.columns - 1);
    }
    this.players[id] = new Character(this.board.board, row, column, id);
    if (playerCount + 1 > 1) {
      this.hasStarted = true;
      io.in(this.room).emit("gameStateUpdate", "Running");
    }
  }

  removePlayer(id) {
    if (this.idExists(id)) {
      this.players[id].removeFromBoard();
      delete this.players[id];
    }
  }
  movePlayer(id, direction) {
    if (this.idExists(id) && this.players[id].isAlive) {
      this.players[id].move(direction);
    }
  }
  plantBomb(id) {
    if (this.idExists(id) && this.players[id].isAlive) {
      this.players[id].plantBomb();
    }
  }

  update() {
    Object.entries(this.players).forEach(([id, { isAlive, row, column }]) => {
      if (isAlive) {
        this.players[id].row = row;
        this.players[id].column = column;
      }
    });
  }

  run() {
    this.update();
    let triggered = false;
    const formattedBoard = this.board.convertToSendFormat();
    if (this.isWon() && !triggered) {
      triggered = true;
      io.in(this.room).emit("gameStateUpdate", "Over");
      setTimeout(() => this.restart(), 5000);
    }
    this.sendBoard(formattedBoard);
  }
  sendBoard(formattedBoard) {
    io.in(this.room).emit("update", JSON.stringify(formattedBoard));
  }
}

app.all("*", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// roomID:{players:[], game:gameObj}
let rooms = {};

io.on("connection", (socket) => {
  const ID = socket.id;
  let ROOM = "";
  let GAME = "";
  socket.on("join", (room) => {
    //sanity check needed
    ROOM = room;
    socket.join(ROOM);
    if (rooms.hasOwnProperty(ROOM)) {
      rooms[ROOM].players.push(ID);
    } else {
      rooms[ROOM] = { players: [ID], game: new Game(ROWS, COLUMNS, ROOM) };
    }
    GAME = rooms[ROOM].game;
    GAME.addPlayer(ID);
  });

  socket.on("msg", (msg) => {});

  socket.on("move", (direction) => {
    GAME.movePlayer(ID, direction);
  });

  socket.on("plantBomb", () => {
    GAME.plantBomb(ID);
  });

  socket.on("disconnect", () => {
    GAME.removePlayer(ID);
  });
});

http.listen(3000, () => {
  console.log("listening on *:3000");
});
