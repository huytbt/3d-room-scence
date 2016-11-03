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

var Tile = function (_Object3D) {
  _inherits(Tile, _Object3D);

  function Tile(width, height, plan, ratio, texture) {
    _classCallCheck(this, Tile);

    var _this = _possibleConstructorReturn(this, (Tile.__proto__ || Object.getPrototypeOf(Tile)).call(this, width, height, plan, ratio));

    _this.texture = texture;
    return _this;
  }

  _createClass(Tile, [{
    key: 'mount',
    value: function mount(groutSize) {
      var thick = 0;
      var boxGeometry = null;
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
        this.material = new Three.MeshBasicMaterial({ color: this.texture });
      } else {
        this.material = new Three.MeshBasicMaterial({ map: this.texture, transparent: false, opacity: 1 });
      }

      var tile = new Three.Mesh(boxGeometry, this.material);
      tile.position.set(this.position.x, this.position.y, this.position.z);

      return tile;
    }
  }]);

  return Tile;
}(_Object3D3.default);

exports.default = Tile;