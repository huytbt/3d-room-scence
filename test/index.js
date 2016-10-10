import App from '../components/app';
import expect from 'expect';
import React from 'react';
import TestUtils from 'react-addons-test-utils';

describe('App', () => {
  it('renders without problems', () => {
    const app = TestUtils.renderIntoDocument(<App/>);
    expect(app).toExist();
  });
});
