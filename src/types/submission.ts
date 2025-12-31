/**
 * submission - 投稿
 *
 * 职责：
 * - 声明投稿相关的数据结构与类型约束。
 * - 为业务逻辑提供类型安全的契约。
 * - 集中管理跨模块共享的类型定义。
 */

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface LineupPosition {
    lat: number;
    lng: number;
}

export interface LineupSubmission {
    id: string;
    submitter_id: string;
    submitter_email?: string;
    title: string;
    map_name: string;
    agent_name: string;
    agent_icon?: string;
    skill_icon?: string;
    side: 'attack' | 'defense';
    ability_index?: number;
    agent_pos?: LineupPosition;
    skill_pos?: LineupPosition;
    description?: string;
    stand_img?: string;
    stand_desc?: string;
    stand2_img?: string;
    stand2_desc?: string;
    aim_img?: string;
    aim_desc?: string;
    aim2_img?: string;
    aim2_desc?: string;
    land_img?: string;
    land_desc?: string;
    source_link?: string;
    author_name?: string;
    author_avatar?: string;
    author_uid?: string;
    status: SubmissionStatus;
    reject_reason?: string;
    reviewed_by?: string;
    reviewed_at?: string;
    created_at: string;
    updated_at: string;
}

export interface SubmissionFormData {
    title: string;
    map_name: string;
    agent_name: string;
    agent_icon?: string;
    skill_icon?: string;
    side: 'attack' | 'defense';
    ability_index?: number;
    agent_pos?: LineupPosition;
    skill_pos?: LineupPosition;
    description?: string;
    stand_img?: string;
    stand_desc?: string;
    aim_img?: string;
    aim_desc?: string;
    aim2_img?: string;
    aim2_desc?: string;
    land_img?: string;
    land_desc?: string;
    source_link?: string;
    author_name?: string;
    author_avatar?: string;
    author_uid?: string;
}

export interface SubmissionProgress {
    status: 'uploading' | 'saving' | 'done' | 'error';
    uploadedCount: number;
    totalImages: number;
    errorMessage?: string;
}

export interface SubmissionResult {
    success: boolean;
    submissionId?: string;
    errorMessage?: string;
}
