'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Grout = require('./Grout');

var _Grout2 = _interopRequireDefault(_Grout);

var _Object3D2 = require('./Object3D');

var _Object3D3 = _interopRequireDefault(_Object3D2);

var _Tile = require('./Tile');

var _Tile2 = _interopRequireDefault(_Tile);

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
    _this.options = Object.assign({
      selectedTile: null,
      defaultColor: 0xffffff,
      layout: 0,
      grout: {}
    }, options);
    _this.grout = _this.options.grout;

    _this.supportLayouts = [0, 1, 2];

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
        var _tile = new _Tile2.default(this.width / this.ratio, this.height / this.ratio, this.plan, this.ratio, this.options.defaultColor);
        _tile.position = this.position;
        this.mountedTiles.push(_tile.mount());
        _tile.clippingByWall(this);
        return this.mountedTiles;
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
      var cell = { x: 0, y: 0 };
      this.pushTileVertical(tile, startPoint, y, function () {
        _this2.pushTileHorizontal(tile, startPoint, x, function () {
          tile.position = Object.assign({}, startPoint);

          // add tiles by layout: brick horizontal
          if (_this2.options.layout === 1 && cell.y % 2 === 0) {
            tile.position[x] = tile.position[x] + tile.width / 2 * (_this2.direction.x === 'lr' ? -1 : 1);
          }
          // add tiles by layout: brick vertical
          else if (_this2.options.layout === 2 && cell.x % 2 === 0) {
              tile.position[y] = tile.position[y] + tile.height / 2 * (_this2.direction.x === 'bt' ? -1 : 1);
            }

          tiles.push(tile.mount());

          tile.clippingByWall(_this2);

          if (_this2.options.grout.size) {
            _this2.pushGrouts(tiles, tile);
          }

          cell.x++;
        });
        cell.y++;
        cell.x = 0;
      });
    }
  }, {
    key: 'pushGrouts',
    value: function pushGrouts(tiles, tile) {
      var grout = new _Grout2.default(tile.width / tile.ratio, tile.height / tile.ratio, this.plan, tile.ratio, this.options.grout.size, this.options.grout.color);
      grout.position = Object.assign({}, tile.position);
      tiles.push(grout.mount('top'));
      grout.clippingByWall(this);
      tiles.push(grout.mount('bottom'));
      grout.clippingByWall(this);
      tiles.push(grout.mount('left'));
      grout.clippingByWall(this);
      tiles.push(grout.mount('right'));
      grout.clippingByWall(this);
    }
  }, {
    key: 'pushTileHorizontal',
    value: function pushTileHorizontal(tile, startPoint, x, execute) {
      var tileWidth = tile.width;
      if (this.options.grout.size) {
        tileWidth += this.options.grout.size * 2;
      }

      switch (this.direction.x) {
        case 'lr':
          // left to right
          startPoint[x] = this.points[0][x] - (-tileWidth + this.width) / 2;
          startPoint[x] -= tileWidth; // render more 1 tile
          while (startPoint[x] < this.points[2][x] - (-tileWidth + this.width) / 2 + tileWidth) {
            execute();
            startPoint[x] += tileWidth;
          }
          break;

        case 'rl':
          // right to left
          startPoint[x] = this.points[2][x] - (tileWidth + this.width) / 2;
          startPoint[x] += tileWidth; // render more 1 tile
          while (startPoint[x] > this.points[0][x] - (tileWidth + this.width) / 2 - tileWidth) {
            execute();
            startPoint[x] -= tileWidth;
          }
          break;
      }
    }
  }, {
    key: 'pushTileVertical',
    value: function pushTileVertical(tile, startPoint, y, execute) {
      var tileHeight = tile.height;
      if (this.options.grout.size) {
        tileHeight += this.options.grout.size * 2;
      }

      switch (this.direction.y) {
        case 'tb':
          // top to bottom
          startPoint[y] = this.points[2][y] - (tileHeight + this.height) / 2;
          startPoint[y] += tileHeight; // render more 1 tile
          while (startPoint[y] > this.points[0][y] - (tileHeight + this.height) / 2 - tileHeight) {
            execute();
            startPoint[y] -= tileHeight;
          }
          break;

        case 'bt':
          // bottom to top
          startPoint[y] = this.points[0][y] - (-tileHeight + this.height) / 2;
          startPoint[y] -= tileHeight; // render more 1 tile
          while (startPoint[y] < this.points[2][y] - (-tileHeight + this.height) / 2 + tileHeight) {
            execute();
            startPoint[y] += tileHeight;
          }
          break;
      }
    }
  }, {
    key: 'grout',
    set: function set(groutOptions) {
      this.options.grout = Object.assign({
        size: 0,
        color: 0xffffff
      }, groutOptions);
      this.options.grout.size *= this.tileRatio;
    }
  }]);

  return Wall;
}(_Object3D3.default);

exports.default = Wall;