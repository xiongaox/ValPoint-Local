/**
 * 管理员权限服务
 * 用于检查和管理后台管理员权限
 */
import { supabase } from '../supabaseClient';

/** 管理员用户类型 */
export interface AdminUser {
    id: string;
    user_id: string;
    email: string;
    role: 'super_admin' | 'admin';
    nickname: string | null;
    created_at: string;
    created_by: string | null;
}

/** 权限检查结果 */
export interface AdminAccessResult {
    isAdmin: boolean;
    isSuperAdmin: boolean;
    adminInfo: AdminUser | null;
}

/**
 * 检查用户是否有管理员权限
 */
export async function checkAdminAccess(userId: string): Promise<AdminAccessResult> {
    const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error || !data) {
        return {
            isAdmin: false,
            isSuperAdmin: false,
            adminInfo: null,
        };
    }

    return {
        isAdmin: true,
        isSuperAdmin: data.role === 'super_admin',
        adminInfo: data as AdminUser,
    };
}

/**
 * 通过邮箱检查用户是否有管理员权限
 */
export async function checkAdminAccessByEmail(email: string): Promise<AdminAccessResult> {
    const { data, error } = await supabase
        .from('admin_users')
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

    return {
        isAdmin: true,
        isSuperAdmin: data.role === 'super_admin',
        adminInfo: data as AdminUser,
    };
}

/**
 * 获取所有管理员列表
 */
export async function getAdminList(): Promise<AdminUser[]> {
    const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('获取管理员列表失败:', error);
        return [];
    }

    return data as AdminUser[];
}

/**
 * 添加管理员
 * 仅超级管理员可调用
 */
export async function addAdmin(
    email: string,
    nickname?: string
): Promise<{ success: boolean; error?: string }> {
    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: '未登录' };
    }

    // 检查是否为超级管理员
    const access = await checkAdminAccess(user.id);
    if (!access.isSuperAdmin) {
        return { success: false, error: '无权限' };
    }

    // 检查邮箱是否已存在
    const existingAccess = await checkAdminAccessByEmail(email);
    if (existingAccess.isAdmin) {
        return { success: false, error: '该邮箱已是管理员' };
    }

    // 添加管理员
    const { error } = await supabase
        .from('admin_users')
        .insert({
            user_id: crypto.randomUUID(), // 占位符，用户登录时会更新
            email: email,
            role: 'admin',
            nickname: nickname || email.split('@')[0],
            created_by: user.id,
        });

    if (error) {
        console.error('添加管理员失败:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * 移除管理员
 * 仅超级管理员可调用，不能移除超级管理员
 */
export async function removeAdmin(
    adminId: string
): Promise<{ success: boolean; error?: string }> {
    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: '未登录' };
    }

    // 检查是否为超级管理员
    const access = await checkAdminAccess(user.id);
    if (!access.isSuperAdmin) {
        return { success: false, error: '无权限' };
    }

    // 删除管理员
    const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminId)
        .neq('role', 'super_admin'); // 不能删除超级管理员

    if (error) {
        console.error('移除管理员失败:', error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

/**
 * 更新管理员的 user_id（用户首次登录时调用）
 */
export async function updateAdminUserId(
    email: string,
    userId: string
): Promise<{ success: boolean }> {
    const { error } = await supabase
        .from('admin_users')
        .update({ user_id: userId })
        .eq('email', email);

    if (error) {
        console.error('更新管理员 user_id 失败:', error);
        return { success: false };
    }

    return { success: true };
}
