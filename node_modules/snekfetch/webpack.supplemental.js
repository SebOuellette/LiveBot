const config = require('./webpack.config');

module.exports = {
  rules: [
    config.module.rules.find((r) => r.use.loader === 'json-filter-loader'),
  ],
  resolve: config.resolve,
};
