import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { rename } from 'fs/promises';
import { resolve } from 'path';

// 个人库配置 - 端口 3208
export default defineConfig({
    plugins: [
        react(),
        // 开发服务器中间件：将根路径重定向到 user.html
        {
            name: 'rewrite-root',
            configureServer(server) {
                server.middlewares.use((req, _res, next) => {
                    if (req.url === '/') {
                        req.url = '/user.html';
                    }
                    next();
                });
            },
        },
        // 构建后将 user.html 重命名为 index.html，以适配 Vercel 部署
        {
            name: 'rename-index',
            closeBundle: async () => {
                try {
                    const outDir = 'dist/user';
                    await rename(
                        resolve(outDir, 'user.html'),
                        resolve(outDir, 'index.html')
                    );
                    console.log('✓ Renamed user.html to index.html');
                } catch (e) {
                    // 如果文件已经是 index.html 或者不存在，忽略错误
                }
            },
        },
    ],
    server: {
        host: '127.0.0.1',
        port: 3208,
        strictPort: true,
        hmr: {
            timeout: 60000,
        },
    },
    build: {
        outDir: 'dist/user',
        rollupOptions: {
            input: 'user.html',
        },
    },
});
