const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: require.resolve('.'),
  output: {
    filename: 'browser.js',
    library: 'Snekfetch',
    libraryTarget: 'umd',
  },
  plugins: [
    new UglifyJSPlugin(),
  ],
  resolve: {
    alias: {
      querystring: require.resolve('./src/qs_mock'),
    },
  },
};
