import React, {Component} from "react";
import Tile from './Tile';
import * as Three from 'three';
import Wall from './Wall';
import {eachSeries} from 'async';

class RoomScene extends Component {
  constructor(props) {
    super(props);

    this.renderer = null;
    this.scene = null;
    this.room = null;
    this.walls = [];
    this.layerImages = [];
    this.tiles = [];
  }

  componentDidMount () {
    this.initScene();
    this.loadWalls();
    this.loadTilesTextures(() => {
      this.loadLayerImages(() => {
        this.layerImages.map((layer) => {
          this.renderImage(layer);
        });

        this.renderScene();
      });
    });
  }

  initScene() {
    this.room = new Three.Object3D();
    if (this.props.debug) {
      this.room.add(new Three.GridHelper( 100, 50 ));
    }

    this.scene = new Three.Scene();
    this.scene.add(this.room);

    this.camera = new Three.PerspectiveCamera(this.props.perspective.fov, this.width / this.height, 1, 100000);
    this.camera.position.set(
      this.props.camera.position.x,
      this.props.camera.position.y,
      this.props.camera.position.z
    );
    this.camera.setViewOffset(this.width, this.height,
      this.props.perspective.viewOffset.x, this.props.perspective.viewOffset.y,
      this.width, this.height
    );

    this.renderer = new Three.WebGLRenderer({
      preserveDrawingBuffer: true
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width,this.height );
    this.renderer.setClearColor(0xffffff, 1);

    this.refs.threeContainer.appendChild(this.renderer.domElement);
  }

  loadWalls() {
    this.props.walls.map((element) => {
      const wall = new Wall(element.position, element.plan, element.direction,
        element.width, element.height, element.ratio, element.tileRatio, element.tiles, element.options);
      this.walls.push(wall);
    });
  }

  loadTilesTextures(callback) {
    eachSeries(this.walls, (wall, callback) => {
      const tiles = [];
      eachSeries(wall.tiles, (info, callback) => {
        const texture = new Three.TextureLoader().load(info.image, (texture) => {
          texture.minFilter = texture.magFilter = Three.LinearFilter;
          texture.mapping = Three.UVMapping;

          const tile = new Tile(info.width, info.height, wall.plan, wall.tileRatio, texture);
          tiles.push(tile);

          callback();
        });
      }, () => {
        wall.tiles = tiles;
        callback();
      });
    }, callback);
  }

  loadLayerImages(callback) {
    eachSeries(this.props.layerImages, (element, callback) => {
      const texture = new Three.TextureLoader().load(element.image, (texture) => {
        this.layerImages.push({
          texture,
          meta: element
        });
        callback();
      });
    }, callback);
  }

  renderScene() {
    this.walls.map((wall) => {
      wall.mount();
      wall.mountedTiles.map((tile) => {
        this.room.add(tile);
      });
    });

    this.renderer.render(this.scene, this.camera);
  }

  renderImage(layer) {
    const meta = layer.meta;
    const texture = layer.texture;
    let transparent = false;
    if (meta.opacity >= 0) {
      transparent = true;
    }

    const image = new Three.Mesh(
      new Three.BoxGeometry(meta.width * meta.ratio, meta.height * meta.ratio, 0),
      new Three.MeshBasicMaterial( {map: texture, transparent, opacity: meta.opacity} )
    );
    image.position.set(meta.position.x * meta.ratio, meta.position.y * meta.ratio, meta.position.z * meta.ratio);
    this.scene.add(image);
  }

  changeWallTile(wallIndex, tileIndex, callback) {
    const wall = this.walls[wallIndex];

    if (wall === undefined) {
      return callback(new Error('Invalid wall index.'));
    }
    if (wall.tiles[tileIndex] === undefined) {
      return callback(new Error('Invalid tile index.'));
    }

    wall.mountedTiles.map((tile) => {
      this.room.remove(tile);
    });
    wall.mountedTiles = [];

    wall.options.selectedTile = tileIndex;

    wall.mount();
    wall.mountedTiles.map((tile) => {
      this.room.add(tile);
    });

    this.referesh();

    return callback();
  }

  changeWallLayout(wallIndex, layout, callback) {
    const wall = this.walls[wallIndex];

    if (wall === undefined) {
      return callback(new Error('Invalid wall index.'));
    }
    if (wall.supportLayouts.indexOf(layout) < 0) {
      return callback(new Error('Invalid layout.'));
    }

    wall.mountedTiles.map((tile) => {
      this.room.remove(tile);
    });
    wall.mountedTiles = [];

    wall.options.layout = layout;

    wall.mount();
    wall.mountedTiles.map((tile) => {
      this.room.add(tile);
    });

    this.referesh();

    return callback();
  }

  setWallGrout(wallIndex, groutSize, groutColor, callback) {
    const wall = this.walls[wallIndex];

    if (wall === undefined) {
      return callback(new Error('Invalid wall index.'));
    }
    if (typeof groutSize !== 'number') {
      return callback(new Error('Invalid grout size.'));
    }
    if (typeof groutColor !== 'number') {
      return callback(new Error('Invalid grout color.'));
    }

    wall.mountedTiles.map((tile) => {
      this.room.remove(tile);
    });
    wall.mountedTiles = [];

    wall.grout = {
      size: groutSize,
      color: groutColor
    };

    wall.mount();
    wall.mountedTiles.map((tile) => {
      this.room.add(tile);
    });

    this.referesh();

    return callback();
  }

  referesh() {
    this.renderer.render(this.scene, this.camera);
  }

  get width() {
    return this.props.size;
  }

  get height() {
    return this.width / (16/9);
  }

  render() {
    return (
      <div className="room-scene-container" ref="threeContainer" />
    );
  }
}

RoomScene.propTypes = {
  size: React.PropTypes.number,
  camera: React.PropTypes.object.isRequired,
  debug: React.PropTypes.bool,
  perspective: React.PropTypes.object.isRequired,
  walls: React.PropTypes.array.isRequired,
  layerImages: React.PropTypes.array.isRequired
};

RoomScene.defaultProps = {
  size: 1600,
  debug: false
};

export default RoomScene;
