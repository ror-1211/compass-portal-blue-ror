const { environment } = require('@rails/webpacker')
const erb = require('./loaders/erb')

//https://dev.to/songta17/rails-6-with-bootstrap-5-5c08
const webpack = require('webpack')
environment.plugins.prepend('Provide',
  new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery',
    Popper: ['popper.js', 'default']
  })
)

environment.loaders.prepend('erb', erb)
module.exports = environment
