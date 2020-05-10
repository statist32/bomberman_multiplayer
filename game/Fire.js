const Entity = require('./Entity.js')

class Fire extends Entity {
  constructor(board, row, column, tileSize, fireDuration = 500) {
    super(board, row, column, tileSize)
    this.fireDuration = fireDuration
    setTimeout(() => this.removeFromBoard(), this.fireDuration)
  }
  draw(ctx) {
    ctx.fillStyle = 'red'
    ctx.fillRect(
      this.column * this.tileSize,
      this.row * this.tileSize,
      this.tileSize,
      this.tileSize
    )
  }
}

module.exports = Fire
