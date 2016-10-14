import Object3D from './Object3D';
import {Phoria} from 'phoria.js';

class Tile extends Object3D {
  constructor(width, height, ratio, texture) {
    super(width, height, ratio);
    this.texture = texture;
  }

  mount() {
    const tile = Phoria.Entity.create({
      points: this.points,
      polygons: [{vertices:[0,1,2,3]}],
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
}

export default Tile;
