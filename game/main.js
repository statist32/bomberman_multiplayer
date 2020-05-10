// import Bomb from "./Bomb"
// import Block from "./Block"
// import Character from "./Character"

import Obstacle from './Obstacle.js'
import Character from './Character.js'
import Block from './Block.js'
import Bomb from './Bomb.js'

const canvas = document.getElementById('canvas')

const TILE_SIZE = 20
const ROWS = 21
const COLUMNS = 21

canvas.height = ROWS * TILE_SIZE
canvas.width = COLUMNS * TILE_SIZE

const C_HEIGHT = canvas.height
const C_WIDTH = canvas.width

const ctx = canvas.getContext('2d')

//create 3 dimensional board

function createBoard(rows, columns) {
  return Array(rows)
    .fill()
    .map(() =>
      Array(columns)
        .fill()
        .map(() => Array())
    )
}
const board = createBoard(ROWS, COLUMNS)

function handleInput(e) {
  switch (e.key) {
    case 'w':
      player.move('up')
      break
    case 'a':
      player.move('left')
      break

    case 's':
      player.move('down')
      break

    case 'd':
      player.move('right')
      break
    case ' ':
      player.plantBomb()
      break
    default:
      break
  }
}

const player = new Character(board, 0, 0, TILE_SIZE, TILE_SIZE, TILE_SIZE)
// const block = new Block(board, 2, 0, TILE_SIZE, false)
// const block2 = new Block(board, 2, 2, TILE_SIZE, true)
// const bomb = new Bomb(board, 4, 4, TILE_SIZE, 1)

function fillBoard(board) {
  for (let row = 1; row < ROWS - 1; row += 1) {
    for (let column = 1; column < COLUMNS - 1; column += 1) {
      new Block(board, row, column, TILE_SIZE, (row * column) % 2 === 0)
      if (row === 1 && column > 4 && column < COLUMNS - 4) {
        new Block(board, row - 1, column, TILE_SIZE, true)
      } else if (row === ROWS - 2 && column > 4 && column < COLUMNS - 4) {
        new Block(board, row + 1, column, TILE_SIZE, true)
      } else if (column === 1 && row > 4 && row < COLUMNS - 4) {
        new Block(board, row, column - 1, TILE_SIZE, true)
      } else if (column === COLUMNS - 2 && row > 4 && row < COLUMNS - 4) {
        new Block(board, row, column + 1, TILE_SIZE, true)
      }
    }
  }
}

fillBoard(board)

function animate() {
  ctx.clearRect(0, 0, C_WIDTH, C_HEIGHT)

  //draw every object
  board.forEach((row) => {
    row.forEach((tile) => {
      if (tile.length !== 0) {
        tile.forEach((el) => el.draw(ctx))
      }
    })
  })
  requestAnimationFrame(animate)
}

animate()

document.addEventListener('keypress', handleInput)
