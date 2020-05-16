const Obstacle = require('./Obstacle.js');
const Fire = require('./Fire.js');

class Bomb extends Obstacle {
  constructor(board, row, column, range, explodeDelay = 2000) {
    super(board, row, column);
    this.range = range;
    this.explodeDelay = explodeDelay;
    this.timeout = setTimeout(() => this.explode(), this.explodeDelay);
  }

  destroy(object, row, column) {
    // returns false if fire ends here
    if (object.die) {
      object.die();
    }
    if (object.break) {
      object.break();
    } else if (
      object instanceof Bomb
      && (row !== this.row || column !== this.column)
    ) {
      clearTimeout(object.timeout);
      object.explode();
    }
    return true;
  }

  explode() {
    this.removeFromBoard();
    new Fire(this.board, this.row, this.column);
    for (let direction = 0; direction < 4; direction += 1) {
      for (let distance = 1; distance <= this.range; distance += 1) {
        let nextRow; let
          nextColumn;
        switch (direction) {
          case 0:
            nextRow = this.row - distance;
            nextColumn = this.column;
            break;
          case 1:
            nextRow = this.row;
            nextColumn = this.column - distance;
            break;
          case 2:
            nextRow = this.row + distance;
            nextColumn = this.column;
            break;
          case 3:
            nextRow = this.row;
            nextColumn = this.column + distance;
            break;
          default:
            nextRow = this.row;
            nextColumn = this.column;
            break;
        }

        if (this.isValidPosition(nextRow, nextColumn)) {
          this.board[nextRow][nextColumn].forEach((object) => {
            if (this.destroy(object, nextRow, nextColumn)) {
              // break
              distance = this.range + 1;
            }
          });
          new Fire(this.board, nextRow, nextColumn);
        }
      }
    }
  }
}

module.exports = Bomb;
