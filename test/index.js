let chai = require('chai');
let Chicken = require('../src');

chai.should();

describe('Hello', () => {
  it('test', () => {
    let a = new Chicken.Room();
    a.cameraPosition.x = 10;
    a.cameraPosition.x.should.equal(10);
  });
});
