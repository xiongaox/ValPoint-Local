/**
 * supabaseClient - supabaseClient
 *
 * 职责：
 * - 承载supabaseClient相关的模块实现。
 * - 组织内部依赖与导出接口。
 * - 为上层功能提供支撑。
 */

import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string) => {
  return window.__ENV__?.[key] || import.meta.env[key];
};

const url = getEnv('VITE_SUPABASE_URL');
const anonKey = getEnv('VITE_SUPABASE_ANON_KEY');
const shareUrl = getEnv('VITE_SUPABASE_SHARE_URL') || url;
const shareAnonKey = getEnv('VITE_SUPABASE_SHARE_ANON_KEY') || anonKey;

if (!url || !anonKey) {
  throw new Error('请在环境变量中设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY');
}
if (!shareUrl || !shareAnonKey) {
  throw new Error('请在环境变量中设置 VITE_SUPABASE_SHARE_URL 和 VITE_SUPABASE_SHARE_ANON_KEY，或使用主库变量兜底');
}

export const supabase = createClient(url, anonKey);

export const shareSupabase = createClient(shareUrl, shareAnonKey);

export const adminSupabase = createClient(url, anonKey, {
  auth: {
    storageKey: 'sb-admin-auth-token',
    storage: window.localStorage,
  },
});

