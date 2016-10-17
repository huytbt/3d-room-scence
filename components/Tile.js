import Object3D from './Object3D';
import {Phoria} from 'phoria.js';

class Tile extends Object3D {
  constructor(width, height, ratio, texture) {
    super(width, height, ratio);
    this.texture = texture;
  }

  mount(options) {
    let vertices = [1,2,3,0];
    if (this.plan === 'y') {
      vertices = [3,0,1,2];
    }
    if (options.flipTile) {
      this.swap(vertices, 0, 1);
      this.swap(vertices, 2, 3);
    }
    const tile = Phoria.Entity.create({
      points: this.points,
      polygons: [{vertices}],
      style: {
        shademode: 'plain',
        opacity: 1,
        doublesided: true
      }
    });

    tile.textures.push(this.texture);
    tile.polygons[0].texture = 0;

    return tile;
  }

  swap(object, a, b) {
    const x = object[a];
    object[a] = object[b];
    object[b] = x;
  }
}

export default Tile;
