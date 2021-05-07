const cassandra = require('cassandra-driver');
const distance = cassandra.types.distance;
// const { CLIENT_ID, CLIENT_SECRET } = require('../secrets/astra');

/* FOR ASTRA
cloud: {
  secureConnectBundle: __dirname + "/../secrets/secure-connect-sdc-atelier.zip",
},
credentials: {
  username: CLIENT_ID,
  password: CLIENT_SECRET
},*/

const client = new cassandra.Client({
  contactPoints: ['localhost'],
  localDataCenter: 'datacenter1',
  pooling: {
    coreConnectionsPerHost: {
      [distance.local]: 8,
      [distance.remote]: 4
    }
  },
});

module.exports = client;