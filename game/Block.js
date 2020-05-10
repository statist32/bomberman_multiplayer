const Obstacle = require('./Obstacle.js')
class Block extends Obstacle {
  constructor(board, row, column, breakable = false) {
    super(board, row, column)
    this.breakable = breakable
  }

  break() {
    if (this.breakable) {
      this.removeFromBoard()
    }
  }
}

module.exports = Block
