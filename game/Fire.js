const Entity = require('./Entity.js');

class Fire extends Entity {
  constructor(board, row, column, fireDuration = 500) {
    super(board, row, column);
    this.fireDuration = fireDuration;
    setTimeout(() => this.removeFromBoard(), this.fireDuration);
  }
}

module.exports = Fire;
