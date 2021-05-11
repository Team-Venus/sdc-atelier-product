import http from 'k6/http';

export let options = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '3m', target: 300 },
    { duration: '5m', target: 400 },
    { duration: '3m', target: 0 }
  ]
}

// represents the typical API calls a user will make
export default function() {
  const url = 'http://localhost:5000/products/';
  http.get(url); // base
  http.get(url + '1'); // product
  http.get(url + '1/styles'); // styles
  http.get(url + '1/related'); // styles
}