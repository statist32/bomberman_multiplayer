
const Board = require('./Board.js');
const Character = require('./Character.js');

const FRAME_RATE = 60;


class Game {
  constructor(rows, columns, room, io) {
    this.rows = rows;
    this.columns = columns;
    this.room = room;
    this.players = {};
    this.board = new Board(this.rows, this.columns, this.room);
    this.hasStarted = false;
    this.io = io;

    setInterval(() => {
      this.run();
    }, 1000 / FRAME_RATE);
  }

  restart() {
    console.log('Restarting');
    this.board.init();
    Object.values(this.players).forEach((player, index) => {
      const { id } = player;
      this.removePlayer(id);
      this.addPlayer(id, index);
    });
  }

  isWon() {
    const playerCount = Object.keys(this.players).length;
    let playerAlive = 0;
    Object.values(this.players).forEach(({ isAlive }) => {
      if (isAlive) {
        playerAlive += 1;
      }
    });
    return !!(playerAlive === 1 && this.hasStarted && playerCount > 1);
  }

  idExists(id) {
    return Object.prototype.hasOwnProperty.call(this.players, id);
  }

  addPlayer(id, position) {
    let row; let
      column;
    const playerCount = Object.keys(this.players).length;
    if (typeof position !== 'number') {
      row = Math.floor(playerCount / 2) * (this.rows - 1);
      column = (playerCount % 2) * (this.columns - 1);
    } else {
      row = Math.floor(position / 2) * (this.rows - 1);
      column = (position % 2) * (this.columns - 1);
    }
    this.players[id] = new Character(this.board.board, row, column, id);
    if (playerCount + 1 > 1) {
      this.hasStarted = true;
      this.io.in(this.room).emit('gameStateUpdate', 'Running');
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
      this.io.in(this.room).emit('gameStateUpdate', 'Over');
      setTimeout(() => this.restart(), 5000);
    }
    this.sendBoard(formattedBoard);
  }

  sendBoard(formattedBoard) {
    this.io.in(this.room).emit('update', JSON.stringify(formattedBoard));
  }
}

module.exports = Game;
