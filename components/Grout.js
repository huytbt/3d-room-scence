import Object3D from './Object3D';
import * as Three from 'three';

class Grout extends Object3D {
  constructor(width, height, plan, ratio, size, texture) {
    super(width, height, plan, ratio);
    this.texture = texture;
    this.size = size;
  }

  mount(location) {
    const thick = 0;
    const resetPosition = Object.assign({}, this.position);
    let d = 1;
    if (location === 'bottom' || location === 'left') {
      d = -1;
    }

    let boxGeometry = null;
    if (location === 'top' || location === 'bottom') {
      switch (this.plan) {
        case 'x':
          boxGeometry = new Three.BoxGeometry(thick, this.size, this.width);
          this.position.y += d * (this.height / 2 - this.size / 2);
          break;
        case 'y':
          boxGeometry = new Three.BoxGeometry(this.width, thick, this.size);
          this.position.z += d * (this.height / 2 - this.size / 2);
          break;
        case 'z':
          boxGeometry = new Three.BoxGeometry(this.width, this.size, thick);
          this.position.y += d * (this.height / 2 - this.size / 2);
          break;
      }
    } else if (location === 'left' || location === 'right') {
      switch (this.plan) {
        case 'x':
          boxGeometry = new Three.BoxGeometry(thick, this.height, this.size);
          this.position.z -= d * (this.width / 2 - this.size / 2);
          break;
        case 'y':
          boxGeometry = new Three.BoxGeometry(this.size, thick, this.height);
          this.position.x -= d * (this.width / 2 - this.size / 2);
          break;
        case 'z':
          boxGeometry = new Three.BoxGeometry(this.size, this.height, thick);
          this.position.x -= d * (this.width / 2 - this.size / 2);
          break;
      }
    }

    this.material = new Three.MeshBasicMaterial( {color: this.texture, transparent: true, opacity: 0.75} );
    const grout = new Three.Mesh(boxGeometry, this.material);
    grout.position.set(this.position.x, this.position.y, this.position.z);

    this.position = resetPosition;

    return grout;
  }
}

export default Grout;
