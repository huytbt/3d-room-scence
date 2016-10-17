import Object3D from './Object3D';
import Tile from './Tile';
import {Phoria} from 'phoria.js';

class Wall extends Object3D {
  constructor(position, plan, direction, width, height, ratio, tiles, options) {
    super(width, height, ratio);
    this.position = position;
    this.direction = direction;
    this.plan = plan;
    this.tiles = tiles || [];
    this.options = options || {
      selectedTile: null
    };

    this.position.x *= this.ratio;
    this.position.y *= this.ratio;
    this.position.z *= this.ratio;

    this.mountedTiles = [];
  }

  mount() {
    if (this.options.selectedTile === null) {
      return [];
    }

    const tile = this.tiles[this.options.selectedTile];
    tile.plan = this.plan;

    let startPoint = this.points[3];
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

    this.pushTileVertical(tile, startPoint, y, () => {
      this.pushTileHorizontal(tile, startPoint, x, () => {
        tile.position = startPoint;
        tiles.push(tile.mount(this.options));
      });
    });
  }

  pushTileHorizontal(tile, startPoint, x, execute) {
    switch (this.direction.x) {
      case 'lr':
        // left to right
        startPoint[x] = this.points[0][x];
        while (startPoint[x] < this.points[2][x]) {
          execute();
          startPoint[x] += tile.width;
        }
        break;

      case 'rl':
        // right to left
        startPoint[x] = this.points[2][x] - tile.width;
        while (startPoint[x] > this.points[0][x] - tile.width) {
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
        if (this.plan === 'y') {
          startPoint[y] = this.points[0][y];
          while (startPoint[y] > this.points[2][y]) {
            execute();
            startPoint[y] -= tile.height;
          }
          break;
        } else {
          startPoint[y] = this.points[2][y] - tile.height;
          while (startPoint[y] > this.points[0][y] - tile.height) {
            execute();
            startPoint[y] -= tile.height;
          }
          break;
        }

      case 'bt':
        // bottom to top
        if (this.plan === 'y') {
          startPoint[y] = this.points[2][y] + tile.height;
          while (startPoint[y] < this.points[0][y] + tile.height) {
            execute();
            startPoint[y] += tile.height;
          }
          break;
        } else {
          startPoint[y] = this.points[0][y];
          while (startPoint[y] < this.points[2][y]) {
            execute();
            startPoint[y] += tile.height;
          }
          break;
        }
    }
  }
}

export default Wall;
