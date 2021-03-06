'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Tile = require('./Tile');

var _Tile2 = _interopRequireDefault(_Tile);

var _three = require('three');

var Three = _interopRequireWildcard(_three);

var _Wall = require('./Wall');

var _Wall2 = _interopRequireDefault(_Wall);

var _async = require('async');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RoomScene = function (_Component) {
  _inherits(RoomScene, _Component);

  function RoomScene(props) {
    _classCallCheck(this, RoomScene);

    var _this = _possibleConstructorReturn(this, (RoomScene.__proto__ || Object.getPrototypeOf(RoomScene)).call(this, props));

    _this._size = props.size;
    _this.renderer = null;
    _this.scene = null;
    _this.room = null;
    _this.freeRoom = null;
    _this.maskTiles = [];
    _this.walls = [];
    _this.layerImages = [];
    _this.mouseState = null;
    _this.handlerMouseMove = _this.onWindowMouseMove.bind(_this);
    _this.handlerMouseUp = _this.onWindowMouseUp.bind(_this);
    _this.handlerMouseDown = _this.onWindowMouseDown.bind(_this);
    return _this;
  }

  _createClass(RoomScene, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      this.initScene();
      this.loadWalls();
      this.loadAllTextures(function (textures) {
        (0, _async.parallel)([function (callback) {
          _this2.loadTilesTextures(textures, callback);
        }, function (callback) {
          _this2.loadLayerImages(textures, callback);
        }], function () {
          _this2.layerImages.map(function (layer) {
            _this2.renderImage(layer);
          });

          _this2.renderScene();
        });
      });
    }
  }, {
    key: 'initScene',
    value: function initScene() {
      this.room = new Three.Object3D();
      this.freeRoom = new Three.Object3D();
      if (this.props.debug) {
        this.room.add(new Three.GridHelper(100, 50));
      }

      this.scene = new Three.Scene();
      this.scene.add(this.room);
      this.scene.add(this.freeRoom);

      this.camera = new Three.PerspectiveCamera(this.props.perspective.fov, this.width / this.height, 1, 100000);
      this.camera.position.set(this.props.camera.position.x, this.props.camera.position.y, this.props.camera.position.z);
      this.camera.setViewOffset(this.width, this.height, this.props.perspective.viewOffset.x, this.props.perspective.viewOffset.y, this.width, this.height);
      if (this.props.camera.target) {
        this.camera.lookAt(new Three.Vector3(this.props.camera.target.x, this.props.camera.target.y, this.props.camera.target.z));
      }

      this.renderer = new Three.WebGLRenderer({
        preserveDrawingBuffer: true
      });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(this.width, this.height);
      this.renderer.setClearColor(0xffffff, 1);
      this.renderer.localClippingEnabled = true;

      this.refs.threeContainer.appendChild(this.renderer.domElement);
    }
  }, {
    key: 'loadWalls',
    value: function loadWalls() {
      var _this3 = this;

      this.props.walls.map(function (element) {
        var wall = new _Wall2.default(element.position, element.plan, element.direction, element.width, element.height, element.ratio, element.tileRatio, element.tiles, element.options);
        _this3.walls.push(wall);
      });
    }
  }, {
    key: 'loadAllTextures',
    value: function loadAllTextures(callback) {
      var _this4 = this;

      var textures = [];
      var images = [];
      (0, _async.parallel)([function (callback) {
        (0, _async.each)(_this4.walls, function (wall, callback) {
          (0, _async.each)(wall.tiles, function (tile, callback) {
            if (images.indexOf(tile.image) < 0) {
              images.push(tile.image);
            }
            callback();
          }, callback);
        }, callback);
      }, function (callback) {
        (0, _async.each)(_this4.props.layerImages, function (element, callback) {
          if (images.indexOf(element.image) < 0) {
            images.push(element.image);
          }
          callback();
        }, callback);
      }], function () {
        var progress = 0;
        _this4.props.onLoadingTextures && _this4.props.onLoadingTextures(images.length, progress, progress / images.length * 100);
        (0, _async.each)(images, function (image, callback) {
          new Three.TextureLoader().load(image, function (texture) {
            progress++;
            _this4.props.onLoadingTextures && _this4.props.onLoadingTextures(images.length, progress, progress / images.length * 100);
            texture.minFilter = texture.magFilter = Three.LinearFilter;
            texture.mapping = Three.UVMapping;
            textures.push({
              image: image,
              texture: texture
            });
            callback();
          });
        }, function () {
          callback && callback(textures);
        });
      });
    }
  }, {
    key: 'loadTilesTextures',
    value: function loadTilesTextures(textures, callback) {
      (0, _async.each)(this.walls, function (wall, callback) {
        var tiles = [];
        (0, _async.forEachOf)(wall.tiles, function (info, index, callback) {
          var texture = textures.find(function (x) {
            return x.image === info.image;
          }).texture;

          var tile = new _Tile2.default(info.width, info.height, wall.plan, wall.tileRatio, texture, info);
          tiles[index] = tile;
          callback();
        }, function () {
          wall.tiles = tiles;
          callback();
        });
      }, callback);
    }
  }, {
    key: 'loadLayerImages',
    value: function loadLayerImages(textures, callback) {
      var _this5 = this;

      (0, _async.forEachOf)(this.props.layerImages, function (element, index, callback) {
        var texture = textures.find(function (x) {
          return x.image === element.image;
        }).texture;
        _this5.layerImages[index] = {
          texture: texture,
          meta: element
        };
        callback();
      }, callback);
    }
  }, {
    key: 'renderScene',
    value: function renderScene() {
      var _this6 = this;

      this.walls.map(function (wall) {
        _this6.renderWall(wall, _this6.room);
      });

      this.renderer.render(this.scene, this.camera);
    }
  }, {
    key: 'renderWall',
    value: function renderWall(wall, toContainer, callback) {
      var mountedTiles = wall.mount();
      mountedTiles.map(function (tile) {
        toContainer.add(tile);
      });
      callback && callback(mountedTiles);
    }
  }, {
    key: 'renderWallMask',
    value: function renderWallMask(wall, toContainer, callback) {
      var mountedTiles = wall.mountMask();
      mountedTiles.map(function (tile) {
        toContainer.add(tile);
      });
      callback && callback(mountedTiles);
    }
  }, {
    key: 'renderImage',
    value: function renderImage(layer) {
      var meta = layer.meta;
      var texture = layer.texture;
      var transparent = false;
      if (meta.opacity >= 0) {
        transparent = true;
      }

      var image = new Three.Mesh(new Three.BoxGeometry(meta.width * meta.ratio, meta.height * meta.ratio, 0), new Three.MeshBasicMaterial({ map: texture, transparent: transparent, opacity: meta.opacity }));

      if (meta.rotation) {
        image.rotation.set(meta.rotation.x, meta.rotation.y, meta.rotation.z);
      }

      image.position.set(meta.position.x * meta.ratio, meta.position.y * meta.ratio, meta.position.z * meta.ratio);
      this.scene.add(image);
    }
  }, {
    key: 'reset',
    value: function reset(callback) {
      var _this7 = this;

      (0, _async.forEachOf)(this.walls, function (wall, wallIndex, callback) {
        (0, _async.parallel)([function (callback) {
          _this7.changeWallTile(wallIndex, null, callback);
        }, function (callback) {
          _this7.changeWallLayout(wallIndex, 0, callback);
        }, function (callback) {
          _this7.setWallGrout(wallIndex, 0, 0xffffff, callback);
        }], callback);
      }, callback);
    }
  }, {
    key: 'changeWallTile',
    value: function changeWallTile(wallIndex, tileIndex, callback) {
      var _this8 = this;

      var wall = this.walls[wallIndex];

      if (wall === undefined) {
        return callback(new Error('Invalid wall index.'));
      }
      if (tileIndex !== null && wall.tiles[tileIndex] === undefined) {
        return callback(new Error('Invalid tile index.'));
      }

      if (wall.options.layout === _Wall2.default.LAYOUT_FREESTYLE) {
        return this.changeFreeStyleTile(wallIndex, tileIndex, callback);
      }

      this.resetFreeRoom();

      if (wall.options.layout === _Wall2.default.LAYOUT_CHECKERBOARD) {
        var isDifferenceTileSize = wall.options.selectedTile !== null && tileIndex !== null && (wall.tiles[tileIndex].width !== wall.tiles[wall.options.selectedTile].width || wall.tiles[tileIndex].height !== wall.tiles[wall.options.selectedTile].height);
        if (isDifferenceTileSize) {
          return callback(new Error('Just select tile same size with current tile in checkerboard layout.'));
        }
        wall.options.checkerboardSelectedTile = wall.options.selectedTile;
        if (tileIndex === null) {
          wall.options.checkerboardSelectedTile = null;
        }
      }

      wall.mountedTiles.map(function (tile) {
        _this8.room.remove(tile);
      });
      wall.mountedTiles = [];

      wall.options.selectedTile = tileIndex;

      wall.mount();
      wall.mountedTiles.map(function (tile) {
        _this8.room.add(tile);
      });

      this.refresh();

      callback && callback();
    }
  }, {
    key: 'changeWallLayout',
    value: function changeWallLayout(wallIndex, layout, callback, startKeepTiles, doneKeepTiles) {
      var _this9 = this;

      var wall = this.walls[wallIndex];

      if (wall === undefined) {
        return callback(new Error('Invalid wall index.'));
      }
      if (wall.supportLayouts.indexOf(layout) < 0) {
        return callback(new Error('Invalid layout.'));
      }

      // no change
      if (layout === wall.options.layout) {
        callback && callback();
        return;
      }

      var currentTiles = [];

      wall.mountedTiles.map(function (tile) {
        if (tile.objectType === 'Tile') {
          currentTiles.push(tile);
        }
        _this9.room.remove(tile);
      });
      wall.mountedTiles = [];

      wall.options.layout = layout;

      if (wall.options.layout !== _Wall2.default.LAYOUT_CHECKERBOARD) {
        wall.options.checkerboardSelectedTile = null;
      }

      if (wall.options.layout === _Wall2.default.LAYOUT_FREESTYLE) {
        this.changeFreeStyleTile(wallIndex, wall.options.selectedTile);
        this.initFreeRoom(wall, wallIndex);

        this.renderer.domElement.addEventListener("mousemove", this.handlerMouseMove, true);
        this.renderer.domElement.addEventListener("mouseup", this.handlerMouseUp, true);
        this.renderer.domElement.addEventListener("mousedown", this.handlerMouseDown, true);
      } else {
        this.mouseState = null;
        wall.mountedFreeTiles.map(function (tile) {
          _this9.room.remove(tile);
        });
        wall.mountedFreeTiles = [];
        if (this.INTERSECTED) {
          this.INTERSECTED.material.color.setHex(this.INTERSECTED.currentHex);
          this.INTERSECTED.renderOrder = -1;
          this.INTERSECTED.material.transparent = false;
        }

        this.renderer.domElement.removeEventListener("mousemove", this.handlerMouseMove, true);
        this.renderer.domElement.removeEventListener("mouseup", this.handlerMouseUp, true);
        this.renderer.domElement.removeEventListener("mousedown", this.handlerMouseDown, true);
      }

      this.renderWall(wall, this.room);

      layout === _Wall2.default.LAYOUT_FREESTYLE && this.keepCurrentTilesWhenFreeRoom(wall, wallIndex, currentTiles, startKeepTiles, doneKeepTiles);

      this.refresh();

      callback && callback();
    }
  }, {
    key: 'removeAllTiles',
    value: function removeAllTiles(wallIndex) {
      var _this10 = this;

      var wall = this.walls[wallIndex];

      if (wall === undefined) {
        return;
      }

      wall.mountedTiles.map(function (tile) {
        _this10.room.remove(tile);
      });
      wall.mountedTiles = [];
      wall.mountedFreeTiles.map(function (tile) {
        _this10.room.remove(tile);
      });
      wall.mountedFreeTiles = [];

      wall.mount();
      wall.mountedTiles.map(function (tile) {
        _this10.room.add(tile);
      });

      this.refresh();
    }
  }, {
    key: 'changeFreeStyleTile',
    value: function changeFreeStyleTile(wallIndex, tileIndex, callback) {
      var _this11 = this;

      var wall = this.walls[wallIndex];

      if (wall === undefined) {
        return callback(new Error('Invalid wall index.'));
      }
      if (tileIndex !== null && wall.tiles[tileIndex] === undefined) {
        return callback(new Error('Invalid tile index.'));
      }

      wall.options.freeStyleTile = tileIndex;
      wall.options.layout = wall.options.layout;
      wall.freeTileLevel++;

      wall.options.selectedTile = tileIndex;

      if (tileIndex === null) {
        // remove all tiles
        wall.mountedTiles.map(function (tile) {
          _this11.room.remove(tile);
        });
        wall.mountedTiles = [];

        callback && callback();
        this.resetFreeRoom();
        return;
      }

      this.initFreeRoom(wall, wallIndex);

      callback && callback();
    }
  }, {
    key: 'initFreeRoom',
    value: function initFreeRoom(wall, wallIndex) {
      var _this12 = this;

      this.resetFreeRoom();

      // add mask tiles
      this.renderWallMask(wall, this.freeRoom, function (mountedTiles) {
        mountedTiles.map(function (tile, index) {
          _this12.maskTiles.push(tile);
          tile.material.transparent = false;
          tile.material.opacity = 1;
          tile.maskIndex = wall.freeTileLevel * 1000 + index;
          tile.wallIndex = wallIndex;
          tile.renderOrder = 0;
        });
      });
    }
  }, {
    key: 'keepCurrentTilesWhenFreeRoom',
    value: function keepCurrentTilesWhenFreeRoom(wall, wallIndex, currentTiles, start, done) {
      var _this13 = this;

      start && start();
      currentTiles.map(function (tile, index) {
        if (!tile.objectType || tile.objectType !== 'Tile') {
          return;
        }
        tile.currentHex = tile.material.color.getHex();
        tile.maskIndex = -1 * index;
        tile.wallIndex = wallIndex;
        _this13.addFreeTile(tile, true);
      });

      wall.freeTileLevel++;
      done && done();
    }
  }, {
    key: 'resetFreeRoom',
    value: function resetFreeRoom() {
      var _this14 = this;

      // remove old marks
      this.maskTiles.map(function (tile) {
        _this14.freeRoom.remove(tile);
      });
      this.maskTiles = [];
    }
  }, {
    key: 'onWindowMouseMove',
    value: function onWindowMouseMove(event) {
      var mouse = {
        x: event.layerX / this.width * 2 - 1,
        y: -(event.layerY / this.height) * 2 + 1
      };

      var ray = new Three.Raycaster();
      ray.setFromCamera(mouse, this.camera);

      var intersects = ray.intersectObjects(this.freeRoom.children);

      if (intersects.length > 0) {
        // if the closest object intersected is not the currently stored intersection object
        if (intersects[0].object !== this.INTERSECTED && intersects[0].object.objectType === 'Tile') {
          // restore previous intersection object (if it exists) to its original color
          if (this.INTERSECTED) {
            this.INTERSECTED.material.color.setHex(this.INTERSECTED.currentHex);
            this.INTERSECTED.renderOrder = -1;
            this.INTERSECTED.material.transparent = false;
          }

          // store reference to closest object as current intersection object
          this.INTERSECTED = intersects[0].object;

          // store color of closest object (for later restoration)
          this.INTERSECTED.currentHex = this.INTERSECTED.material.color.getHex();
          // set a new color for closest object
          this.INTERSECTED.material.color.setHex(0x00BCD4);
          this.INTERSECTED.material.opacity = 0.25;
          this.INTERSECTED.material.transparent = true;
          this.INTERSECTED.renderOrder = 999999;
        }
      } else // there are no intersections
        {
          // restore previous intersection object (if it exists) to its original color
          if (this.INTERSECTED) {
            this.INTERSECTED.material.color.setHex(this.INTERSECTED.currentHex);
            this.INTERSECTED.renderOrder = 0;
            this.INTERSECTED.material.transparent = false;
          }
          // remove previous intersection object reference
          //     by setting current intersection object to "nothing"
          this.INTERSECTED = null;
        }

      if (this.INTERSECTED && this.mouseState && this.mouseState.state === 'down' && this.mouseState.index !== this.INTERSECTED.maskIndex) {
        this.mouseState.index = this.addFreeTile(this.INTERSECTED);
      }

      this.refresh();
    }
  }, {
    key: 'onWindowMouseUp',
    value: function onWindowMouseUp(event) {
      this.mouseState = {
        state: 'up',
        index: -1
      };
    }
  }, {
    key: 'onWindowMouseDown',
    value: function onWindowMouseDown(event) {
      var maskIndex = this.addFreeTile(this.INTERSECTED);
      this.mouseState = {
        state: 'down',
        index: maskIndex
      };
      this.refresh();
    }
  }, {
    key: 'addFreeTile',
    value: function addFreeTile(INTERSECTED, justAdd) {
      var _this15 = this;

      if (!INTERSECTED) {
        return;
      }

      var maskIndex = INTERSECTED.maskIndex;
      var wall = this.walls[INTERSECTED.wallIndex];

      if (wall === undefined) {
        return maskIndex;
      }

      // not remove duplicated if justAdd
      if (!justAdd) {
        var duplicates = wall.mountedTiles.filter(function (tile) {
          return tile.maskIndex === maskIndex;
        });

        if (duplicates.length) {
          duplicates.map(function (tile) {
            wall.removeDuplicatedFreeTiles(tile);
            _this15.room.remove(tile);
          });

          this.props.onTileAdded && this.props.onTileAdded(wall, false, duplicates); // wall, remove, duplicates

          return maskIndex;
        }
      }

      var mountedTiles = wall.mountFreeTile(INTERSECTED);
      mountedTiles.map(function (tile) {
        tile.maskIndex = maskIndex;
        _this15.room.add(tile);
      });

      this.props.onTileAdded && this.props.onTileAdded(wall, true, mountedTiles); // wall, add, mountedTiles

      return maskIndex;
    }
  }, {
    key: 'setWallGrout',
    value: function setWallGrout(wallIndex, groutSize, groutColor, callback) {
      var _this16 = this;

      var wall = this.walls[wallIndex];

      if (wall === undefined) {
        return callback(new Error('Invalid wall index.'));
      }
      if (typeof groutSize !== 'number') {
        return callback(new Error('Invalid grout size.'));
      }
      if (typeof groutColor !== 'number') {
        return callback(new Error('Invalid grout color.'));
      }

      wall.mountedTiles.map(function (tile) {
        _this16.room.remove(tile);
      });
      wall.mountedTiles = [];

      wall.grout = {
        size: groutSize,
        color: groutColor
      };

      wall.mount();
      wall.mountedTiles.map(function (tile) {
        _this16.room.add(tile);
      });

      this.refresh();

      callback && callback();
    }
  }, {
    key: 'refresh',
    value: function refresh() {
      this.renderer.render(this.scene, this.camera);
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement('div', { className: 'room-scene-container', ref: 'threeContainer' });
    }
  }, {
    key: 'size',
    set: function set(size) {
      this._size = size;
      this.renderer.setSize(size, size / (16 / 9));
      this.refresh();
    }
  }, {
    key: 'width',
    get: function get() {
      return this._size;
    }
  }, {
    key: 'height',
    get: function get() {
      return this.width / (16 / 9);
    }
  }]);

  return RoomScene;
}(_react.Component);

RoomScene.propTypes = {
  size: _react2.default.PropTypes.number,
  camera: _react2.default.PropTypes.object.isRequired,
  debug: _react2.default.PropTypes.bool,
  onLoadingTextures: _react2.default.PropTypes.func,
  onTileAdded: _react2.default.PropTypes.func,
  perspective: _react2.default.PropTypes.object.isRequired,
  walls: _react2.default.PropTypes.array.isRequired,
  layerImages: _react2.default.PropTypes.array.isRequired
};

RoomScene.defaultProps = {
  size: 1600,
  debug: false
};

exports.default = RoomScene;