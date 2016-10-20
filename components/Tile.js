import Object3D from './Object3D';
import * as Three from 'three';

class Tile extends Object3D {
  constructor(width, height, plan, ratio, texture) {
    super(width, height, plan, ratio);
    this.texture = texture;
  }

  mount() {
    let boxGeometry = null;
    switch (this.plan) {
      case 'x':
        boxGeometry = new Three.BoxGeometry(1/10, this.height, this.width);
        break;
      case 'y':
        boxGeometry = new Three.BoxGeometry(this.width, 1/10, this.height);
        break;
      case 'z':
        boxGeometry = new Three.BoxGeometry(this.width, this.height, 1/10);
        break;
    }

    let material = null;
    if (typeof this.texture === 'number') {
      material = new Three.MeshBasicMaterial( {color: this.texture} );
    } else {
      material = new Three.MeshBasicMaterial( {map: this.texture, transparent: false, opacity: 1} );
    }

    const tile = new Three.Mesh(boxGeometry, material);
    tile.position.set(this.position.x, this.position.y, this.position.z);

    return tile;
  }
}

export default Tile;
