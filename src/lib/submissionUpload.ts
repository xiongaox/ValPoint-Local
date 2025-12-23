/**
 * 投稿点位上传逻辑
 * 将 ZIP 文件中的图片上传到 Supabase Storage，并保存投稿记录
 */

import { unzipSync, strFromU8 } from 'fflate';
import { supabase } from '../supabaseClient';
import { SubmissionFormData, SubmissionProgress, SubmissionResult, LineupSubmission } from '../types/submission';

/** ZIP 解析后的图片数据 */
interface ParsedZipData {
    jsonPayload: any;
    images: Map<string, Uint8Array>; // 文件名 -> 二进制数据
}

/** 图片字段映射 */
const IMAGE_FIELDS = [
    { jsonKey: 'stand_img', field: 'stand_img' },
    { jsonKey: 'aim_img', field: 'aim_img' },
    { jsonKey: 'aim2_img', field: 'aim2_img' },
    { jsonKey: 'land_img', field: 'land_img' },
] as const;

/**
 * 解析 ZIP 文件
 */
export const parseSubmissionZip = async (zipFile: File): Promise<ParsedZipData> => {
    const arrayBuffer = await zipFile.arrayBuffer();
    const zipData = new Uint8Array(arrayBuffer);
    const unzipped = unzipSync(zipData);

    // 查找 JSON 文件
    const jsonFileName = Object.keys(unzipped).find((name) => name.endsWith('.json'));
    if (!jsonFileName) {
        throw new Error('ZIP 文件中未找到 JSON 元数据');
    }

    // 解析 JSON
    const jsonContent = strFromU8(unzipped[jsonFileName]);
    const jsonPayload = JSON.parse(jsonContent);

    // 收集图片文件
    const images = new Map<string, Uint8Array>();
    for (const [fileName, data] of Object.entries(unzipped)) {
        if (/\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)) {
            images.set(fileName, data as Uint8Array);
        }
    }

    return { jsonPayload, images };
};

/**
 * 上传图片到 Supabase Storage
 */
const uploadImageToStorage = async (
    imageData: Uint8Array,
    fileName: string,
    submissionId: string,
    userId: string,
): Promise<string> => {
    const bucket = 'submissions';

    // 提取扩展名并生成安全的文件名（避免中文字符导致错误）
    const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg';
    const safeFileName = `${crypto.randomUUID()}.${ext}`;
    const path = `${userId}/${submissionId}/${safeFileName}`;

    // 确定 MIME 类型
    const mimeTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
    };
    const contentType = mimeTypes[ext] || 'image/jpeg';

    // 转换为 Blob（创建新的 Uint8Array 确保类型兼容）
    const blob = new Blob([new Uint8Array(imageData)], { type: contentType });

    // 上传到 Supabase Storage
    const { error } = await supabase.storage.from(bucket).upload(path, blob, {
        contentType,
        upsert: true,
    });

    if (error) {
        throw new Error(`上传图片失败: ${error.message}`);
    }

    // 获取公开 URL
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    return urlData.publicUrl;
};

/**
 * 检查今日投稿次数
 */
export const checkDailySubmissionLimit = async (userId: string): Promise<{ allowed: boolean; remaining: number }> => {
    // 获取限制配置
    const { data: settings } = await supabase
        .from('system_settings')
        .select('daily_submission_limit')
        .eq('id', '00000000-0000-0000-0000-000000000001')
        .single();

    const limit = settings?.daily_submission_limit || 10;

    // 查询今日投稿数
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count } = await supabase
        .from('lineup_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('submitter_id', userId)
        .gte('created_at', today.toISOString());

    const todayCount = count || 0;
    const remaining = Math.max(0, limit - todayCount);

    return {
        allowed: todayCount < limit,
        remaining,
    };
};

/**
 * 提交点位投稿
 */
export const submitLineup = async (
    zipFile: File,
    userId: string,
    userEmail: string | undefined,
    onProgress?: (progress: SubmissionProgress) => void,
): Promise<SubmissionResult> => {
    try {
        // 1. 检查投稿限制
        const { allowed, remaining } = await checkDailySubmissionLimit(userId);
        if (!allowed) {
            return {
                success: false,
                errorMessage: `今日投稿次数已达上限，请明天再试`,
            };
        }

        onProgress?.({ status: 'uploading', uploadedCount: 0, totalImages: 0 });

        // 2. 解析 ZIP 文件
        const { jsonPayload, images } = await parseSubmissionZip(zipFile);
        const totalImages = images.size;

        // 3. 生成投稿 ID
        const submissionId = crypto.randomUUID();

        // 4. 上传图片到 Supabase Storage
        const imageUrls: Record<string, string> = {};
        let uploadedCount = 0;

        for (const field of IMAGE_FIELDS) {
            const imageFileName = jsonPayload[field.jsonKey];
            if (imageFileName && images.has(imageFileName)) {
                const imageData = images.get(imageFileName)!;
                const url = await uploadImageToStorage(imageData, imageFileName, submissionId, userId);
                imageUrls[field.field] = url;
                uploadedCount++;
                onProgress?.({ status: 'uploading', uploadedCount, totalImages });
            }
        }

        onProgress?.({ status: 'saving', uploadedCount, totalImages });

        // 5. 保存投稿记录
        const submissionData: Partial<LineupSubmission> = {
            id: submissionId,
            submitter_id: userId,
            submitter_email: userEmail,
            title: jsonPayload.title || '未命名点位',
            map_name: jsonPayload.map_name,
            agent_name: jsonPayload.agent_name,
            agent_icon: jsonPayload.agent_icon,
            skill_icon: jsonPayload.skill_icon,
            side: jsonPayload.side || 'attack',
            ability_index: jsonPayload.ability_index,
            agent_pos: jsonPayload.agent_pos,
            skill_pos: jsonPayload.skill_pos,
            description: jsonPayload.description,
            stand_img: imageUrls.stand_img,
            stand_desc: jsonPayload.stand_desc,
            stand2_img: imageUrls.stand2_img,
            stand2_desc: jsonPayload.stand2_desc,
            aim_img: imageUrls.aim_img,
            aim_desc: jsonPayload.aim_desc,
            aim2_img: imageUrls.aim2_img,
            aim2_desc: jsonPayload.aim2_desc,
            land_img: imageUrls.land_img,
            land_desc: jsonPayload.land_desc,
            source_link: jsonPayload.source_link,
            author_name: jsonPayload.author_name,
            author_avatar: jsonPayload.author_avatar,
            author_uid: jsonPayload.author_uid,
            status: 'pending',
        };

        const { error } = await supabase.from('lineup_submissions').insert(submissionData);

        if (error) {
            throw new Error(`保存投稿失败: ${error.message}`);
        }

        onProgress?.({ status: 'done', uploadedCount, totalImages });

        return {
            success: true,
            submissionId,
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : '投稿失败';
        onProgress?.({ status: 'error', uploadedCount: 0, totalImages: 0, errorMessage: message });
        return {
            success: false,
            errorMessage: message,
        };
    }
};

/**
 * 获取用户的投稿列表
 */
export const getUserSubmissions = async (userId: string): Promise<LineupSubmission[]> => {
    const { data, error } = await supabase
        .from('lineup_submissions')
        .select('*')
        .eq('submitter_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('获取投稿列表失败:', error);
        return [];
    }

    return data || [];
};

/**
 * 删除单个投稿记录（只允许删除 approved 或 rejected 状态的）
 */
export const deleteSubmission = async (submissionId: string, userId: string): Promise<{ success: boolean; error?: string }> => {
    // 先查询验证状态
    const { data: submission, error: fetchError } = await supabase
        .from('lineup_submissions')
        .select('status, submitter_id')
        .eq('id', submissionId)
        .single();

    if (fetchError || !submission) {
        return { success: false, error: '找不到该投稿记录' };
    }

    if (submission.submitter_id !== userId) {
        return { success: false, error: '无权删除他人的投稿' };
    }

    if (submission.status === 'pending') {
        return { success: false, error: '审核中的投稿不能删除，请先取消审核' };
    }

    const { error } = await supabase
        .from('lineup_submissions')
        .delete()
        .eq('id', submissionId);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
};

/**
 * 取消审核中的投稿（将状态改为 rejected 并标记为用户取消）
 */
export const cancelSubmission = async (submissionId: string, userId: string): Promise<{ success: boolean; error?: string }> => {
    const { data: submission, error: fetchError } = await supabase
        .from('lineup_submissions')
        .select('status, submitter_id')
        .eq('id', submissionId)
        .single();

    if (fetchError || !submission) {
        return { success: false, error: '找不到该投稿记录' };
    }

    if (submission.submitter_id !== userId) {
        return { success: false, error: '无权取消他人的投稿' };
    }

    if (submission.status !== 'pending') {
        return { success: false, error: '只能取消审核中的投稿' };
    }

    const { error } = await supabase
        .from('lineup_submissions')
        .update({ status: 'rejected', reject_reason: '用户主动取消' })
        .eq('id', submissionId);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true };
};

/**
 * 按状态批量删除投稿
 */
export const deleteSubmissionsByStatus = async (
    userId: string,
    statusFilter: 'all' | 'approved' | 'rejected'
): Promise<{ success: boolean; deletedCount: number; error?: string }> => {
    // 先查询要删除的记录数
    let countQuery = supabase
        .from('lineup_submissions')
        .select('id', { count: 'exact', head: true })
        .eq('submitter_id', userId)
        .neq('status', 'pending');

    if (statusFilter === 'approved') {
        countQuery = countQuery.eq('status', 'approved');
    } else if (statusFilter === 'rejected') {
        countQuery = countQuery.eq('status', 'rejected');
    }

    const { count } = await countQuery;

    // 执行删除
    let deleteQuery = supabase
        .from('lineup_submissions')
        .delete()
        .eq('submitter_id', userId)
        .neq('status', 'pending');

    if (statusFilter === 'approved') {
        deleteQuery = deleteQuery.eq('status', 'approved');
    } else if (statusFilter === 'rejected') {
        deleteQuery = deleteQuery.eq('status', 'rejected');
    }

    const { error } = await deleteQuery;

    if (error) {
        return { success: false, deletedCount: 0, error: error.message };
    }

    return { success: true, deletedCount: count || 0 };
};
