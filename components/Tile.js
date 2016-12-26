import Object3D from './Object3D';
import * as Three from 'three';

class Tile extends Object3D {
  constructor(width, height, plan, ratio, texture, meta) {
    super(width, height, plan, ratio);
    this.texture = texture;
    this.meta = meta;
  }

  mount(thick) {
    thick = thick || 0;
    let boxGeometry = null;
    switch (this.plan) {
      case 'x':
        boxGeometry = new Three.BoxGeometry(thick, this.height, this.width);
        break;
      case 'y':
        boxGeometry = new Three.BoxGeometry(this.width, thick, this.height);
        break;
      case 'z':
        boxGeometry = new Three.BoxGeometry(this.width, this.height, thick);
        break;
    }

    if (typeof this.texture === 'number') {
      this.material = new Three.MeshBasicMaterial( {color: this.texture} );
    } else {
      this.material = new Three.MeshBasicMaterial( {map: this.texture, transparent: false, opacity: 1} );
    }

    const tile = new Three.Mesh(boxGeometry, this.material);
    tile.position.set(this.position.x, this.position.y, this.position.z);
    tile.objectType = 'Tile';
    tile.originObject = this;
    tile.renderOrder = 1;
    this.material.depthTest = false;

    return tile;
  }
}

export default Tile;
