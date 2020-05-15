const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

app.use('/public', express.static(__dirname + '/public'))

const Character = require('./game/Character.js')
const Block = require('./game/Block.js')
const Bomb = require('./game/Bomb.js')
const Fire = require('./game/Fire.js')

const ROWS = 21
const COLUMNS = 21
const FRAME_RATE = 60
class Game {
  constructor(rows, columns, room) {
    this.rows = rows
    this.columns = columns
    this.players = {}
    this.initBoard()
    this.fillBoard()
    this.hasStarted = false
    this.room = room
    setInterval(() => {
      this.manageGame()
    }, 1000 / FRAME_RATE)
  }
  restart() {
    console.log('Restarting')
    this.initBoard()
    this.fillBoard()
    Object.values(this.players).forEach((player, index) => {
      const id = player.id
      this.removePlayer(id)
      this.addPlayer(id, index)
    })
    triggered = false
  }
  isWon() {
    const playerCount = Object.keys(this.players).length
    let playerAlive = 0
    Object.entries(this.players).forEach(([_, { isAlive }]) => {
      if (isAlive) {
        playerAlive++
      }
    })
    return playerAlive === 1 && this.hasStarted && playerCount > 1
      ? true
      : false
  }
  idExists(id) {
    return this.players.hasOwnProperty(id)
  }
  addPlayer(id, position) {
    let row, column
    const playerCount = Object.keys(this.players).length
    if (typeof position != 'number') {
      row = Math.floor(playerCount / 2) * (this.rows - 1)
      column = (playerCount % 2) * (this.columns - 1)
    } else {
      row = Math.floor(position / 2) * (this.rows - 1)
      column = (position % 2) * (this.columns - 1)
    }
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
    this.board = Array(this.rows)
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
  formatBoard() {
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
  sendBoard(formattedBoard) {
    io.in(this.room).emit('update', JSON.stringify(formattedBoard))
  }
  manageGame() {
    this.updateBoard()
    const formattedBoard = this.formatBoard()
    if (this.isWon() && !triggered) {
      triggered = true
      io.emit('gameStateUpdate', 'Over')
      setTimeout(() => this.restart(), 5000)
    }
    this.sendBoard(formattedBoard)
  }
}

app.all('*', (req, res) => {
  res.sendFile(__dirname + '/public/index.html')
})

// roomID:{players:[], game:gameObj}
let rooms = {}

io.on('connection', (socket) => {
  const ID = socket.id
  let ROOM = ''
  let GAME = ''

  console.log(`user ${ID} connected`)
  socket.on('join', (room) => {
    //sanity check
    ROOM = room
    socket.join(ROOM)
    if (rooms.hasOwnProperty(ROOM)) {
      rooms[ROOM].players.push(ID)
    } else {
      rooms[ROOM] = { players: [ID], game: new Game(ROWS, COLUMNS, ROOM) }
    }
    GAME = rooms[ROOM].game
    GAME.addPlayer(ID)
    io.in(ROOM).emit('test', `user ${ID} connected in ${room}`)
  })

  socket.on('msg', (msg) => {})

  socket.on('move', (direction) => {
    GAME.movePlayer(ID, direction)
  })

  socket.on('plantBomb', () => {
    GAME.plantBomb(ID)
  })

  socket.on('disconnect', () => {
    console.log(`user ${ID} disconnected`)
    GAME.removePlayer(ID)
  })
})

http.listen(3000, () => {
  console.log('listening on *:3000')
})
