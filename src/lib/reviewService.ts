/**
 * 审核服务
 * 管理待审投稿的获取、审核通过/拒绝逻辑
 */
import { supabase } from '../supabaseClient';
import { LineupSubmission } from '../types/submission';
import { ImageBedConfig } from '../types/imageBed';
import { transferImage } from './imageBed';

/** 获取所有待审投稿 */
export async function getPendingSubmissions(): Promise<LineupSubmission[]> {
    const { data, error } = await supabase
        .from('lineup_submissions')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

    if (error) {
        console.error('获取待审投稿失败:', error);
        return [];
    }
    return data || [];
}

/** 获取所有投稿（包括已审核的） */
export async function getAllSubmissions(): Promise<LineupSubmission[]> {
    const { data, error } = await supabase
        .from('lineup_submissions')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('获取投稿列表失败:', error);
        return [];
    }
    return data || [];
}

/** 图片字段映射 */
const IMAGE_FIELDS = ['stand_img', 'aim_img', 'aim2_img', 'land_img'] as const;

/**
 * 迁移图片到官方图床
 * 将 Supabase Storage 中的临时图片转存到官方 OSS
 */
async function migrateImagesToOss(
    submission: LineupSubmission,
    ossConfig: ImageBedConfig,
): Promise<Partial<LineupSubmission>> {
    const migratedUrls: Partial<LineupSubmission> = {};

    for (const field of IMAGE_FIELDS) {
        const sourceUrl = submission[field];
        if (!sourceUrl) continue;

        try {
            const newUrl = await transferImage(sourceUrl, ossConfig);
            migratedUrls[field] = newUrl;
        } catch (error) {
            console.error(`迁移图片失败 (${field}):`, error);
            // 保留原 URL，不中断流程
            migratedUrls[field] = sourceUrl;
        }
    }

    return migratedUrls;
}

/**
 * 审核通过
 * 1. 迁移图片到官方 OSS
 * 2. 创建 shared_lineups 记录
 * 3. 更新投稿状态
 * 4. 删除 Supabase Storage 临时文件
 */
export async function approveSubmission(
    submission: LineupSubmission,
    reviewerId: string,
    ossConfig: ImageBedConfig,
): Promise<{ success: boolean; error?: string }> {
    try {
        // 1. 迁移图片到官方 OSS
        const migratedUrls = await migrateImagesToOss(submission, ossConfig);

        // 2. 创建 shared_lineups 记录
        const sharedLineup = {
            title: submission.title,
            map_name: submission.map_name,
            agent_name: submission.agent_name,
            agent_icon: submission.agent_icon,
            skill_icon: submission.skill_icon,
            side: submission.side,
            ability_index: submission.ability_index,
            agent_pos: submission.agent_pos,
            skill_pos: submission.skill_pos,
            description: submission.description,
            stand_img: migratedUrls.stand_img || submission.stand_img,
            stand_desc: submission.stand_desc,
            aim_img: migratedUrls.aim_img || submission.aim_img,
            aim_desc: submission.aim_desc,
            aim2_img: migratedUrls.aim2_img || submission.aim2_img,
            aim2_desc: submission.aim2_desc,
            land_img: migratedUrls.land_img || submission.land_img,
            land_desc: submission.land_desc,
            source_link: submission.source_link,
            author_name: submission.author_name,
            author_avatar: submission.author_avatar,
            author_uid: submission.author_uid,
            user_id: submission.submitter_id,
        };

        const { error: insertError } = await supabase
            .from('shared_lineups')
            .insert(sharedLineup);

        if (insertError) {
            return { success: false, error: `创建共享点位失败: ${insertError.message}` };
        }

        // 3. 更新投稿状态
        const { error: updateError } = await supabase
            .from('lineup_submissions')
            .update({
                status: 'approved',
                reviewed_by: reviewerId,
                reviewed_at: new Date().toISOString(),
            })
            .eq('id', submission.id);

        if (updateError) {
            return { success: false, error: `更新投稿状态失败: ${updateError.message}` };
        }

        // 4. 删除临时文件（可选，后续可以用定时任务清理）
        // await deleteSubmissionImages(submission);

        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : '审核失败';
        return { success: false, error: message };
    }
}

/**
 * 审核拒绝
 * 1. 更新投稿状态并记录拒绝理由
 * 2. 删除 Supabase Storage 临时文件
 */
export async function rejectSubmission(
    submissionId: string,
    reviewerId: string,
    reason: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('lineup_submissions')
            .update({
                status: 'rejected',
                reject_reason: reason,
                reviewed_by: reviewerId,
                reviewed_at: new Date().toISOString(),
            })
            .eq('id', submissionId);

        if (error) {
            return { success: false, error: error.message };
        }

        // 可选：删除临时文件
        // await deleteSubmissionImages(submission);

        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : '拒绝失败';
        return { success: false, error: message };
    }
}

/**
 * 删除投稿的临时图片（从 Supabase Storage）
 */
export async function deleteSubmissionImages(submission: LineupSubmission): Promise<void> {
    const bucket = 'submissions';
    const basePath = `${submission.submitter_id}/${submission.id}`;

    try {
        const { data: files } = await supabase.storage.from(bucket).list(basePath);
        if (files && files.length > 0) {
            const paths = files.map((f) => `${basePath}/${f.name}`);
            await supabase.storage.from(bucket).remove(paths);
        }
    } catch (error) {
        console.error('删除临时文件失败:', error);
    }
}
