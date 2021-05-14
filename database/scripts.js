const client = require('./client');
client.connect(() => console.log('connected to cassandra'));

const initial_setup = async (joinTables = false) => {

  const scripts = [
    /* INITIAL IMPORTS  */
    'CREATE KEYSPACE IF NOT EXISTS products WITH REPLICATION = {\'class\':\'SimpleStrategy\', \'replication_factor\':3};',
    'CREATE TABLE IF NOT EXISTS products.products_initial (id int, name varchar, slogan text, description text, category varchar, default_price int, PRIMARY KEY(id));',
    'CREATE TABLE IF NOT EXISTS products.features_initial (id int, product_id int, feature varchar, value varchar, PRIMARY KEY ((product_id), id));',
    'CREATE TABLE IF NOT EXISTS products.styles_initial (id int, productId int, name varchar, sale_price varchar, original_price varchar, default_style boolean, PRIMARY KEY ((productid), id));',
    'CREATE TABLE IF NOT EXISTS products.photos_initial (id int, styleId int, url varchar, thumbnail_url varchar, PRIMARY KEY ((styleid), id) );',
    'CREATE TABLE IF NOT EXISTS products.skus_initial (id int, styleId int, size varchar, quantity int, PRIMARY KEY ((styleid), id) );',
    'CREATE TABLE IF NOT EXISTS products.related_initial (id int, current_product_item int, related_product_item int, PRIMARY KEY ((current_product_item), id) );',
    'CREATE TYPE IF NOT EXISTS products.feature (feature varchar, value varchar);',
    'CREATE TYPE IF NOT EXISTS products.photo (url text, thumbnail_url text);',
    'CREATE TYPE IF NOT EXISTS products.sku (id int, size varchar, quantity int);',
    'CREATE TYPE IF NOT EXISTS products.style (id int, productid int, name varchar, sale_price varchar, original_price varchar, default_style boolean, photos list<frozen<photo>>, skus list<frozen<sku>>);',
    'CREATE TABLE IF NOT EXISTS products.styles (id int, productid int, name varchar, sale_price varchar, original_price varchar, default_style boolean, photos list<frozen<photo>>, skus list<frozen<sku>>, PRIMARY KEY ((productid), id));',
    'CREATE TABLE IF NOT EXISTS products.products (product_id int, product_id_1 int, name varchar, slogan text, description text, category varchar, default_price int, features list<frozen<feature>>, related list<int>, styles list<frozen<style>>, PRIMARY KEY (product_id, product_id_1)) WITH CLUSTERING ORDER BY (product_id_1 ASC);',
  ];

  // Execute scripts in order
  scripts.reduce((p, n, i) => p.then(_ => {
    if (n === scripts.length - 1 && joinTables) {
      return client.execute(n)
        .then(() => joinPhotosAndSKUsToStyles())
        .then(() => joinFeaturesAndRelatedAndStylesToProducts());
    } else return client.execute(n);
  }), Promise.resolve());
};

const joinPhotosAndSKUsToStyles = () => new Promise(resolve => {
  const getAllStyles = 'select * from products.styles_initial;';
  const getPhotos = 'select * from products.photos_initial where styleid = ?;';
  const getSKUs = 'select * from products.skus_initial where styleid = ?;';

  let counter = 0;

  client.eachRow(getAllStyles, [], { prepare: true, fetchSize: 1000, autoPage: true }, async function (n, styleRow) {
    try {
      const photos = (await client.execute(getPhotos, [styleRow.id], { prepare: true })).rows.map(row => { return { url: row.url, thumbnail_url: row.thumbnail_url } });
      const skus = (await client.execute(getSKUs, [styleRow.id], { prepare: true })).rows.map(row => { return { id: row.id, size: row.size, quantity: row.quantity } });

      const insert = 'INSERT INTO products.styles (id, productid, name, sale_price, original_price, default_style, photos, skus) VALUES (?, ?, ?, ?, ?, ?, ?, ?);'
      const style = [
        styleRow.id,
        styleRow.productid,
        styleRow.name,
        styleRow.sale_price,
        styleRow.original_price,
        styleRow.default_style,
        photos,
        skus
      ];
      await client.execute(insert, style, { prepare: true });
      process.stdout.write('Row: ' + ++counter + '\r');
    } catch (err) {
      console.log(err);
    }
  }, () => {
    console.log('finished joining photos and skus to styles');
    resolve();
  });
});

const joinFeaturesAndRelatedAndStylesToProducts = () => new Promise(resolve => {
  const getAllProducs = 'select * from products.products_initial;';
  const getFeatures = 'select * from products.features_initial where product_id = ?;';
  const getRelated = 'select * from products.related_initial where current_product_item = ?;';
  const getStyles = 'select * from products.styles where productid = ?;';

  let counter = 0;

  client.eachRow(getAllProducs, [], { prepare: true, fetchSize: 1000, autoPage: true }, async (n, productRow) => {
    try {
      const features = (await client.execute(getFeatures, [productRow.id], { prepare: true })).rows;
      const related = (await client.execute(getRelated, [productRow.id], { prepare: true })).rows.map(row => row.related_product_item);
      const styles = (await client.execute(getStyles, [productRow.id], { prepare: true })).rows;

      const insert = 'INSERT INTO products.products (product_id, product_id_1, name, slogan, description, category, default_price, features, related, styles) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);'

      await client.execute(insert, [
        productRow.id,
        productRow.id,
        productRow.name,
        productRow.slogan,
        productRow.description,
        productRow.category,
        productRow.default_price,
        features,
        related,
        styles
      ], { prepare: true });

      process.stdout.write('Row: ' + ++counter + '\r');
    } catch (err) {
      console.log(err);
    }
  }, () => {
    process.stdout.write('Done');
    resolve();
  });

});



const getAllProducts = async (page = 1, count = 100) => {
  await client.connect();

  let query = 'select product_id, name, slogan, description, category, default_price from products.products;';

  let results = (await client.execute(query, [], { prepare: true, autoPage: true, fetchSize: count * page })).rows.slice(-count);
  results = results.map(product => {
    product['id'] = product['product_id'];
    delete product['product_id'];

    return product;
  })
  return results;
}

const getProduct = async (id) => {
  await client.connect();

  let query = 'select product_id, name, slogan, description, category, default_price, features from products.products where product_id = ?;';

  let product = (await client.execute(query, [id], { prepare: true })).rows[0];
  product['id'] = product['product_id'];
  delete product['product_id'];

  products['features'].forEach(feature => {
    if (feature['value'] === 'null') feature['value'] = null;
  })

  return product;
}

const getStyle = async (id) => {
  await client.connect();

  let query = 'select styles from products.products where product_id = ?;'
  let styles = (await client.execute(query, [id], { prepare: true })).rows[0].styles;

  return {
    product_id: id,
    results: styles.map(style => {
      let skus = {};
      style.skus.forEach(sku => skus[sku.id] = { quantity: sku.quantity, size: sku.size });

      return {
        style_id: style.id,
        name: style.name,
        original_price: style.original_price,
        sale_price: style.sale_price === 'null' ? null : style.sale_price,
        "default?": style.default_style,
        photos: style.photos,
        skus
      }
    })
  };
}

const getRelated = async (id) => {
  await client.connect();

  let query = 'select related from products.products where product_id = ?;'
  let related = (await client.execute(query, [id], { prepare: true })).rows.map(row => row.related)[0];
  return related;
}

module.exports = {
  initial_setup, getAllProducts, getProduct, getStyle, getRelated
};