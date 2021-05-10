import http from 'k6/http';

import { sleep } from 'k6';


// represents the typical API calls a user will make
export default function() {
  const url = 'http://localhost:5000/products/';
  http.get(url); // base
  http.get(url + '1'); // product
  http.get(url + '1/styles'); // styles
  http.get(url + '1/related'); // styles
}