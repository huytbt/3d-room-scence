import React from 'react';
import ReactDOM from 'react-dom';
import {RoomScene} from './components/index';

const tiles = [
  {
    image: '/asserts/images/tile_149.jpg',
    width: 960,
    height: 976
  },
  {
    image: '/asserts/images/tile_1.jpg',
    width: 240,
    height: 240
  },
  {
    image: '/asserts/images/tile_2.jpg',
    width: 600,
    height: 400
  }
];

const backgroundTiles = [
  {
    image: '/asserts/images/tile_242.jpg',
    width: 800,
    height: 800
  },
  {
    image: '/asserts/images/tile_1.jpg',
    width: 240,
    height: 240
  },
  {
    image: '/asserts/images/tile_2.jpg',
    width: 600,
    height: 400
  }
];

const roomScene = {
  camera: {
    lookat: {x:0.0, y:3.1, z:34.0},
    position: {x:0.0, y:5.7, z:-20.0}
  },
  perspective: {
    fov: 14
  },
  walls: [
    // back wall
    {
      position: {x:-1010, y:0, z:5200},
      plan: 'z',
      direction: {
        x: 'rl',
        y: 'bt'
      },
      width: 2000,
      height: 1700,
      ratio: 1/100,
      tiles,
      options: {
        selectedTile: null
      }
    },
    // right wall
    {
      position: {x:990, y:0, z:1200},
      plan: 'x',
      direction: {
        x: 'rl',
        y: 'bt'
      },
      width: 4000,
      height: 1700,
      ratio: 1/100,
      tiles,
      options: {
        flipTile: true,
        selectedTile: null
      }
    },
    // background
    {
      position: {x:-1010, y:0, z:5200},
      plan: 'y',
      direction: {
        x: 'rl',
        y: 'tb'
      },
      width: 2000,
      height: 4000,
      ratio: 1/100,
      tiles: backgroundTiles
    }
  ],
  layerImages: [
    {
      image: '/asserts/images/room_foreground_47.png',
      opacity: 0.5,
      top: 0,
      left: 0,
      width: 1600,
      height: 900
    },
    {
      image: '/asserts/images/room_background_47.png',
      opacity: 1,
      top: 0,
      left: 0,
      width: 1600,
      height: 900
    }
  ]
};

ReactDOM.render((
  <RoomScene camera={roomScene.camera} layerImages={roomScene.layerImages}
    perspective={roomScene.perspective} size={1600} walls={roomScene.walls} />
), document.getElementById('root'));
