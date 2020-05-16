class Entity {
  //non blocking
  constructor(board, row, column) {
    this.board = board;
    this.row = row;
    this.column = column;

    this.addToBoard();
  }
  addToBoard() {
    this.board[this.row][this.column].push(this);
  }
  removeFromBoard() {
    this.board[this.row][this.column] = this.board[this.row][
      this.column
    ].filter((el) => el !== this);
  }
  isValidPosition(row, column) {
    return this.board[row] === undefined ||
      this.board[row][column] === undefined
      ? false
      : true;
  }
}

module.exports = Entity;
