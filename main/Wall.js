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

var Wall = function (_Object3D) {
  _inherits(Wall, _Object3D);

  function Wall(position, plan, direction, width, height, ratio, tileRatio, tiles, options) {
    _classCallCheck(this, Wall);

    var _this = _possibleConstructorReturn(this, (Wall.__proto__ || Object.getPrototypeOf(Wall)).call(this, width, height, plan, ratio));

    _this.position = position;
    _this.direction = direction;
    _this.tileRatio = tileRatio;
    _this.tiles = tiles || [];
    _this.options = options || {
      selectedTile: null
    };

    _this.position.x *= _this.ratio;
    _this.position.y *= _this.ratio;
    _this.position.z *= _this.ratio;

    _this.mountedTiles = [];
    return _this;
  }

  _createClass(Wall, [{
    key: 'mount',
    value: function mount() {
      if (this.options.selectedTile === null) {
        return [];
      }

      var tile = this.tiles[this.options.selectedTile];
      tile.plan = this.plan;

      switch (this.plan) {
        case 'x':
          this.pushTile(this.mountedTiles, tile, 'z', 'y');
          break;
        case 'y':
          this.pushTile(this.mountedTiles, tile, 'x', 'z');
          break;
        case 'z':
          this.pushTile(this.mountedTiles, tile, 'x', 'y');
          break;
      }

      return this.mountedTiles;
    }
  }, {
    key: 'pushTile',
    value: function pushTile(tiles, tile, x, y) {
      var _this2 = this;

      var startPoint = this.points[0];

      this.pushTileVertical(tile, startPoint, y, function () {
        _this2.pushTileHorizontal(tile, startPoint, x, function () {
          tile.position = startPoint;
          tiles.push(tile.mount(_this2.options));
        });
      });
    }
  }, {
    key: 'pushTileHorizontal',
    value: function pushTileHorizontal(tile, startPoint, x, execute) {
      switch (this.direction.x) {
        case 'lr':
          // left to right
          startPoint[x] = this.points[0][x] - (-tile.width + this.width) / 2;
          startPoint[x] -= tile.width; // render more 1 tile
          while (startPoint[x] < this.points[2][x] - (-tile.width + this.width) / 2 + tile.width) {
            execute();
            startPoint[x] += tile.width;
          }
          break;

        case 'rl':
          // right to left
          startPoint[x] = this.points[2][x] - (tile.width + this.width) / 2;
          startPoint[x] += tile.width; // render more 1 tile
          while (startPoint[x] > this.points[0][x] - (tile.width + this.width) / 2 - tile.width) {
            execute();
            startPoint[x] -= tile.width;
          }
          break;
      }
    }
  }, {
    key: 'pushTileVertical',
    value: function pushTileVertical(tile, startPoint, y, execute) {
      switch (this.direction.y) {
        case 'tb':
          // top to bottom
          startPoint[y] = this.points[2][y] - (tile.height + this.height) / 2;
          startPoint[y] += tile.height; // render more 1 tile
          while (startPoint[y] > this.points[0][y] - (tile.height + this.height) / 2 - tile.height) {
            execute();
            startPoint[y] -= tile.height;
          }
          break;

        case 'bt':
          // bottom to top
          startPoint[y] = this.points[0][y] - (-tile.height + this.height) / 2;
          startPoint[y] -= tile.height; // render more 1 tile
          while (startPoint[y] < this.points[2][y] - (-tile.height + this.height) / 2 + tile.height) {
            execute();
            startPoint[y] += tile.height;
          }
          break;
      }
    }
  }]);

  return Wall;
}(_Object3D3.default);

exports.default = Wall;