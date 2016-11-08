'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Object3D2 = require('./Object3D');

var _Object3D3 = _interopRequireDefault(_Object3D2);

var _three = require('three');

var Three = _interopRequireWildcard(_three);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Grout = function (_Object3D) {
  _inherits(Grout, _Object3D);

  function Grout(width, height, plan, ratio, size, texture) {
    _classCallCheck(this, Grout);

    var _this = _possibleConstructorReturn(this, (Grout.__proto__ || Object.getPrototypeOf(Grout)).call(this, width, height, plan, ratio));

    _this.texture = texture;
    _this.size = size;
    return _this;
  }

  _createClass(Grout, [{
    key: 'mount',
    value: function mount(location) {
      var thick = 0.01;
      var resetPosition = Object.assign({}, this.position);
      var d = 1;
      if (location === 'bottom' || location === 'left') {
        d = -1;
      }

      var boxGeometry = null;
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

      this.material = new Three.MeshBasicMaterial({ color: this.texture, transparent: true, opacity: 0.4 });
      var grout = new Three.Mesh(boxGeometry, this.material);
      grout.position.set(this.position.x, this.position.y, this.position.z);

      this.position = resetPosition;

      return grout;
    }
  }]);

  return Grout;
}(_Object3D3.default);

exports.default = Grout;