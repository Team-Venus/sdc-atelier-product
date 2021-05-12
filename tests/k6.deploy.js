import { sleep } from "k6";
import http from "k6/http";

export const options = {
  stages: [
    { duration: "1m", target: 1000 },
    { duration: "3m", target: 1000 },
    { duration: "1m", target: 0 },
  ],
  ext: {
    loadimpact: {
      distribution: {
        "amazon:us:ashburn": { loadZone: "amazon:us:ashburn", percent: 100 },
      },
    },
  },
};

export default function main() {
  let response;

  // get products
  response = http.get("http://52.14.196.23:5000/products");

  // get a single product
  response = http.get("http://52.14.196.23:5000/products/1");

  // get a single product's styles
  response = http.get("http://52.14.196.23:5000/products/1/styles");

  response = http.get("http://52.14.196.23:5000/products/1/related");

  // Automatically added sleep
  sleep(1);
}
