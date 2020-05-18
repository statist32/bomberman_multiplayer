const Fire = require('./Fire.js');
const Bomb = require('./Bomb.js');
const Obstacle = require('./Obstacle.js');

class Character extends Obstacle {
  constructor(board, row, column, id, username) {
    super(board, row, column);
    this.id = id;
    this.isAlive = true;
    this.username = username;
  }

  canMove(row, column) {
    if (!this.isValidPosition(row, column)) { return false; }
    let valid = true;
    this.board[row][column].forEach((object) => {
      if (object instanceof Obstacle) {
        valid = false;
      } else if (object instanceof Fire) {
        this.die();
        valid = false;
      }
    });
    return valid;
  }

  move(direction) {
    switch (direction) {
      case 'moveUp':
        if (this.canMove(this.row - 1, this.column)) {
          this.removeFromBoard();
          this.row -= 1;
          this.addToBoard();
        }
        break;
      case 'moveLeft':
        if (this.canMove(this.row, this.column - 1)) {
          this.removeFromBoard();
          this.column -= 1;
          this.addToBoard();
        }
        break;
      case 'moveDown':
        if (this.canMove(this.row + 1, this.column)) {
          this.removeFromBoard();
          this.row += 1;
          this.addToBoard();
        }
        break;
      case 'moveRight':
        if (this.canMove(this.row, this.column + 1)) {
          this.removeFromBoard();
          this.column += 1;
          this.addToBoard();
        }
        break;
      default:
        break;
    }
  }

  die() {
    this.removeFromBoard();
    this.isAlive = false;
    console.log('You died!');
  }

  plantBomb() {
    new Bomb(this.board, this.row, this.column, 2, 1500);
  }
}

module.exports = Character;
