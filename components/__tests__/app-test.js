/* eslint-disable no-unused-vars */

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import App from '../app';

it('App render', () => {
  // Render a checkbox with label in the document
  const app = TestUtils.renderIntoDocument(
    <App />
  );

  const appNode = ReactDOM.findDOMNode(app);

  expect(appNode.textContent).toEqual('Webpack is doing its thing with React and ES20150');

  // Simulate a click and verify that it is now On
  // TestUtils.Simulate.change(
  //   TestUtils.findRenderedDOMComponentWithTag(checkbox, 'input')
  // );
  // expect(checkboxNode.textContent).toEqual('On');
});
