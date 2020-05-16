const Block = require('./Block.js')
const Character = require('./Character.js')
const Bomb = require('./Bomb.js')
const Fire = require('./Fire.js')

class Board {
  constructor(rows, columns) {
    this.rows = rows
    this.columns = columns
    this.init()
  }
  init() {
    this.board = this.createBoard()
    this.fill()
  }
  createBoard() {
    return Array(this.rows)
      .fill()
      .map(() =>
        Array(this.columns)
          .fill()
          .map(() => Array())
      )
  }
  fill() {
    for (let row = 1; row < this.rows - 1; row += 1) {
      for (let column = 1; column < this.columns - 1; column += 1) {
        new Block(this.board, row, column, (row * column) % 2 === 0)
        if (row === 1 && column > 4 && column < this.columns - 4) {
          new Block(this.board, row - 1, column, true)
        } else if (
          row === this.rows - 2 &&
          column > 4 &&
          column < this.columns - 4
        ) {
          new Block(this.board, row + 1, column, true)
        } else if (column === 1 && row > 4 && row < this.columns - 4) {
          new Block(this.board, row, column - 1, true)
        } else if (
          column === this.columns - 2 &&
          row > 4 &&
          row < this.columns - 4
        ) {
          new Block(this.board, row, column + 1, true)
        }
      }
    }
  }
  convertToSendFormat() {
    let formattedBoard = Array(this.rows)
      .fill()
      .map(() => Array(this.columns))
    this.board.forEach((row, rowIndex) => {
      row.forEach((tile, tileIndex) => {
        tile.forEach((object) => {
          if (object instanceof Character) {
            if (object.isAlive) {
              formattedBoard[rowIndex][tileIndex] = 1
            }
          } else if (object instanceof Block) {
            formattedBoard[rowIndex][tileIndex] = object.breakable ? 2 : 3
          } else if (object instanceof Bomb) {
            formattedBoard[rowIndex][tileIndex] = 4
          } else if (object instanceof Fire) {
            formattedBoard[rowIndex][tileIndex] = 5
          }
        })
      })
    })
    return formattedBoard
  }
}

module.exports = Board
