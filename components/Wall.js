import Tile from './Tile';
import {Phoria} from 'phoria.js';

class Wall {
  constructor(position, direction, width, height, ratio, tiles, selectedTile) {
    this.position = position;
    this.direction = direction;
    this.width = width;
    this.height = height;
    this.ratio = ratio;
    this.tiles = tiles || [];
    this.selectedTile = selectedTile;

    this.position.x *= this.ratio;
    this.position.y *= this.ratio;
    this.position.z *= this.ratio;
    this.width *= this.ratio;
    this.height *= this.ratio;
  }

  get points() {
    let points = [];

    switch (this.direction) {
      case 'x':
        points = [
          {x: this.position.x, y: 1*this.height + this.position.y, z: 0*this.width + this.position.z}, // top - left
          {x: this.position.x, y: 1*this.height + this.position.y, z:-1*this.width + this.position.z}, // top - right
          {x: this.position.x, y: 0*this.height + this.position.y, z:-1*this.width + this.position.z}, // bottom - right
          {x: this.position.x, y: 0*this.height + this.position.y, z: 0*this.width + this.position.z}  // bottom - left
        ];
        break;
      case 'y':
        points = [
          {x: 0*this.width + this.position.x, y: this.position.y, z: 0*this.height + this.position.z}, // top - left
          {x: 1*this.width + this.position.x, y: this.position.y, z: 0*this.height + this.position.z}, // top - right
          {x: 1*this.width + this.position.x, y: this.position.y, z:-1*this.height + this.position.z}, // bottom - right
          {x: 0*this.width + this.position.x, y: this.position.y, z:-1*this.height + this.position.z}  // bottom - left
        ];
        break;
      case 'z':
        points = [
          {x: 0*this.width + this.position.x, y: 1*this.height + this.position.y, z: this.position.z}, // top - left
          {x: 1*this.width + this.position.x, y: 1*this.height + this.position.y, z: this.position.z}, // top - right
          {x: 1*this.width + this.position.x, y: 0*this.height + this.position.y, z: this.position.z}, // bottom - right
          {x: 0*this.width + this.position.x, y: 0*this.height + this.position.y, z: this.position.z}  // bottom - left
        ];
        break;
    }

    return points;
  }

  mount() {
    const tiles = [];

    const tile = this.tiles[this.selectedTile];
    tile.direction = this.direction;

    let startPoint = this.points[3];
    switch (this.direction) {
      case 'x':
        while (startPoint.y < this.points[0].y) {
          while (startPoint.z > this.points[2].z) {
            tile.position = startPoint;
            tiles.push(tile.mount());
            startPoint.z -= tile.width;
          }
          startPoint.z = this.points[3].z;
          startPoint.y += tile.height;
        }
        break;
      case 'y':
        startPoint = this.points[0];
        while (startPoint.z > this.points[2].z) {
          while (startPoint.x < this.points[2].x) {
            tile.position = startPoint;
            tiles.push(tile.mount());
            startPoint.x += tile.width;
          }
          startPoint.x = this.points[0].x;
          startPoint.z -= tile.height;
        }
        break;
      case 'z':
        while (startPoint.y < this.points[0].y) {
          while (startPoint.x < this.points[2].x) {
            tile.position = startPoint;
            tiles.push(tile.mount());
            startPoint.x += tile.width;
          }
          startPoint.x = this.points[3].x;
          startPoint.y += tile.height;
        }
        break;
    }

    return tiles;
  }
}

export default Wall;
