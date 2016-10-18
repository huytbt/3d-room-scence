import React, {Component} from "react";
import Tile from './Tile';
import Wall from './Wall';
import {Phoria} from 'phoria.js';

class RoomScene extends Component {
  constructor(props) {
    super(props);

    this.renderer = null;
    this.scene = null;
    this.walls = [];
    this.layerImages = [];
    this.tiles = [];
  }

  componentDidMount () {
    this.initScene();
    this.loadWalls();
    this.loadLayerImages(() => {
      this.loadTilesTextures(() => {
        this.renderScene();
      });
    });
  }

  initScene() {
    this.renderer = new Phoria.CanvasRenderer(this.refs.canvas);

    this.scene = new Phoria.Scene();
    this.scene.camera.lookat = this.props.camera.lookat || {x:0.0, y:3.1, z:34.0};
    this.scene.camera.position = this.props.camera.position || {x:0.0, y:5.7, z:-20.0};
    this.scene.perspective.aspect = this.width / this.height;
    this.scene.perspective.fov = this.props.perspective.fov || 14;
    this.scene.viewport.width = this.width;
    this.scene.viewport.height = this.height;
  }

  renderScene() {
    this.walls.map((wall) => {
      wall.mount();
      wall.mountedTiles.map((tile) => {
        this.scene.graph.push(tile);
      });
    });
    this.scene.modelView();
    this.renderer.render(this.scene);
    this.layerImages.map((layer) => {
      this.renderer.renderImage(layer.image, layer.meta.left, layer.meta.top,
        layer.meta.width, layer.meta.height, layer.meta.opacity);
    });
  }

  changeWallTile(wallIndex, tileIndex) {
    this.walls[wallIndex].mountedTiles = [];
    this.walls[wallIndex].options.selectedTile = tileIndex;
    this.scene.graph = [];
    this.renderScene();
  }

  loadWalls() {
    this.props.walls.map((element) => {
      const wall = new Wall(element.position, element.plan, element.direction,
        element.width, element.height, element.ratio, element.tiles, element.options);
      this.walls.push(wall);
    });
  }

  loadTilesTextures(callback) {
    const loader = new Phoria.Preloader();

    this.walls.map((wall) => {
      const tiles = [];
      wall.tiles.map((info) => {
        const texture = new Image();
        loader.addImage(texture, info.image);

        const tile = new Tile(info.width, info.height, wall.ratio, texture);
        tiles.push(tile);
      });
      wall.tiles = tiles;
    });

    loader.onLoadCallback(callback);
  }

  loadLayerImages(callback) {
    const loader = new Phoria.Preloader();

    this.props.layerImages.map((element) => {
      const image = new Image();
      this.layerImages.push({
        image,
        meta: element
      });
      loader.addImage(image, element.image);
    });

    loader.onLoadCallback(callback);
  }

  get width() {
    return this.props.size;
  }

  get height() {
    return this.width / (16/9);
  }

  render() {
    return (
      <div className="room-scene-container">
        <canvas height={this.height} ref="canvas" style={{backgroundColor: '#eee'}} width={this.width} />
      </div>
    );
  }
}

RoomScene.propTypes = {
  size: React.PropTypes.number,
  camera: React.PropTypes.object.isRequired,
  perspective: React.PropTypes.object.isRequired,
  walls: React.PropTypes.array.isRequired,
  layerImages: React.PropTypes.array.isRequired
};

RoomScene.defaultProps = {
  size: 1600
};

export default RoomScene;
