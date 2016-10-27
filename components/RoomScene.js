import React, {Component} from "react";
import Tile from './Tile';
import * as Three from 'three';
import Wall from './Wall';
import {each, eachSeries, forEachOf, parallel} from 'async';

class RoomScene extends Component {
  constructor(props) {
    super(props);

    this.renderer = null;
    this.scene = null;
    this.room = null;
    this.walls = [];
    this.layerImages = [];
  }

  componentDidMount () {
    this.initScene();
    this.loadWalls();
    this.loadAllTextures((textures) => {
      parallel([
        (callback) => {
          this.loadTilesTextures(textures, callback);
        },
        (callback) => {
          this.loadLayerImages(textures, callback);
        }
      ], () => {
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
    this.renderer.setSize(this.width, this.height);
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

  loadAllTextures(callback) {
    const textures = [];
    const images = [];
    parallel([
      (callback) => {
        each(this.walls, (wall, callback) => {
          each(wall.tiles, (tile, callback) => {
            if (images.indexOf(tile.image) < 0) {
              images.push(tile.image);
            }
            callback();
          }, callback);
        }, callback);
      },
      (callback) => {
        each(this.props.layerImages, (element, callback) => {
          if (images.indexOf(element.image) < 0) {
            images.push(element.image);
          }
          callback();
        }, callback);
      }
    ], () => {
      let progress = 0;
      this.props.onLoadingTextures &&
        this.props.onLoadingTextures(images.length, progress, progress / images.length * 100);
      each(images, (image, callback) => {
        new Three.TextureLoader().load(image, (texture) => {
          progress++;
          this.props.onLoadingTextures &&
            this.props.onLoadingTextures(images.length, progress, progress / images.length * 100);
          texture.minFilter = texture.magFilter = Three.LinearFilter;
          texture.mapping = Three.UVMapping;
          textures.push({
            image,
            texture
          });
          callback();
        });
      }, () => {
        callback && callback(textures);
      });
    });
  }

  loadTilesTextures(textures, callback) {
    each(this.walls, (wall, callback) => {
      const tiles = [];
      forEachOf(wall.tiles, (info, index, callback) => {
        const texture = textures.find(x => x.image === info.image).texture;

        const tile = new Tile(info.width, info.height, wall.plan, wall.tileRatio, texture);
        tiles[index] = tile;
        callback();
      }, () => {
        wall.tiles = tiles;
        callback();
      });
    }, callback);
  }

  loadLayerImages(textures, callback) {
    forEachOf(this.props.layerImages, (element, index, callback) => {
      const texture = textures.find(x => x.image === element.image).texture;
      this.layerImages[index] = {
        texture,
        meta: element
      };
      callback();
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

    callback && callback();
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

    callback && callback();
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

    callback && callback();
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
  onLoadingTextures: React.PropTypes.func,
  perspective: React.PropTypes.object.isRequired,
  walls: React.PropTypes.array.isRequired,
  layerImages: React.PropTypes.array.isRequired
};

RoomScene.defaultProps = {
  size: 1600,
  debug: false
};

export default RoomScene;
