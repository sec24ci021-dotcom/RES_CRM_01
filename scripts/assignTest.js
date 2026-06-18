const axios = require('axios');

async function run() {
    try {
        const res = await axios.post('http://localhost:3001/api/v1/leads/6a32ccc57007cf88a3a8fcb3/assign', { agentId: '6a32ccc57007cf88a3a8fcab' });
        console.log('STATUS:', res.status);
        console.log(JSON.stringify(res.data, null, 2));
    } catch (err) {
        if (err.response) {
            console.error('STATUS:', err.response.status);
            console.error(JSON.stringify(err.response.data, null, 2));
        } else {
            console.error(err.message);
        }
        process.exit(1);
    }
}

run();