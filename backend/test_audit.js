const http = require('http');

const BASE_URL = 'http://localhost:3001/api/v1';

const endpoints = [
    { name: "Kiểm tra kết nối Server", path: "/health", method: "GET" },
    { name: "Danh sách Coach", path: "/users/trainers", method: "GET" },
    { name: "Danh sách Gym", path: "/gyms", method: "GET" },
    { name: "Test lỗi 404 Cố ý", path: "/gyms/invalid-123", method: "GET" },
    { name: "Test API chưa truyền Token", path: "/auth/me", method: "GET" }
];

async function ping(endpoint) {
    return new Promise((resolve) => {
        const req = http.request(BASE_URL + endpoint.path, { method: endpoint.method }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({ status: res.statusCode, data: data.slice(0, 100) });
            });
        });
        req.on('error', (err) => resolve({ status: 'Error', data: err.message }));
        req.end();
    });
}

async function runAutoAudit() {
    console.log("\n==================================");
    console.log("   KHỞI ĐỘNG HỆ THỐNG AUTO TEST   ");
    console.log("==================================\n");

    for (let ep of endpoints) {
        process.stdout.write(`Đang test: ${ep.name} ${ep.path} ... `);
        const result = await ping(ep);
        
        // Logical Analysis rules
        if (result.status >= 200 && result.status < 300) {
            console.log(`\x1b[32m[PASS]\x1b[0m (Mã HTTP ${result.status})`);
        } else if (result.status === 401 || result.status === 404) {
            console.log(`\x1b[33m[EXPECTED FAIL]\x1b[0m (Bắt lỗi chuẩn: Mã ${result.status})`);
        } else {
             console.log(`\x1b[31m[CRITICAL ERROR]\x1b[0m Lỗi Logic: Trả về mã ${result.status}`);
        }
    }
    
    console.log("\n==================================");
    console.log("             HOÀN TẤT             ");
    console.log("==================================\n");
}

runAutoAudit();
