require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const LRU = require('lru-cache');

const db = require('../database');

const app = express();
const port = process.env.PORT || 5000;
const cache = new LRU(150);


// app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/products', async (req, res) => {
  const { page, count } = req.query;
  let cachekey = `/products?p=${page},c=${count}`;

  if (cache.has(cachekey)) {
    res.status(200).send(cache.get(cachekey));
  } else {
    let products = await db.getAllProducts(page, count);
    cache.set(cachekey, products);
    res.status(200).send(products);
  }
});

app.get('/products/:product_id', async (req, res) => {
  const { product_id } = req.params;
  let cachekey = `/products/${product_id}`;

  if (cache.has(cachekey)) {
    res.status(200).send(cache.get(cachekey));
  } else {
    let product = await db.getProduct(product_id);
    cache.set(cachekey, product);
    res.status(200).send(product);
  }
});

app.get('/products/:product_id/styles', async (req, res) => {
  const { product_id } = req.params;
  let cachekey = `/products/${product_id}/styles`;

  if (cache.has(cachekey)) {
    res.status(200).send(cache.get(cachekey));
  } else {
    let style = await db.getStyle(product_id);
    cache.set(cachekey, style);
    res.status(200).send(style);
  }
});

app.get('/products/:product_id/related', async (req, res) => {
  const { product_id } = req.params;
  let cachekey = `/products/${product_id}/related`;

  if (cache.has(cachekey)) {
    res.status(200).send(cache.get(cachekey));
  } else {
    let related = await db.getRelated(product_id);
    cache.set(cachekey, related);
    res.status(200).send(related);
  }
});

app.listen(port, () => {
  console.log('products api listening on port', port);
});
