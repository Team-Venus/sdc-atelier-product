#! /bin/sh

node database/initialize.js false

cqlsh $1 -u $2 -p $3 << EOF
  COPY products.features_initial (id, product_id, feature, value) FROM './data/features.csv' WITH header = false AND CHUNKSIZE = 5000 AND NUMPROCESSES=4;

  COPY products.photos_initial (id, styleid, url, thumbnail_url) FROM './data/photos.csv' WITH header = true AND CHUNKSIZE = 6000 AND NUMPROCESSES=4;

  COPY products.products_initial (id, name, slogan, description, category, default_price) FROM './data/product.csv' WITH header = true AND CHUNKSIZE = 6000 AND NUMPROCESSES=4;

  COPY products.related_initial (id, current_product_item,related_product_item) FROM './data/related.csv' WITH header = true AND CHUNKSIZE = 6000 AND NUMPROCESSES=4;

  COPY products.skus_initial (id, styleid,size,quantity) FROM './data/skus.csv' WITH header = true AND CHUNKSIZE = 6000 AND NUMPROCESSES=4;

  COPY products.styles_initial (id,productid, name, sale_price, original_price, default_style) FROM './data/styles.csv' WITH header = true AND CHUNKSIZE = 6000 AND NUMPROCESSES=4;
EOF

node database/initialize true