import Object3D from './Object3D';
import Tile from './Tile';
import * as Three from 'three';

class Wall extends Object3D {
  constructor(position, plan, direction, width, height, ratio, tileRatio, tiles, options) {
    super(width, height, plan, ratio);
    this.position = position;
    this.direction = direction;
    this.tileRatio = tileRatio;
    this.tiles = tiles || [];
    this.options = Object.assign({
      selectedTile: null,
      defaultColor: 0xffffff,
      layout: 0
    }, options);

    this.position.x *= this.ratio;
    this.position.y *= this.ratio;
    this.position.z *= this.ratio;

    this.mountedTiles = [];
  }

  mount() {
    if (this.options.selectedTile === null) {
      const tile = new Tile(this.width / this.ratio, this.height / this.ratio,
        this.plan, this.ratio, this.options.defaultColor);
      tile.position = this.position;
      this.mountedTiles.push(tile.mount());
      return this.mountedTiles;
    }

    const tile = this.tiles[this.options.selectedTile];
    tile.plan = this.plan;

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
        if (this.options.layout === 1 && cell.y % 2 === 0) {
          tile.position[x] = tile.position[x] + tile.width/2 * (this.direction.x === 'lr' ? -1 : 1);
        }
        // add tiles by layout: brick vertical
        else if (this.options.layout === 2 && cell.x % 2 === 0) {
          tile.position[y] = tile.position[y] + tile.height/2 * (this.direction.x === 'bt' ? -1 : 1);
        }

        tiles.push(tile.mount());
        cell.x++;
      });
      cell.y++;
      cell.x = 0;
    });
  }

  pushTileHorizontal(tile, startPoint, x, execute) {
    switch (this.direction.x) {
      case 'lr':
        // left to right
        startPoint[x] = this.points[0][x] - (-tile.width + this.width) / 2;
        startPoint[x] -= tile.width; // render more 1 tile
        while (startPoint[x] < this.points[2][x] - (-tile.width + this.width) / 2 + tile.width) {
          execute();
          startPoint[x] += tile.width;
        }
        break;

      case 'rl':
        // right to left
        startPoint[x] = this.points[2][x] - (tile.width + this.width) / 2;
        startPoint[x] += tile.width; // render more 1 tile
        while (startPoint[x] > this.points[0][x] - (tile.width + this.width) / 2 - tile.width) {
          execute();
          startPoint[x] -= tile.width;
        }
        break;
    }
  }

  pushTileVertical(tile, startPoint, y, execute) {
    switch (this.direction.y) {
      case 'tb':
        // top to bottom
        startPoint[y] = this.points[2][y] - (tile.height + this.height) / 2;
        startPoint[y] += tile.height; // render more 1 tile
        while (startPoint[y] > this.points[0][y] - (tile.height + this.height) / 2 - tile.height){
          execute();
          startPoint[y] -= tile.height;
        }
        break;

      case 'bt':
        // bottom to top
        startPoint[y] = this.points[0][y] - (-tile.height + this.height) / 2;
        startPoint[y] -= tile.height; // render more 1 tile
        while (startPoint[y] < this.points[2][y] - (-tile.height + this.height) / 2 + tile.height) {
          execute();
          startPoint[y] += tile.height;
        }
        break;
    }
  }
}

export default Wall;
