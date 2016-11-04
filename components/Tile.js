import Object3D from './Object3D';
import * as Three from 'three';

class Tile extends Object3D {
  constructor(width, height, plan, ratio, texture, meta) {
    super(width, height, plan, ratio);
    this.texture = texture;
    this.meta = meta;
  }

  mount(groutSize) {
    const thick = 0;
    let boxGeometry = null;
    switch (this.plan) {
      case 'x':
        boxGeometry = new Three.BoxGeometry(thick, this.height - 2 * groutSize, this.width - 2 * groutSize);
        break;
      case 'y':
        boxGeometry = new Three.BoxGeometry(this.width - 2 * groutSize, thick, this.height - 2 * groutSize);
        break;
      case 'z':
        boxGeometry = new Three.BoxGeometry(this.width - 2 * groutSize, this.height - 2 * groutSize, thick);
        break;
    }

    if (typeof this.texture === 'number') {
      this.material = new Three.MeshBasicMaterial( {color: this.texture} );
    } else {
      this.material = new Three.MeshBasicMaterial( {map: this.texture, transparent: false, opacity: 1} );
    }

    const tile = new Three.Mesh(boxGeometry, this.material);
    tile.position.set(this.position.x, this.position.y, this.position.z);

    return tile;
  }
}

export default Tile;
