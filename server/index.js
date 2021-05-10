const express = require('express');
const db = require('../database');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 5000;

// app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/products', async (req, res) => {
  const { page, count } = req.query;
  let products = await db.getAllProducts(page, count);
  res.status(200).send(products);
});

app.get('/products/:product_id', async (req, res) => {
  const { product_id } = req.params;
  let product = await db.getProduct(product_id);

  res.status(200).send(product);
});

app.get('/products/:product_id/styles', async (req, res) => {
  const { product_id } = req.params;
  let style = await db.getStyle(product_id);

  res.status(200).send(style);
});

app.get('/products/:product_id/related', async (req, res) => {
  const { product_id } = req.params;
  let related = await db.getRelated(product_id);

  res.status(200).send(related);
});

app.listen(port, () => {
  console.log('products api listening on port', port);
})