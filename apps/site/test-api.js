const http = require('http');
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/messages/conversations',
  method: 'GET',
};
const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('API RESPONSE:', data));
});
req.on('error', error => console.error(error));
req.end();
