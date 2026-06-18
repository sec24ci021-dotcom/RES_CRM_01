const http = require('http');
const data = JSON.stringify({ status: 'BOOKED' });
const options = {
    hostname: 'localhost',
    port: 3003,
    path: '/api/v1/leads/6a32dce5766c2f8146007308/status',
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
    },
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => (body += chunk));
    res.on('end', () => {
        console.log('STATUS:', res.statusCode);
        console.log('HEADERS:', JSON.stringify(res.headers));
        console.log('BODY:', body);
    });
});

req.on('error', (e) => {
    console.error('Request error:', e.message);
});

req.write(data);
req.end();