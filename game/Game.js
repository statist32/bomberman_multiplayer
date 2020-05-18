
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
    this.io = io;
    this.gameState = 'waiting';

    setInterval(() => {
      this.run();
    }, 1000 / FRAME_RATE);
  }

  restart() {
    this.board.init();
    Object.values(this.players).forEach((player, index) => {
      const { id, username } = player;
      this.removePlayer(id);
      this.addPlayer(id, index, username);
    });
    this.gameState = 'waiting';
  }


  idExists(id) {
    return Object.prototype.hasOwnProperty.call(this.players, id);
  }

  addPlayer(id, position, username) {
    let row;
    let column;
    const playerCount = Object.keys(this.players).length;
    if (playerCount < 4) {
      if (typeof position !== 'number') {
        row = Math.floor(playerCount / 2) * (this.rows - 1);
        column = (playerCount % 2) * (this.columns - 1);
      } else {
        row = Math.floor(position / 2) * (this.rows - 1);
        column = (position % 2) * (this.columns - 1);
      }
      this.players[id] = new Character(this.board.board, row, column, id, username);
    } else {
      this.io.in(this.room).emit('message', `${username} have to wait until someone leaves.`);
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


    const playerCount = Object.keys(this.players).length;
    const playersAlive = Object.values(this.players).filter((player) => player.isAlive).length;
    if (playersAlive < 2 && this.gameState === 'running') {
      this.gameState = 'over';
    } else if (playersAlive === 0 && playerCount === 1 && this.gameState === 'waiting') {
      this.gameState = 'restarting';
      setTimeout(() => this.restart(), 1000);
    } else if (playerCount < 2 && this.gameState !== 'restarting') {
      this.gameState = 'waiting';
    } else if (playerCount > 1 && this.gameState === 'waiting') {
      this.gameState = 'running';
    }
  }

  getWinner() {
    return Object.values(this.players).filter((player) => player.isAlive)[0].username;
  }

  run() {
    const oldGameState = this.gameState;
    this.update();
    const formattedBoard = this.board.convertToSendFormat();
    if (this.gameState === 'over' && oldGameState === 'running') {
      this.io.in(this.room).emit('message', `${this.getWinner()} has won!`);
      this.gameState = 'restarting';
      setTimeout(() => this.restart(), 3000);
    }
    this.sendBoard(formattedBoard);
  }

  sendBoard(formattedBoard) {
    this.io.in(this.room).emit('update', JSON.stringify(formattedBoard));
  }
}

module.exports = Game;
