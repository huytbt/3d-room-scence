import React, {Component} from "react";
import Tile from './Tile';
import * as Three from 'three';
import Wall from './Wall';
import {each, eachSeries, forEachOf, parallel} from 'async';

class RoomScene extends Component {
  constructor(props) {
    super(props);

    this._size = props.size;
    this.renderer = null;
    this.scene = null;
    this.room = null;
    this.freeRoom = null;
    this.maskTiles = [];
    this.walls = [];
    this.layerImages = [];
    this.mouseState = null;
    this.handlerMouseMove = this.onWindowMouseMove.bind(this);
    this.handlerMouseUp = this.onWindowMouseUp.bind(this);
    this.handlerMouseDown = this.onWindowMouseDown.bind(this);
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
    this.freeRoom = new Three.Object3D();
    if (this.props.debug) {
      this.room.add(new Three.GridHelper( 100, 50 ));
    }

    this.scene = new Three.Scene();
    this.scene.add(this.room);
    this.scene.add(this.freeRoom);

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
    if (this.props.camera.target) {
      this.camera.lookAt(new Three.Vector3(
        this.props.camera.target.x,
        this.props.camera.target.y,
        this.props.camera.target.z
      ));
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

        const tile = new Tile(info.width, info.height, wall.plan, wall.tileRatio, texture, info);
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
      this.renderWall(wall, this.room);
    });

    this.renderer.render(this.scene, this.camera);
  }

  renderWall(wall, toContainer, callback) {
    const mountedTiles = wall.mount();
    mountedTiles.map((tile) => {
      toContainer.add(tile);
    });
    callback && callback(mountedTiles);
  }

  renderWallMask(wall, toContainer, callback) {
    const mountedTiles = wall.mountMask();
    mountedTiles.map((tile) => {
      toContainer.add(tile);
    });
    callback && callback(mountedTiles);
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

    if (meta.rotation) {
      image.rotation.set(meta.rotation.x, meta.rotation.y, meta.rotation.z);
    }
    
    image.position.set(meta.position.x * meta.ratio, meta.position.y * meta.ratio, meta.position.z * meta.ratio);
    this.scene.add(image);
  }

  reset(callback) {
    forEachOf(this.walls, (wall, wallIndex, callback) => {
      parallel([
        (callback) => { this.changeWallTile(wallIndex, null, callback); },
        (callback) => { this.changeWallLayout(wallIndex, 0, callback); },
        (callback) => { this.setWallGrout(wallIndex, 0, 0xffffff, callback); }
      ], callback);
    }, callback);
  }

  changeWallTile(wallIndex, tileIndex, callback) {
    const wall = this.walls[wallIndex];

    if (wall === undefined) {
      return callback(new Error('Invalid wall index.'));
    }
    if (tileIndex !== null && wall.tiles[tileIndex] === undefined) {
      return callback(new Error('Invalid tile index.'));
    }

    if (wall.options.layout === Wall.LAYOUT_FREESTYLE) {
      return this.changeFreeStyleTile(wallIndex, tileIndex, callback);
    }

    this.resetFreeRoom();

    if (wall.options.layout === Wall.LAYOUT_CHECKERBOARD) {
      const isDifferenceTileSize = wall.options.selectedTile !== null && tileIndex !== null &&
        (wall.tiles[tileIndex].width !== wall.tiles[wall.options.selectedTile].width ||
          wall.tiles[tileIndex].height !== wall.tiles[wall.options.selectedTile].height);
      if (isDifferenceTileSize) {
        return callback(new Error('Just select tile same size with current tile in checkerboard layout.'));
      }
      wall.options.checkerboardSelectedTile = wall.options.selectedTile;
      if (tileIndex === null) {
        wall.options.checkerboardSelectedTile = null;
      }
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

    this.refresh();

    callback && callback();
  }

  changeWallLayout(wallIndex, layout, callback, startKeepTiles, doneKeepTiles) {
    const wall = this.walls[wallIndex];

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

    const currentTiles = [];

    wall.mountedTiles.map((tile) => {
      if (tile.objectType === 'Tile') {
        currentTiles.push(tile);
      }
      this.room.remove(tile);
    });
    wall.mountedTiles = [];

    wall.options.layout = layout;

    if (wall.options.layout !== Wall.LAYOUT_CHECKERBOARD) {
      wall.options.checkerboardSelectedTile = null;
    }

    if (wall.options.layout === Wall.LAYOUT_FREESTYLE) {
      this.changeFreeStyleTile(wallIndex, wall.options.selectedTile);
      this.initFreeRoom(wall, wallIndex);

      this.renderer.domElement.addEventListener("mousemove", this.handlerMouseMove, true);
      this.renderer.domElement.addEventListener("mouseup", this.handlerMouseUp, true);
      this.renderer.domElement.addEventListener("mousedown", this.handlerMouseDown, true);
    } else {
      this.mouseState = null;
      wall.mountedFreeTiles.map((tile) => {
        this.room.remove(tile);
      });
      wall.mountedFreeTiles = [];
      if ( this.INTERSECTED ) {
        this.INTERSECTED.material.color.setHex( this.INTERSECTED.currentHex );
        this.INTERSECTED.renderOrder = -1;
        this.INTERSECTED.material.transparent = false;
      }

      this.renderer.domElement.removeEventListener("mousemove", this.handlerMouseMove, true);
      this.renderer.domElement.removeEventListener("mouseup", this.handlerMouseUp, true);
      this.renderer.domElement.removeEventListener("mousedown", this.handlerMouseDown, true);
    }

    this.renderWall(wall, this.room);

    layout === Wall.LAYOUT_FREESTYLE &&
      this.keepCurrentTilesWhenFreeRoom(wall, wallIndex, currentTiles, startKeepTiles, doneKeepTiles);

    this.refresh();

    callback && callback();
  }

  removeAllTiles(wallIndex) {
    const wall = this.walls[wallIndex];

    if (wall === undefined) {
      return;
    }

    wall.mountedTiles.map((tile) => {
      this.room.remove(tile);
    });
    wall.mountedTiles = [];
    wall.mountedFreeTiles.map((tile) => {
      this.room.remove(tile);
    });
    wall.mountedFreeTiles = [];

    wall.mount();
    wall.mountedTiles.map((tile) => {
      this.room.add(tile);
    });

    this.refresh();
  }

  changeFreeStyleTile(wallIndex, tileIndex, callback) {
    const wall = this.walls[wallIndex];

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
      wall.mountedTiles.map((tile) => {
        this.room.remove(tile);
      });
      wall.mountedTiles = [];

      callback && callback();
      this.resetFreeRoom();
      return;
    }

    this.initFreeRoom(wall, wallIndex);

    callback && callback();
  }

  initFreeRoom(wall, wallIndex) {
    this.resetFreeRoom();

    // add mask tiles
    this.renderWallMask(wall, this.freeRoom, (mountedTiles) => {
      mountedTiles.map((tile, index) => {
        this.maskTiles.push(tile);
        tile.material.transparent = false;
        tile.material.opacity = 1;
        tile.maskIndex = wall.freeTileLevel * 1000 + index;
        tile.wallIndex = wallIndex;
        tile.renderOrder = 0;
      });
    });
  }

  keepCurrentTilesWhenFreeRoom(wall, wallIndex, currentTiles, start, done) {
    start && start();
    currentTiles.map((tile, index) => {
      if (!tile.objectType || tile.objectType !== 'Tile') {
        return;
      }
      tile.currentHex = tile.material.color.getHex();
      tile.maskIndex = -1 * index;
      tile.wallIndex = wallIndex;
      this.addFreeTile(tile, true);
    });

    wall.freeTileLevel++;
    done && done();
  }

  resetFreeRoom() {
    // remove old marks
    this.maskTiles.map((tile) => {
      this.freeRoom.remove(tile);
    });
    this.maskTiles = [];
  }

  onWindowMouseMove(event) {
    const mouse = {
      x: event.layerX / this.width * 2 - 1,
      y: -(event.layerY / this.height) * 2 + 1
    };

    const ray = new Three.Raycaster();
    ray.setFromCamera( mouse, this.camera );

    const intersects = ray.intersectObjects(this.freeRoom.children);

    if ( intersects.length > 0 )
    {
      // if the closest object intersected is not the currently stored intersection object
      if ( intersects[ 0 ].object !== this.INTERSECTED && intersects[ 0 ].object.objectType === 'Tile')
      {
        // restore previous intersection object (if it exists) to its original color
        if ( this.INTERSECTED ) {
          this.INTERSECTED.material.color.setHex( this.INTERSECTED.currentHex );
          this.INTERSECTED.renderOrder = -1;
          this.INTERSECTED.material.transparent = false;
        }

        // store reference to closest object as current intersection object
        this.INTERSECTED = intersects[ 0 ].object;

        // store color of closest object (for later restoration)
        this.INTERSECTED.currentHex = this.INTERSECTED.material.color.getHex();
        // set a new color for closest object
        this.INTERSECTED.material.color.setHex( 0x00BCD4 );
        this.INTERSECTED.material.opacity = 0.25;
        this.INTERSECTED.material.transparent = true;
        this.INTERSECTED.renderOrder = 999999;
      }
    }
    else // there are no intersections
    {
      // restore previous intersection object (if it exists) to its original color
      if ( this.INTERSECTED ) {
        this.INTERSECTED.material.color.setHex( this.INTERSECTED.currentHex );
        this.INTERSECTED.renderOrder = 0;
        this.INTERSECTED.material.transparent = false;
      }
      // remove previous intersection object reference
      //     by setting current intersection object to "nothing"
      this.INTERSECTED = null;
    }

    if (this.INTERSECTED && this.mouseState && this.mouseState.state === 'down' &&
      this.mouseState.index !== this.INTERSECTED.maskIndex) {
      this.mouseState.index = this.addFreeTile(this.INTERSECTED);
    }

    this.refresh();
  }

  onWindowMouseUp(event) {
    this.mouseState = {
      state: 'up',
      index: -1
    };
  }

  onWindowMouseDown(event) {
    const maskIndex = this.addFreeTile(this.INTERSECTED);
    this.mouseState = {
      state: 'down',
      index: maskIndex
    };
    this.refresh();
  }

  addFreeTile(INTERSECTED, justAdd)
  {
    if (!INTERSECTED) {
      return;
    }

    const maskIndex = INTERSECTED.maskIndex;
    const wall = this.walls[INTERSECTED.wallIndex];

    if (wall === undefined) {
      return maskIndex;
    }

    // not remove duplicated if justAdd
    if (!justAdd) {
      const duplicates = wall.mountedTiles.filter((tile) => {
        return tile.maskIndex === maskIndex;
      });

      if (duplicates.length) {
        duplicates.map((tile) => {
          wall.removeDuplicatedFreeTiles(tile);
          this.room.remove(tile);
        });

        this.props.onTileAdded && this.props.onTileAdded(wall, false, duplicates); // wall, remove, duplicates

        return maskIndex;
      }
    }

    const mountedTiles = wall.mountFreeTile(INTERSECTED);
    mountedTiles.map((tile) => {
      tile.maskIndex = maskIndex;
      this.room.add(tile);
    });

    this.props.onTileAdded && this.props.onTileAdded(wall, true, mountedTiles); // wall, add, mountedTiles

    return maskIndex;
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

    this.refresh();

    callback && callback();
  }

  refresh() {
    this.renderer.render(this.scene, this.camera);
  }

  set size(size) {
    this._size = size;
    this.renderer.setSize(size, size / (16/9));
    this.refresh();
  }

  get width() {
    return this._size;
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
  onTileAdded: React.PropTypes.func,
  perspective: React.PropTypes.object.isRequired,
  walls: React.PropTypes.array.isRequired,
  layerImages: React.PropTypes.array.isRequired
};

RoomScene.defaultProps = {
  size: 1600,
  debug: false
};

export default RoomScene;
