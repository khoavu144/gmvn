const axios = require('axios');
axios.get('https://www.gymerviet.com/api/v1/health').then(res => {
    console.log("SUCCESS:", typeof res.data, res.data.substring(0, 50));
}).catch(err => {
    console.error("ERROR:", err.message);
});
