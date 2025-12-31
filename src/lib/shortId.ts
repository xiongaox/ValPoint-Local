/**
 * shortId - shortId
 *
 * 职责：
 * - 承载shortId相关的模块实现。
 * - 组织内部依赖与导出接口。
 * - 为上层功能提供支撑。
 */

import { supabase } from '../supabaseClient';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const DEFAULT_LENGTH = 8;

export function generateShortId(length = DEFAULT_LENGTH): string {
    let result = '';
    const arr = crypto.getRandomValues(new Uint32Array(length));
    for (let i = 0; i < length; i++) {
        result += CHARS[arr[i] % CHARS.length];
    }
    return result;
}


export async function generateUniqueId(): Promise<string> {
    const MAX_ATTEMPTS = 5;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const newId = generateShortId();

        const { data, error } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('custom_id', newId)
            .maybeSingle();

        if (error) {
            console.error('查询 custom_id 失败:', error);
            return newId;
        }

        if (!data) {
            return newId;
        }

        console.warn(`生成的 ID ${newId} 已存在，重试中 (${attempt + 1}/${MAX_ATTEMPTS})`);
    }

    return generateShortId();
}
