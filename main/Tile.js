'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Object3D2 = require('./Object3D');

var _Object3D3 = _interopRequireDefault(_Object3D2);

var _phoria = require('phoria.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Tile = function (_Object3D) {
  _inherits(Tile, _Object3D);

  function Tile(width, height, ratio, texture) {
    _classCallCheck(this, Tile);

    var _this = _possibleConstructorReturn(this, (Tile.__proto__ || Object.getPrototypeOf(Tile)).call(this, width, height, ratio));

    _this.texture = texture;
    return _this;
  }

  _createClass(Tile, [{
    key: 'mount',
    value: function mount(options) {
      var vertices = [1, 2, 3, 0];
      if (this.plan === 'y') {
        vertices = [3, 0, 1, 2];
      }
      if (options.flipTile) {
        this.swap(vertices, 0, 1);
        this.swap(vertices, 2, 3);
      }
      var tile = _phoria.Phoria.Entity.create({
        points: this.points,
        polygons: [{ vertices: vertices }],
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
  }, {
    key: 'swap',
    value: function swap(object, a, b) {
      var x = object[a];
      object[a] = object[b];
      object[b] = x;
    }
  }]);

  return Tile;
}(_Object3D3.default);

exports.default = Tile;