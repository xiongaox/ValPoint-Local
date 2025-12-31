/**
 * downloadLimit - 下载Limit
 *
 * 职责：
 * - 承载下载Limit相关的模块实现。
 * - 组织内部依赖与导出接口。
 * - 为上层功能提供支撑。
 */

import { supabase } from '../supabaseClient';
import { getSystemSettings } from './systemSettings';

export async function checkDailyDownloadLimit(userId: string, count: number = 1): Promise<{ allowed: boolean; remaining: number; limit: number }> {
    const settings = await getSystemSettings();
    const limit = settings?.daily_download_limit || 50; // 说明：默认限制为 50。

    const today = new Date().toISOString().split('T')[0]; // 说明：格式为 YYYY-MM-DD。

    const { data, error } = await supabase
        .from('user_daily_downloads')
        .select('count')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

    if (error && error.code !== 'PGRST116') { // 说明：PGRST116 表示未找到。
        console.error('Failed to check download limit:', error);
        return { allowed: true, remaining: limit, limit };
    }

    const currentCount = data?.count || 0;
    const remaining = Math.max(0, limit - currentCount);

    return {
        allowed: currentCount + count <= limit,
        remaining,
        limit
    };
}

export async function incrementDownloadCount(userId: string, count: number = 1): Promise<void> {
    const today = new Date().toISOString().split('T')[0];





    const { data } = await supabase
        .from('user_daily_downloads')
        .select('count')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

    const newCount = (data?.count || 0) + count;

    const { error } = await supabase
        .from('user_daily_downloads')
        .upsert({
            user_id: userId,
            date: today,
            count: newCount,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,date' });

    if (error) {
        console.error('Failed to increment download count:', error);
    }
}

export interface DownloadLogParams {
    userId: string;
    userEmail: string;
    lineupId: string;
    lineupTitle: string;
    mapName: string;
    agentName: string;
    downloadCount?: number;
}

export async function logDownload(params: DownloadLogParams): Promise<void> {
    const { userId, userEmail, lineupId, lineupTitle, mapName, agentName, downloadCount = 1 } = params;

    const { error } = await supabase
        .from('download_logs')
        .insert({
            user_id: userId,
            user_email: userEmail,
            lineup_id: lineupId,
            lineup_title: lineupTitle,
            map_name: mapName,
            agent_name: agentName,
            download_count: downloadCount,
        });

    if (error) {
        console.error('Failed to log download:', error);
    }
}
