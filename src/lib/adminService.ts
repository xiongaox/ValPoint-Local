/**
 * adminService - 管理端服务
 *
 * 职责：
 * - 封装管理端服务相关的接口调用。
 * - 处理参数整理、错误兜底与结果转换。
 * - 向上层提供稳定的服务 API。
 */

import { adminSupabase as supabase } from '../supabaseClient';

export interface AdminUser {
    id: string;
    email: string | null;
    nickname: string | null;
    role: 'user' | 'admin' | 'super_admin';
    avatar: string | null;
    custom_id: string | null;
    created_at: string;
}

export interface AdminAccessResult {
    isAdmin: boolean;
    isSuperAdmin: boolean;
    adminInfo: AdminUser | null;
}

export async function checkAdminAccess(userId: string): Promise<AdminAccessResult> {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error || !data) {
        return {
            isAdmin: false,
            isSuperAdmin: false,
            adminInfo: null,
        };
    }


    const role = data.role as 'user' | 'admin' | 'super_admin';

    return {
        isAdmin: role === 'admin' || role === 'super_admin',
        isSuperAdmin: role === 'super_admin',
        adminInfo: data as AdminUser,
    };
}

export async function checkAdminAccessByEmail(email: string): Promise<AdminAccessResult> {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .single();

    if (error || !data) {
        return {
            isAdmin: false,
            isSuperAdmin: false,
            adminInfo: null,
        };
    }

    const role = data.role as 'user' | 'admin' | 'super_admin';

    return {
        isAdmin: role === 'admin' || role === 'super_admin',
        isSuperAdmin: role === 'super_admin',
        adminInfo: data as AdminUser,
    };
}


export async function getAdminList(): Promise<AdminUser[]> {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .in('role', ['admin', 'super_admin'])
        .order('created_at', { ascending: true });

    if (error) {
        console.error('获取管理员列表失败:', error);
        return [];
    }

    return data as AdminUser[];
}

export async function addAdmin(
    email: string,
    _nickname?: string
): Promise<{ success: boolean; error?: string }> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
        console.error('[AdminService] addAdmin: 未获取到有效 session');
        return { success: false, error: '未登录' };
    }
    const user = session.user;

    const access = await checkAdminAccess(user.id);
    if (!access.isSuperAdmin) {
        return { success: false, error: '无权限' };
    }

    const existingAccess = await checkAdminAccessByEmail(email);
    if (!existingAccess.adminInfo) {
        return { success: false, error: '用户不存在，请先让用户注册' };
    }

    if (existingAccess.isAdmin) {
        return { success: false, error: '该用户已是管理员' };
    }

    console.log('[AdminService] 正在更新用户 role 为 admin:', email);
    const { data: updateData, error } = await supabase
        .from('user_profiles')
        .update({ role: 'admin' })
        .eq('email', email)
        .select();

    console.log('[AdminService] 更新结果:', { updateData, error });

    if (error) {
        console.error('添加管理员失败:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function removeAdmin(
    adminId: string
): Promise<{ success: boolean; error?: string }> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
        console.error('[AdminService] removeAdmin: 未获取到有效 session');
        return { success: false, error: '未登录' };
    }
    const user = session.user;

    const access = await checkAdminAccess(user.id);
    if (!access.isSuperAdmin) {
        return { success: false, error: '无权限' };
    }

    const targetAccess = await checkAdminAccess(adminId);
    if (targetAccess.isSuperAdmin) {
        return { success: false, error: '无法移除超级管理员' };
    }

    const { error } = await supabase
        .from('user_profiles')
        .update({ role: 'user' })
        .eq('id', adminId);

    if (error) {
        console.error('移除管理员失败:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

export async function updateUserPermission(
    userId: string,
    permission: { canBatchDownload?: boolean }
): Promise<{ success: boolean; error?: string }> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
        console.error('[AdminService] updateUserPermission: 未获取到有效 session');
        return { success: false, error: '未登录' };
    }
    const user = session.user;

    const callerAccess = await checkAdminAccess(user.id);
    if (!callerAccess.isAdmin) {
        return { success: false, error: '无权限' };
    }

    const updates: any = {};
    if (permission.canBatchDownload !== undefined) {
        updates.can_batch_download = permission.canBatchDownload;
    }

    if (Object.keys(updates).length === 0) {
        return { success: true };
    }

    const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId);

    if (error) {
        console.error('更新用户权限失败:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}
