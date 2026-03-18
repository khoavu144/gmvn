// Cấu hình quyền truy cập cho dự án GYMERVIET
// Theo nguyên tắc "Disciplined Minimalism" - chỉ cung cấp những gì cần thiết

interface AccessConfig {
  permissions: string[];
  allowedOrigins: string[];
  apiAccessLevel: 'full' | 'restricted' | 'limited';
}

const accessConfig: AccessConfig = {
  permissions: [
    'read',
    'write',
    // 'delete', // Hạn chế quyền xóa theo nguyên tắc tối giản
    'admin'
  ],
  allowedOrigins: [
    'http://localhost:5173', // Vite dev server
    'http://localhost:5174', // Fallback port
    'http://localhost:3001', // Backend server
    process.env.PRODUCTION_URL || ''
  ],
  apiAccessLevel: 'restricted' // Giảm mức độ truy cập từ 'full' xuống 'restricted'
};

export default accessConfig;