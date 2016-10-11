import React from 'react';
import {expect} from 'chai';
import {shallow, mount, render} from 'enzyme';
import Example from '../components/Example';

describe("A suite", () => {
  it("contains spec with an expectation", () => {
    expect(shallow(<Example />).is('.foo')).to.equal(true);
  });

  it("contains spec with an expectation", () => {
    expect(mount(<Example />).find('.foo').length).to.equal(1);
  });
});
