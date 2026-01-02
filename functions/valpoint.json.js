/**
 * valpoint.json - valpointjson
 *
 * 职责：
 * - 实现valpointjson相关的云函数入口。
 * - 处理事件输入与结果返回。
 * - 封装可复用的服务逻辑。
 */

import { manifestConfig } from '../valpoint.config.js';

export async function onRequest(context) {
    const { env } = context;

    const data = {
        ...manifestConfig,
        description: `${manifestConfig.description} (Cloudflare)`,
        api: {
            supabaseUrl: env.VITE_SUPABASE_URL || env.SUPABASE_URL,
            supabaseAnonKey: env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY
        }
    };

    return new Response(JSON.stringify(data), {
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    });
}
