const http = require('http');

const data = JSON.stringify({ firstName: 'SanthithNode' });

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/leads/6a3263e4cbd3d1b9b1fa5d64',
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
    }
};

const req = http.request(options, (res) => {
    let body = '';
    console.log('STATUS:', res.statusCode);
    console.log('HEADERS:', res.headers);
    res.setEncoding('utf8');
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => {
        console.log('BODY:', body);
    });
});

req.on('error', (e) => {
    console.error('problem with request:', e.message);
});

req.write(data);
req.end();