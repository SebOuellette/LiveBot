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
  module: {
    rules: [
      {
        test: require.resolve('./package.json'),
        use: {
          loader: 'json-filter-loader',
          options: {
            used: ['version', 'homepage'],
          },
        },
      },
    ],
  },
  resolve: {
    alias: {
      querystring: require.resolve('./src/qs_mock'),
    },
  },
};
