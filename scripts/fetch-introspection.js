const https = require('https');

const query = JSON.stringify({
  query: `{ __schema { queryType { name } mutationType { name } types { name kind } }`
});

const req = https.request({
  hostname: 'ziona-api-staging.onrender.com',
  path: '/graphql/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(query)
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log(JSON.stringify(json, null, 2));
  });
});

req.on('error', console.error);
req.write(query);
req.end();