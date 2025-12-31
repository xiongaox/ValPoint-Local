/**
 * valpoint - valpoint
 *
 * 职责：
 * - 处理valpoint相关的接口请求。
 * - 完成参数校验、业务处理与响应输出。
 * - 保持与前端/服务端契约一致。
 */

import { manifestConfig } from '../valpoint.config.js';

export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    res.status(200).json({
        ...manifestConfig,
        description: `${manifestConfig.description} (Vercel)`,
        api: {
            supabaseUrl: process.env.VITE_SUPABASE_SHARE_URL || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
            supabaseAnonKey: process.env.VITE_SUPABASE_SHARE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
        }
    });
}
