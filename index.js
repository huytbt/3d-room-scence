import React from 'react';
import ReactDOM from 'react-dom';
import {RoomScene} from './components/index';

const tiles = [
  {
    image: '/asserts/images/tile_149.jpg',
    width: 960,
    height: 976
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
    {
      position: {x:-2020, y:0, z:7200},
      direction: 'z',
      width: 3520,
      height: 1700,
      ratio: 1/100,
      tiles
    },
    {
      position: {x:1260, y:0, z:7200},
      direction: 'x',
      width: 4200,
      height: 1700,
      ratio: 1/100,
      tiles
    },
    {
      position: {x:-2000, y:0, z:7200},
      direction: 'y',
      width: 3500,
      height: 6200,
      ratio: 1/100,
      tiles
    }
  ],
  layerImages: [
    {
      image: '/asserts/images/room_foreground_47.png',
      opacity: 0.5,
      top: 0,
      left: 0,
      width: 1800,
      height: 900
    },
    {
      image: '/asserts/images/room_background_47.png',
      opacity: 1,
      top: 0,
      left: 0,
      width: 1800,
      height: 900
    }
  ]
};

ReactDOM.render((
  <RoomScene camera={roomScene.camera} layerImages={roomScene.layerImages}
    perspective={roomScene.perspective} size={1600} walls={roomScene.walls} />
), document.getElementById('root'));
