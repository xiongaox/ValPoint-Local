import { manifestConfig } from '../valpoint.config.js';

export default function handler(req, res) {
    // 设置 CORS 头，允许跨域访问
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // 处理 OPTIONS 预检请求
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 返回动态清单
    res.status(200).json({
        ...manifestConfig,
        description: `${manifestConfig.description} (Vercel)`,
        api: {
            supabaseUrl: process.env.VITE_SUPABASE_SHARE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
            supabaseAnonKey: process.env.VITE_SUPABASE_SHARE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
        }
    });
}
