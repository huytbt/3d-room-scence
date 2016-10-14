export default class Object3D {
  constructor(width, height, ratio) {
    this.width = width;
    this.height = height;
    this.ratio = ratio;

    this.width *= this.ratio;
    this.height *= this.ratio;
  }

  get points() {
    let points = [];

    switch (this.plan) {
      case 'x':
        points = [
          {z: 0*this.width + this.position.z, y: 0*this.height + this.position.y, x: this.position.x}, // bottom - left
          {z: 0*this.width + this.position.z, y: 1*this.height + this.position.y, x: this.position.x}, // top - left
          {z: 1*this.width + this.position.z, y: 1*this.height + this.position.y, x: this.position.x}, // top - right
          {z: 1*this.width + this.position.z, y: 0*this.height + this.position.y, x: this.position.x}  // bottom - right
        ];
        break;
      case 'y':
        points = [

          // {x: 0*this.width + this.position.x, z: 1*(0*this.height + this.position.z), y: this.position.y}, // bottom - left
          // {x: 0*this.width + this.position.x, z: 1*(1*this.height + this.position.z), y: this.position.y}, // top - left
          // {x: 1*this.width + this.position.x, z: 1*(1*this.height + this.position.z), y: this.position.y}, // top - right
          // {x: 1*this.width + this.position.x, z: 1*(0*this.height + this.position.z), y: this.position.y}  // bottom - right

          {x: 0*this.width + this.position.x, z: -1*(0*this.height - this.position.z), y: this.position.y}, // bottom - left
          {x: 0*this.width + this.position.x, z: -1*(1*this.height - this.position.z), y: this.position.y}, // top - left
          {x: 1*this.width + this.position.x, z: -1*(1*this.height - this.position.z), y: this.position.y}, // top - right
          {x: 1*this.width + this.position.x, z: -1*(0*this.height - this.position.z), y: this.position.y}  // bottom - right
        ];
        break;
      case 'z':
        points = [
          {x: 0*this.width + this.position.x, y: 0*this.height + this.position.y, z: this.position.z}, // bottom - left
          {x: 0*this.width + this.position.x, y: 1*this.height + this.position.y, z: this.position.z}, // top - left
          {x: 1*this.width + this.position.x, y: 1*this.height + this.position.y, z: this.position.z}, // top - right
          {x: 1*this.width + this.position.x, y: 0*this.height + this.position.y, z: this.position.z}  // bottom - right
        ];
        break;
    }

    return points;
  }
}
