'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _Tile = require('./Tile');

var _Tile2 = _interopRequireDefault(_Tile);

var _Wall = require('./Wall');

var _Wall2 = _interopRequireDefault(_Wall);

var _phoria = require('phoria.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RoomScene = function (_Component) {
  _inherits(RoomScene, _Component);

  function RoomScene(props) {
    _classCallCheck(this, RoomScene);

    var _this = _possibleConstructorReturn(this, (RoomScene.__proto__ || Object.getPrototypeOf(RoomScene)).call(this, props));

    _this.renderer = null;
    _this.scene = null;
    _this.walls = [];
    _this.layerImages = [];
    _this.tiles = [];
    return _this;
  }

  _createClass(RoomScene, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      this.initScene();
      this.loadWalls();
      this.loadLayerImages(function () {
        _this2.loadTilesTextures(function () {
          _this2.renderScene();
        });
      });
    }
  }, {
    key: 'initScene',
    value: function initScene() {
      this.renderer = new _phoria.Phoria.CanvasRenderer(this.refs.canvas);

      this.scene = new _phoria.Phoria.Scene();
      this.scene.camera.lookat = this.props.camera.lookat || { x: 0.0, y: 3.1, z: 34.0 };
      this.scene.camera.position = this.props.camera.position || { x: 0.0, y: 5.7, z: -20.0 };
      this.scene.perspective.aspect = this.width / this.height;
      this.scene.perspective.fov = this.props.perspective.fov || 14;
      this.scene.viewport.width = this.width;
      this.scene.viewport.height = this.height;
    }
  }, {
    key: 'renderScene',
    value: function renderScene() {
      var _this3 = this;

      this.walls.map(function (wall) {
        wall.mount();
        wall.mountedTiles.map(function (tile) {
          _this3.scene.graph.push(tile);
        });
      });
      this.scene.modelView();
      this.renderer.render(this.scene);
      this.layerImages.map(function (layer) {
        _this3.renderer.renderImage(layer.image, layer.meta.left, layer.meta.top, layer.meta.width, layer.meta.height, layer.meta.opacity);
      });
    }
  }, {
    key: 'changeWallTile',
    value: function changeWallTile(wallIndex, tileIndex) {
      this.walls[wallIndex].mountedTiles = [];
      this.walls[wallIndex].options.selectedTile = tileIndex;
      this.scene.graph = [];
      this.renderScene();
    }
  }, {
    key: 'loadWalls',
    value: function loadWalls() {
      var _this4 = this;

      this.props.walls.map(function (element) {
        var wall = new _Wall2.default(element.position, element.plan, element.direction, element.width, element.height, element.ratio, element.tiles, element.options);
        _this4.walls.push(wall);
      });
    }
  }, {
    key: 'loadTilesTextures',
    value: function loadTilesTextures(callback) {
      var loader = new _phoria.Phoria.Preloader();

      this.walls.map(function (wall) {
        var tiles = [];
        wall.tiles.map(function (info) {
          var texture = new Image();
          loader.addImage(texture, info.image);

          var tile = new _Tile2.default(info.width, info.height, wall.ratio, texture);
          tiles.push(tile);
        });
        wall.tiles = tiles;
      });

      loader.onLoadCallback(callback);
    }
  }, {
    key: 'loadLayerImages',
    value: function loadLayerImages(callback) {
      var _this5 = this;

      var loader = new _phoria.Phoria.Preloader();

      this.props.layerImages.map(function (element) {
        var image = new Image();
        _this5.layerImages.push({
          image: image,
          meta: element
        });
        loader.addImage(image, element.image);
      });

      loader.onLoadCallback(callback);
    }
  }, {
    key: 'handleChangeWallTile',
    value: function handleChangeWallTile(wallIndex, tileIndex, e) {
      this.changeWallTile(wallIndex, tileIndex);
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        { className: 'room-scene-container' },
        _react2.default.createElement('canvas', { height: this.height, ref: 'canvas', style: { backgroundColor: '#eee' }, width: this.width })
      );
    }
  }, {
    key: 'width',
    get: function get() {
      return this.props.size;
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
  perspective: _react2.default.PropTypes.object.isRequired,
  walls: _react2.default.PropTypes.array.isRequired,
  layerImages: _react2.default.PropTypes.array.isRequired
};

RoomScene.defaultProps = {
  size: 1600
};

exports.default = RoomScene;