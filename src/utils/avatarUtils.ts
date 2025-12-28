/**
 * avatarUtils.ts - 用户头像工具函数
 * 
 * 职责：
 * - 提供可用特工头像列表（用于兼容旧用户数据）
 * - 新用户默认使用玩家卡面头像（见 playerCardAvatars.ts）
 * - 生成随机默认头像（用于新注册用户）
 */

import {
    getPlayerCardByEmail as getPlayerCardAvatarByEmail,
    getDefaultPlayerCardAvatar,
    preloadPlayerCards
} from './playerCardAvatars';

// 预定义的特工头像列表 (public/agents 下的文件名)
// 仅用于兼容旧用户数据，新用户使用玩家卡面
export const AGENT_AVATARS = [
    'KO.png', '不死鸟.png', '壹决.png', '夜露.png', '奇乐.png',
    '尚勃勒.png', '幻棱.png', '幽影.png', '捷风.png', '斯凯.png',
    '星礈.png', '暮蝶.png', '海神.png', '炼狱.png', '猎枭.png',
    '盖可.png', '禁灭.png', '维斯.png', '芮娜.png', '蝰蛇.png',
    '贤者.png', '钛狐.png', '钢锁.png', '铁臂.png', '零.png',
    '雷兹.png', '霓虹.png', '黑梦.png'
];

/**
 * 获取随机默认头像（新用户使用玩家卡面）
 */
export const getRandomAvatar = (): string => {
    return getDefaultPlayerCardAvatar();
};

/**
 * 根据用户 ID 生成确定性随机头像（同一 ID 始终返回相同头像）
 * 新用户返回玩家卡面 URL
 */
export const getAvatarByUserId = (userId: string): string => {
    return getPlayerCardAvatarByEmail(userId);
};

/**
 * 根据用户邮箱生成确定性随机头像（同一邮箱始终返回相同头像）
 * 新用户返回玩家卡面 URL
 */
export const getAvatarByEmail = (email: string): string => {
    return getPlayerCardAvatarByEmail(email);
};

/**
 * 预加载玩家卡面数据
 * 应在应用启动时调用，减少首次打开头像选择器的延迟
 */
export { preloadPlayerCards };
