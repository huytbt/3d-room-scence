const webpack = require('webpack');

module.exports = function (config) {
  config.set({

    browsers: [ process.env.CONTINUOUS_INTEGRATION ? 'Firefox' : 'Chrome' ],

    singleRun: true,

    frameworks: [ 'mocha' ],

    files: [
      'webpack.tests.js'
    ],

    preprocessors: {
      'webpack.tests.js': [ 'webpack', 'sourcemap' ]
    },

    reporters: [ 'dots' ],

    webpack: {
      devtool: 'inline-source-map',
      module: {
        loaders: [
          {test: /\.js$/, loader: 'babel-loader'}
        ]
      }
    },

    webpackServer: {
      noInfo: true
    }

  });
};
