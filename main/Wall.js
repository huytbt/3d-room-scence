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

  _createClass(Wall, null, [{
    key: 'LAYOUT_GRID',
    get: function get() {
      return 0;
    }
  }, {
    key: 'LAYOUT_BRICK_HORIZONTAL',
    get: function get() {
      return 1;
    }
  }, {
    key: 'LAYOUT_BRICK_VERTICAL',
    get: function get() {
      return 2;
    }
  }, {
    key: 'LAYOUT_CHECKERBOARD',
    get: function get() {
      return 3;
    }
  }, {
    key: 'LAYOUT_FREESTYLE',
    get: function get() {
      return 4;
    }
  }]);

  function Wall(position, plan, direction, width, height, ratio, tileRatio, tiles, options) {
    _classCallCheck(this, Wall);

    var _this = _possibleConstructorReturn(this, (Wall.__proto__ || Object.getPrototypeOf(Wall)).call(this, width, height, plan, ratio));

    _this.position = position;
    _this.direction = direction;
    _this.tileRatio = tileRatio;
    _this.tiles = tiles || [];
    _this.options = Object.assign({
      selectedTile: null,
      freeStyleTile: null,
      checkerboardSelectedTile: null,
      defaultColor: 0xffffff,
      layout: 0,
      type: 'wall',
      grout: {}
    }, options);
    _this.grout = _this.options.grout;

    _this.supportLayouts = [Wall.LAYOUT_GRID, // grid (default)
    Wall.LAYOUT_BRICK_HORIZONTAL, // brick by row
    Wall.LAYOUT_BRICK_VERTICAL, // brick by column
    Wall.LAYOUT_CHECKERBOARD, // checkerboard
    Wall.LAYOUT_FREESTYLE // freestyle
    ];

    _this.position.x *= _this.ratio;
    _this.position.y *= _this.ratio;
    _this.position.z *= _this.ratio;

    _this.mountedTiles = [];
    _this.mountedFreeTiles = [];
    _this.freeTileLevel = 10;
    return _this;
  }

  _createClass(Wall, [{
    key: 'mount',
    value: function mount() {
      var _this2 = this;

      var mountedTiles = [];

      // add background
      var tileBackground = new _Tile2.default(this.width / this.ratio, this.height / this.ratio, this.plan, this.ratio, this.options.defaultColor, {});
      tileBackground.position = this.position;
      var moutedTileBackground = tileBackground.mount();
      mountedTiles.push(moutedTileBackground);
      moutedTileBackground.objectType = 'Background';
      tileBackground.clippingByWall(this);

      this.mountedFreeTiles.map(function (tile) {
        mountedTiles.push(tile);
        if (_this2.options.grout.size) {
          var mountedGrouts = _this2.pushGrouts(mountedTiles, tile.originObject);
          mountedGrouts.map(function (grout) {
            grout.maskIndex = tile.maskIndex;
          });
        }
      });

      if (this.options.selectedTile !== null && this.options.layout !== Wall.LAYOUT_FREESTYLE) {
        var tile = this.selectedTile;
        switch (this.plan) {
          case 'x':
            this.pushTile(mountedTiles, tile, 'z', 'y');
            break;
          case 'y':
            this.pushTile(mountedTiles, tile, 'x', 'z');
            break;
          case 'z':
            this.pushTile(mountedTiles, tile, 'x', 'y');
            break;
        }
      }

      mountedTiles.map(function (tile) {
        _this2.mountedTiles.push(tile);
      });

      return mountedTiles;
    }
  }, {
    key: 'mountFreeTile',
    value: function mountFreeTile(fromTile) {
      var _this3 = this;

      var mountedTiles = [];

      var tile = new Three.Mesh(fromTile.geometry.clone(), fromTile.material.clone());
      tile.material.color.setHex(fromTile.currentHex);
      tile.material.transparent = false;
      tile.material.depthTest = false;
      tile.material.opacity = 1;
      tile.position.set(fromTile.position.x, fromTile.position.y, fromTile.position.z);
      tile.originObject = Object.assign({}, fromTile.originObject);
      tile.originObject.position = tile.position;
      tile.renderOrder = this.freeTileLevel;
      tile.objectType = 'Tile';
      mountedTiles.push(tile);

      this.mountedFreeTiles.push(tile);

      if (this.options.grout.size) {
        this.pushGrouts(mountedTiles, tile.originObject);
      }

      mountedTiles.map(function (tile) {
        _this3.mountedTiles.push(tile);
      });

      return mountedTiles;
    }
  }, {
    key: 'mountMask',
    value: function mountMask() {
      var mountedTiles = [];
      var tile = this.freeStyleTile;

      switch (this.plan) {
        case 'x':
          this.pushTile(mountedTiles, tile, 'z', 'y', this.freeTileLevel, true);
          break;
        case 'y':
          this.pushTile(mountedTiles, tile, 'x', 'z', this.freeTileLevel, true);
          break;
        case 'z':
          this.pushTile(mountedTiles, tile, 'x', 'y', this.freeTileLevel, true);
          break;
      }

      return mountedTiles;
    }
  }, {
    key: 'removeDuplicatedFreeTiles',
    value: function removeDuplicatedFreeTiles(tile) {
      var _this4 = this;

      this.mountedTiles.map(function (elm, index) {
        if (tile === elm) {
          _this4.mountedTiles.splice(index, 1);
        }
      });
      this.mountedFreeTiles.map(function (elm, index) {
        if (tile === elm) {
          _this4.mountedFreeTiles.splice(index, 1);
        }
      });
    }
  }, {
    key: 'pushTile',
    value: function pushTile(tiles, tile, x, y, order, isMask) {
      var _this5 = this;

      var startPoint = this.points[0];
      var cell = { x: 0, y: 0 };
      this.pushTileVertical(tile, startPoint, y, function () {
        _this5.pushTileHorizontal(tile, startPoint, x, function () {
          tile.position = Object.assign({}, startPoint);

          // add tiles by layout: brick horizontal
          if (_this5.options.layout === Wall.LAYOUT_BRICK_HORIZONTAL && cell.y % 2 === 0) {
            tile.position[x] = tile.position[x] + tile.width / 2 * (_this5.direction.x === 'lr' ? -1 : 1);
          }
          // add tiles by layout: brick vertical
          else if (_this5.options.layout === Wall.LAYOUT_BRICK_VERTICAL && cell.x % 2 === 0) {
              tile.position[y] = tile.position[y] + tile.height / 2 * (_this5.direction.x === 'bt' ? -1 : 1);
            }
            // add tiles by layout: checkerboard
            else if (_this5.options.layout === Wall.LAYOUT_CHECKERBOARD) {
                if ((cell.x + cell.y) % 2 === 0) {
                  tile = _this5.checkerboardSelectedTile;
                } else {
                  tile = _this5.selectedTile;
                }
                tile.position = Object.assign({}, startPoint);
              }

          if (order) {
            tile.renderOrder = order;
          } else {
            tile.renderOrder = 1;
          }

          tiles.push(tile.mount());

          tile.clippingByWall(_this5);

          if (_this5.options.grout.size && !isMask) {
            _this5.pushGrouts(tiles, tile);
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
      var mountedGrouts = [];
      var grout = new _Grout2.default(tile.width / tile.ratio, tile.height / tile.ratio, this.plan, tile.ratio, this.options.grout.size, this.options.grout.color);
      grout.position = Object.assign({}, tile.position);
      var mount = null;

      mount = grout.mount('top');
      mount.renderOrder = tile.renderOrder + 1;
      tiles.push(mount);
      mountedGrouts.push(mount);
      grout.clippingByWall(this);

      mount = grout.mount('bottom');
      mount.renderOrder = tile.renderOrder + 1;
      tiles.push(mount);
      mountedGrouts.push(mount);
      grout.clippingByWall(this);

      mount = grout.mount('left');
      mount.renderOrder = tile.renderOrder + 1;
      tiles.push(mount);
      mountedGrouts.push(mount);
      grout.clippingByWall(this);

      mount = grout.mount('right');
      mount.renderOrder = tile.renderOrder + 1;
      tiles.push(mount);
      mountedGrouts.push(mount);
      grout.clippingByWall(this);

      return mountedGrouts;
    }
  }, {
    key: 'pushTileHorizontal',
    value: function pushTileHorizontal(tile, startPoint, x, execute) {
      var tileWidth = tile.width;

      switch (this.direction.x) {
        case 'lr':
          // left to right
          startPoint[x] = this.points[0][x] - (-tileWidth + this.width) / 2;
          startPoint[x] -= tileWidth; // render more 1 tile
          while (startPoint[x] < this.points[2][x] - (-tileWidth + this.width) / 2 + 2 * tileWidth) {
            execute();
            startPoint[x] += tileWidth;
          }
          break;

        case 'rl':
          // right to left
          startPoint[x] = this.points[2][x] - (tileWidth + this.width) / 2;
          startPoint[x] += tileWidth; // render more 1 tile
          while (startPoint[x] > this.points[0][x] - (tileWidth + this.width) / 2 - 2 * tileWidth) {
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

      switch (this.direction.y) {
        case 'tb':
          // top to bottom
          startPoint[y] = this.points[2][y] - (tileHeight + this.height) / 2;
          startPoint[y] += tileHeight; // render more 1 tile
          while (startPoint[y] > this.points[0][y] - (tileHeight + this.height) / 2 - 2 * tileHeight) {
            execute();
            startPoint[y] -= tileHeight;
          }
          break;

        case 'bt':
          // bottom to top
          startPoint[y] = this.points[0][y] - (-tileHeight + this.height) / 2;
          startPoint[y] -= tileHeight; // render more 1 tile
          while (startPoint[y] < this.points[2][y] - (-tileHeight + this.height) / 2 + 2 * tileHeight) {
            execute();
            startPoint[y] += tileHeight;
          }
          break;
      }
    }
  }, {
    key: 'selectedTile',
    get: function get() {
      var tile = this.tiles[this.options.selectedTile];
      tile.plan = this.plan;

      return tile;
    }
  }, {
    key: 'freeStyleTile',
    get: function get() {
      if (this.options.freeStyleTile === null) {
        this.options.freeStyleTile = 0;
      }

      var tile = this.tiles[this.options.freeStyleTile];
      tile.plan = this.plan;

      return tile;
    }
  }, {
    key: 'checkerboardSelectedTile',
    get: function get() {
      if (this.options.checkerboardSelectedTile === null) {
        return this.selectedTile;
      }

      var tile = this.tiles[this.options.checkerboardSelectedTile];
      tile.plan = this.plan;

      return tile;
    }
  }, {
    key: 'grout',
    set: function set(groutOptions) {
      this.options.grout = Object.assign({
        size: 0,
        color: 0xffffff
      }, groutOptions);
      this.options.grout.size *= 1 / 500;
    }
  }]);

  return Wall;
}(_Object3D3.default);

exports.default = Wall;