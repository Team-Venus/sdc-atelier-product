const scripts = require('./scripts');

module.exports = {
  run: scripts.initial_setup,
  getAllProducts: scripts.getAllProducts,
  getProduct: scripts.getProduct,
  getStyle: scripts.getStyle,
  getRelated: scripts.getRelated
}