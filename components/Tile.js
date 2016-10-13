import {Phoria} from 'phoria.js';

class Tile {
  constructor(width, height, ratio, texture) {
    this.width = width;
    this.height = height;
    this.ratio = ratio;
    this.texture = texture;

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
    const tile = Phoria.Entity.create({
      points: this.points,
      polygons: [{vertices:[0,1,2,3]}],
      style: {
        shademode: "plain",
        opacity: 1,
        doublesided: true
      }
    });

    tile.textures.push(this.texture);
    tile.polygons[0].texture = 0;

    return tile;
  }
}

export default Tile;
