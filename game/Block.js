const Obstacle = require('./Obstacle.js')
class Block extends Obstacle {
  constructor(board, row, column, tileSize, breakable = false) {
    super(board, row, column, tileSize)
    this.breakable = breakable
  }

  draw(ctx) {
    ctx.fillStyle = this.breakable ? 'brown' : 'grey'
    ctx.fillRect(
      this.column * this.tileSize,
      this.row * this.tileSize,
      this.tileSize,
      this.tileSize
    )
  }
  break() {
    if (this.breakable) {
      this.removeFromBoard()
    }
  }
}

module.exports = Block
