/**
 * userProfile - 用户资料
 *
 * 职责：
 * - 封装用户资料相关的状态与副作用。
 * - 对外提供稳定的接口与回调。
 * - 处理订阅、清理或缓存等生命周期细节。
 */

import { supabase } from '../supabaseClient';
import { Subscription } from '../apps/shared/logic/subscription';

export const fetchUserSubscriptions = async (userId: string): Promise<Subscription[]> => {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('subscriptions')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching subscriptions:', error);
        return [];
    }

    return (data?.subscriptions as Subscription[]) || [];
};

export const updateUserSubscriptions = async (userId: string, subscriptions: Subscription[]) => {
    const { error } = await supabase
        .from('user_profiles')
        .update({ subscriptions })
        .eq('id', userId);

    if (error) {
        throw new Error('Failed to sync subscriptions to cloud');
    }
};
