const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const TILE_SIZE = 32;
const ROWS = 21;
const COLUMNS = 21;

canvas.height = ROWS * TILE_SIZE;
canvas.width = COLUMNS * TILE_SIZE;

const C_HEIGHT = canvas.height;
const C_WIDTH = canvas.width;

export default class Draw {
  constructor(imageNames) {
    this.ctx = ctx;
    this.tileSize = TILE_SIZE;
    this.images = this.createImages(imageNames);
    this.height = C_HEIGHT;
    this.width = C_WIDTH;
  }

  createImages(imageNames) {
    const images = {};
    imageNames.forEach((source) => {
      const image = new Image(this.tileSize, this.tileSize);
      image.src = `/public/sprites/${source}.png`;
      images[source] = image;
    });
    return images;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  bomb(row, column) {
    this.ctx.drawImage(this.images.bomb, column * this.tileSize,
      row * this.tileSize, this.tileSize, this.tileSize);
  }

  fire(row, column) {
    this.ctx.drawImage(this.images.fire, column * this.tileSize,
      row * this.tileSize, this.tileSize, this.tileSize);
  }

  player(row, column) {
    this.ctx.drawImage(this.images.character, column * this.tileSize,
      row * this.tileSize, this.tileSize, this.tileSize);
  }

  block(row, column, breakable = false) {
    this.ctx.drawImage(this.images[`block_${breakable ? 'breakable' : 'hard'}`],
      column * this.tileSize, row * this.tileSize, this.tileSize, this.tileSize);
  }
}
