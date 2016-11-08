import React from 'react';
import ReactDOM from 'react-dom';
import {RoomScene} from './components/index';

const tiles = [
  {
    image: '/assets/images/tile_149.jpg',
    width: 960,
    height: 976
  },
  {
    image: '/assets/images/tile_1.jpg',
    width: 240,
    height: 240
  },
  {
    image: '/assets/images/tile_2.jpg',
    width: 600,
    height: 400
  }
];

const backgroundTiles = [
  {
    image: '/assets/images/tile_242.jpg',
    width: 800,
    height: 800
  },
  {
    image: '/assets/images/tile_1.jpg',
    width: 240,
    height: 240
  },
  {
    image: '/assets/images/tile_2.jpg',
    width: 600,
    height: 400
  }
];

const roomScene = {
  camera: {
    position: {x:0, y:2.3, z:15}
  },
  perspective: {
    fov: 60,
    viewOffset: {
      x: 0,
      y: 140
    }
  },
  walls: [
    // back wall
    {
      position: {x:0, y:1500/2, z:2000},
      plan: 'z',
      direction: {
        x: 'rl',
        y: 'bt'
      },
      width: 2400,
      height: 1500,
      ratio: 1/250,
      tileRatio: 1/500,
      tiles,
      options: {
        selectedTile: null,
        layout: 0,
        grout: {
          size: 4,
          color: 0xffffd2
        }
      }
    },
    // right wall
    {
      position: {x:2400/2, y:1500/2, z:3000},
      plan: 'x',
      direction: {
        x: 'lr',
        y: 'bt'
      },
      width: 2000,
      height: 1500,
      ratio: 1/250,
      tileRatio: 1/500,
      tiles,
      options: {
        selectedTile: null,
        layout: 0,
        grout: {
          size: 0,
          color: 0xffffd2
        }
      }
    },
    // background
    {
      position: {x:0, y:0, z:3000},
      plan: 'y',
      direction: {
        x: 'rl',
        y: 'bt'
      },
      width: 2400,
      height: 2000,
      ratio: 1/250,
      tileRatio: 1/500,
      tiles: backgroundTiles,
      options: {
        selectedTile: null,
        layout: 0,
        grout: {
          size: 0,
          color: 0xffffd2
        }
      }
    }
  ],
  layerImages: [
    {
      image: '/assets/images/room_foreground_47.png',
      position: {x:0, y:530, z:3500},
      opacity: 0.40,
      width: 520,
      height: 292.5,
      ratio: 1/250
    },
    {
      image: '/assets/images/room_background_47.png',
      position: {x:0, y:530, z:3500},
      opacity: 1,
      width: 520,
      height: 292.5,
      ratio: 1/250
    }
  ]
};

ReactDOM.render((
  <RoomScene camera={roomScene.camera} layerImages={roomScene.layerImages}
    perspective={roomScene.perspective} size={1600} walls={roomScene.walls} />
), document.getElementById('root'));
