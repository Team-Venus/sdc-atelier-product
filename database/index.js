// const client = require('./client');
const scripts = require('./scripts');

async function run() {
  console.log('connected to cassandra');
  await scripts.initial_setup();
};

module.exports = {
  run,
  getAllProducts: scripts.getAllProducts,
  getProduct: scripts.getProduct,
  getStyle: scripts.getStyle,
  getRelated: scripts.getRelated
}