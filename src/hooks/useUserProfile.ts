/**
 * useUserProfile - 用户资料
 *
 * 职责：
 * - 封装用户资料相关的状态与副作用。
 * - 对外提供稳定的接口与回调。
 * - 处理订阅、清理或缓存等生命周期细节。
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useEmailAuth } from './useEmailAuth';

export interface UserProfile {
    id: string;
    email: string | null;
    nickname: string | null;
    avatar: string | null;
    custom_id: string | null;
    role: 'user' | 'admin' | 'super_admin';
    is_banned: boolean;
    ban_reason: string | null;
    download_count: number;
    can_batch_download?: boolean; // 说明：是否允许批量下载。
    pinned_lineup_ids: string[]; // 说明：置顶点位 ID 列表。
    created_at: string;
    updated_at: string;
}

interface UseUserProfileResult {
    profile: UserProfile | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    updateProfile: (data: Partial<Pick<UserProfile, 'nickname' | 'avatar' | 'custom_id'>>) => Promise<{ success: boolean; error?: string }>;
}

export function useUserProfile(): UseUserProfileResult {
    const { user } = useEmailAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        if (!user) {
            setProfile(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (fetchError) {
                if (fetchError.code === 'PGRST116') {
                    console.warn('用户配置尚未同步，2秒后重试...');
                    setTimeout(fetchProfile, 2000);
                    return;
                }
                throw fetchError;
            }

            setProfile(data as UserProfile);
        } catch (err: any) {
            console.error('获取用户配置失败:', err);
            setError(err.message || '获取用户信息失败');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const updateProfile = useCallback(async (
        data: Partial<Pick<UserProfile, 'nickname' | 'avatar' | 'custom_id'>>
    ): Promise<{ success: boolean; error?: string }> => {
        if (!user) {
            return { success: false, error: '未登录' };
        }

        try {
            const { error: updateError } = await supabase
                .from('user_profiles')
                .update({
                    ...data,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (updateError) throw updateError;

            await fetchProfile();

            return { success: true };
        } catch (err: any) {
            console.error('更新用户配置失败:', err);
            return { success: false, error: err.message || '更新失败' };
        }
    }, [user, fetchProfile]);

    return {
        profile,
        isLoading,
        error,
        refetch: fetchProfile,
        updateProfile,
    };
}
