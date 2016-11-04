import Grout from './Grout';
import Object3D from './Object3D';
import Tile from './Tile';
import * as Three from 'three';

class Wall extends Object3D {
  static get LAYOUT_GRID() { return 0; }
  static get LAYOUT_BRICK_HORIZONTAL() { return 1; }
  static get LAYOUT_BRICK_VERTICAL() { return 2; }
  static get LAYOUT_CHECKERBOARD() { return 3; }

  constructor(position, plan, direction, width, height, ratio, tileRatio, tiles, options) {
    super(width, height, plan, ratio);
    this.position = position;
    this.direction = direction;
    this.tileRatio = tileRatio;
    this.tiles = tiles || [];
    this.options = Object.assign({
      selectedTile: null,
      checkerboardSelectedTile: null,
      defaultColor: 0xffffff,
      layout: 0,
      grout: {}
    }, options);
    this.grout = this.options.grout;

    this.supportLayouts = [
      Wall.LAYOUT_GRID,             // grid (default)
      Wall.LAYOUT_BRICK_HORIZONTAL, // brick by row
      Wall.LAYOUT_BRICK_VERTICAL,   // brick by column
      Wall.LAYOUT_CHECKERBOARD      // checkerboard
    ];

    this.position.x *= this.ratio;
    this.position.y *= this.ratio;
    this.position.z *= this.ratio;

    this.mountedTiles = [];
  }

  get selectedTile() {
    const tile = this.tiles[this.options.selectedTile];
    tile.plan = this.plan;

    return tile;
  }

  get checkerboardSelectedTile() {
    if (this.options.checkerboardSelectedTile === null) {
      return this.selectedTile;
    }

    const tile = this.tiles[this.options.checkerboardSelectedTile];
    tile.plan = this.plan;

    return tile;
  }

  mount() {
    if (this.options.selectedTile === null) {
      const tile = new Tile(this.width / this.ratio, this.height / this.ratio,
        this.plan, this.ratio, this.options.defaultColor, {});
      tile.position = this.position;
      this.mountedTiles.push(tile.mount());
      tile.clippingByWall(this);
      return this.mountedTiles;
    }

    const tile = this.selectedTile;

    switch (this.plan) {
      case 'x':
        this.pushTile(this.mountedTiles, tile, 'z', 'y');
        break;
      case 'y':
        this.pushTile(this.mountedTiles, tile, 'x', 'z');
        break;
      case 'z':
        this.pushTile(this.mountedTiles, tile, 'x', 'y');
        break;
    }

    return this.mountedTiles;
  }

  pushTile(tiles, tile, x, y) {
    let startPoint = this.points[0];
    let cell = {x: 0, y: 0};
    this.pushTileVertical(tile, startPoint, y, () => {
      this.pushTileHorizontal(tile, startPoint, x, () => {
        tile.position = Object.assign({}, startPoint);

        // add tiles by layout: brick horizontal
        if (this.options.layout === Wall.LAYOUT_BRICK_HORIZONTAL && cell.y % 2 === 0) {
          tile.position[x] = tile.position[x] + tile.width/2 * (this.direction.x === 'lr' ? -1 : 1);
        }
        // add tiles by layout: brick vertical
        else if (this.options.layout === Wall.LAYOUT_BRICK_VERTICAL && cell.x % 2 === 0) {
          tile.position[y] = tile.position[y] + tile.height/2 * (this.direction.x === 'bt' ? -1 : 1);
        }
        // add tiles by layout: checkerboard
        else if (this.options.layout === Wall.LAYOUT_CHECKERBOARD) {
          if ((cell.x + cell.y) % 2 === 0) {
            tile = this.checkerboardSelectedTile;
          } else {
            tile = this.selectedTile;
          }
          tile.position = Object.assign({}, startPoint);
        }

        tiles.push(tile.mount(this.options.grout.size));

        tile.clippingByWall(this);

        if (this.options.grout.size) {
          this.pushGrouts(tiles, tile);
        }

        cell.x++;
      });
      cell.y++;
      cell.x = 0;
    });
  }

  pushGrouts(tiles, tile) {
    const grout = new Grout(tile.width / tile.ratio, tile.height / tile.ratio,
      this.plan, tile.ratio, this.options.grout.size, this.options.grout.color);
    grout.position = Object.assign({}, tile.position);
    tiles.push(grout.mount('top'));
    grout.clippingByWall(this);
    tiles.push(grout.mount('bottom'));
    grout.clippingByWall(this);
    tiles.push(grout.mount('left'));
    grout.clippingByWall(this);
    tiles.push(grout.mount('right'));
    grout.clippingByWall(this);
  }

  pushTileHorizontal(tile, startPoint, x, execute) {
    const tileWidth = tile.width;

    switch (this.direction.x) {
      case 'lr':
        // left to right
        startPoint[x] = this.points[0][x] - (-tileWidth + this.width) / 2;
        startPoint[x] -= tileWidth; // render more 1 tile
        while (startPoint[x] < this.points[2][x] - (-tileWidth + this.width) / 2 + 2 * tileWidth) {
          execute();
          startPoint[x] += tileWidth;
        }
        break;

      case 'rl':
        // right to left
        startPoint[x] = this.points[2][x] - (tileWidth + this.width) / 2;
        startPoint[x] += tileWidth; // render more 1 tile
        while (startPoint[x] > this.points[0][x] - (tileWidth + this.width) / 2 - 2 * tileWidth) {
          execute();
          startPoint[x] -= tileWidth;
        }
        break;
    }
  }

  pushTileVertical(tile, startPoint, y, execute) {
    const tileHeight = tile.height;

    switch (this.direction.y) {
      case 'tb':
        // top to bottom
        startPoint[y] = this.points[2][y] - (tileHeight + this.height) / 2;
        startPoint[y] += tileHeight; // render more 1 tile
        while (startPoint[y] > this.points[0][y] - (tileHeight + this.height) / 2 - 2 * tileHeight){
          execute();
          startPoint[y] -= tileHeight;
        }
        break;

      case 'bt':
        // bottom to top
        startPoint[y] = this.points[0][y] - (-tileHeight + this.height) / 2;
        startPoint[y] -= tileHeight; // render more 1 tile
        while (startPoint[y] < this.points[2][y] - (-tileHeight + this.height) / 2 + 2 * tileHeight) {
          execute();
          startPoint[y] += tileHeight;
        }
        break;
    }
  }

  set grout(groutOptions) {
    this.options.grout = Object.assign({
      size: 0,
      color: 0xffffff
    }, groutOptions);
    this.options.grout.size *= this.tileRatio;
  }
}

export default Wall;
