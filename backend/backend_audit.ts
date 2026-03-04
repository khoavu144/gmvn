import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api/v1';

async function runAudit() {
    const report: string[] = [];
    const endpoints = [
        { method: 'GET', url: '/health' },
        { method: 'GET', url: '/gyms' },
        { method: 'GET', url: '/users/trainers' },
        { method: 'GET', url: '/programs' },
        // Try some obvious missing/wrong routes
        { method: 'GET', url: '/gyms/invalid-uuid' },
        { method: 'GET', url: '/users/trainers/invalid-uuid' }
    ];

    console.log('--- STARTING BACKEND AUDIT ---');
    for (const ep of endpoints) {
        try {
            const res = await axios({ method: ep.method, url: `${BASE_URL}${ep.url}` });
            report.push(`[PASS] ${ep.method} ${ep.url} - Status: ${res.status}`);
        } catch (e: any) {
            report.push(`[FAIL] ${ep.method} ${ep.url} - Status: ${e.response?.status} - ${JSON.stringify(e.response?.data) || e.message}`);
        }
    }
    
    console.log(report.join('\n'));
}

runAudit();
