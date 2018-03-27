var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  API: '"http://localhost:8000/"',
  RESIZE: '"http://localhost:3000/"',
})
