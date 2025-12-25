import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { rename } from 'fs/promises';
import { resolve } from 'path';

// 后台管理配置 - 端口 3210
export default defineConfig({
    plugins: [
        react(),
        // 开发服务器中间件：将根路径重定向到 admin.html
        {
            name: 'rewrite-root',
            configureServer(server) {
                server.middlewares.use((req, _res, next) => {
                    if (req.url === '/') {
                        req.url = '/admin.html';
                    }
                    next();
                });
            },
        },
        // 构建后将 admin.html 重命名为 index.html，以适配 Vercel 部署
        {
            name: 'rename-index',
            closeBundle: async () => {
                try {
                    const outDir = 'dist/admin';
                    await rename(
                        resolve(outDir, 'admin.html'),
                        resolve(outDir, 'index.html')
                    );
                    console.log('✓ Renamed admin.html to index.html');
                } catch (e) {
                    // 如果文件已经是 index.html 或者不存在，忽略错误
                }
            },
        },
    ],
    server: {
        host: '127.0.0.1',
        port: 3210,
        strictPort: true,
        hmr: {
            // 禁用 HMR 超时导致的页面刷新
            timeout: 60000,
        },
    },
    build: {
        outDir: 'dist/admin',
        rollupOptions: {
            input: 'admin.html',
        },
    },
});
