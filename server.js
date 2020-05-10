const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

app.use('/public', express.static(__dirname + '/public'))

const Character = require('./game/Character.js')
const Block = require('./game/Block.js')
const Bomb = require('./game/Bomb.js')
const Fire = require('./game/Fire.js')

const TILE_SIZE = 20
const ROWS = 21
const COLUMNS = 21

class Game {
  constructor(rows, columns) {
    this.rows = rows
    this.columns = columns
    this.players = {}
    this.board = this.initBoard()
    this.hasStarted = false
  }
  isWon() {
    const playerCount = Object.keys(this.players).length
    let playerAlive = 0
    Object.entries(this.players).forEach(([_, { isAlive }]) => {
      if (isAlive) {
        playerAlive++
      }
    })
    return playerAlive === 1 && game.hasStarted && playerCount > 1
      ? true
      : false
  }
  idExists(id) {
    return this.players.hasOwnProperty(id)
  }
  addPlayer(id) {
    const playerCount = Object.keys(this.players).length
    const row = Math.floor(playerCount / 2) * (this.rows - 1)
    const column = (playerCount % 2) * (this.columns - 1)
    this.players[id] = new Character(this.board, row, column, id)
    if (playerCount + 1 > 1) {
      this.hasStarted = true
      io.emit('gameStateUpdate', 'Running')
    }
  }

  removePlayer(id) {
    if (this.idExists(id)) {
      this.players[id].removeFromBoard()
      delete this.players[id]
    }
  }

  movePlayer(id, direction) {
    if (this.idExists(id) && this.players[id].isAlive) {
      this.players[id].move(direction)
    }
  }
  plantBomb(id) {
    if (this.idExists(id) && this.players[id].isAlive) {
      this.players[id].plantBomb()
    }
  }
  initBoard() {
    return Array(this.rows)
      .fill()
      .map(() =>
        Array(this.columns)
          .fill()
          .map(() => Array())
      )
  }
  updateBoard() {
    Object.entries(this.players).forEach(([id, { isAlive, row, column }]) => {
      if (isAlive) {
        this.players[id].row = row
        this.players[id].column = column
      }
    })
  }
  fillBoard() {
    for (let row = 1; row < this.rows - 1; row += 1) {
      for (let column = 1; column < this.columns - 1; column += 1) {
        new Block(this.board, row, column, TILE_SIZE, (row * column) % 2 === 0)
        if (row === 1 && column > 4 && column < this.columns - 4) {
          new Block(this.board, row - 1, column, TILE_SIZE, true)
        } else if (
          row === this.rows - 2 &&
          column > 4 &&
          column < this.columns - 4
        ) {
          new Block(this.board, row + 1, column, TILE_SIZE, true)
        } else if (column === 1 && row > 4 && row < this.columns - 4) {
          new Block(this.board, row, column - 1, TILE_SIZE, true)
        } else if (
          column === this.columns - 2 &&
          row > 4 &&
          row < this.columns - 4
        ) {
          new Block(this.board, row, column + 1, TILE_SIZE, true)
        }
      }
    }
  }
  sendBoard() {
    let renderedBoard = Array(this.rows)
      .fill()
      .map(() => Array(this.columns))
    this.board.forEach((row, rowIndex) => {
      row.forEach((tile, tileIndex) => {
        tile.forEach((object) => {
          if (object instanceof Character) {
            if (object.isAlive) {
              renderedBoard[rowIndex][tileIndex] = 1
            }
          } else if (object instanceof Block) {
            renderedBoard[rowIndex][tileIndex] = object.breakable ? 2 : 3
          } else if (object instanceof Bomb) {
            renderedBoard[rowIndex][tileIndex] = 4
          } else if (object instanceof Fire) {
            renderedBoard[rowIndex][tileIndex] = 5
          }
        })
      })
    })
    io.emit('update', JSON.stringify(renderedBoard))
  }
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
})

io.on('connection', (socket) => {
  console.log(`user ${socket.id} connected`)
  game.addPlayer(socket.id)

  socket.on('move', (direction) => {
    game.movePlayer(socket.id, direction)
  })

  socket.on('plantBomb', () => {
    game.plantBomb(socket.id)
  })

  socket.on('disconnect', () => {
    console.log(`user ${socket.id} disconnected`)
    game.removePlayer(socket.id)
  })
})

setInterval(() => {
  game.updateBoard()
  if (game.isWon()) {
    io.emit('gameStateUpdate', 'Over')
  }
  game.sendBoard()
}, 1000 / 60)

http.listen(3000, () => {
  console.log('listening on *:3000')
})

const game = new Game(ROWS, COLUMNS)
game.fillBoard()
