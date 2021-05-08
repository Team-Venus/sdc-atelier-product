const request = require('supertest');
const express = require('express');
const db = require('../database');

const sampleProducts = require('./samples/products.json');
const sampleProduct = require('./samples/product.json');
const sampleStyle = require('./samples/styles.json');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// #region API Routes
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
// #endregion


function compareKeys(a, b) {
  var aKeys = Object.keys(a).sort();
  var bKeys = Object.keys(b).sort();

  // console.log(a, b)
  // console.log(aKeys, bKeys);
  return JSON.stringify(aKeys) === JSON.stringify(bKeys);
}

describe('Atelier Products API', () => {
  it('GET /products, should return products', (done) => {
    request(app)
      .get('/products')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(compareKeys(res.body[0], sampleProducts[0])).toBe(true);
        done();
      });
  });

  it('GET /products/:product_id, should return a product', (done) => {
    request(app)
      .get('/products/1')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(compareKeys(res.body, sampleProduct)).toBe(true);
        done();
      });
  });

  it('GET /products/:product_id/styles, should return a products styles', (done) => {
    request(app)
      .get('/products/1/styles')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(compareKeys(res.body, sampleStyle)).toBe(true);
        expect(compareKeys(res.body.results[0], sampleStyle.results[0])).toBe(true);
        done();
      });
  });

  it('GET /products/:product_id/related, should return a products related items', (done) => {
    request(app)
      .get('/products/1/related')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(Array.isArray(res.body)).toBe(true);
        expect(typeof res.body[0] === 'number').toBe(true);
        done();
      });
  });
});