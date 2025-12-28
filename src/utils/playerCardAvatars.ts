/**
 * playerCardAvatars.ts - 玩家卡面头像工具
 * 
 * 职责：
 * - 提供 Valorant 玩家卡面列表作为用户头像选项
 * - 支持双数据源：OSS（加速）和 Valorant API（开源默认）
 * - 替代原有的英雄头像，避免在移动端与英雄选择按钮混淆
 * 
 * 数据源优先级：
 * 1. OSS (如果配置了 OSS_PLAYERCARDS_BASE_URL 环境变量或生成了本地 JSON)
 * 2. Valorant API (https://valorant-api.com/v1/playercards?language=zh-CN)
 */

export interface PlayerCardAvatar {
    uuid: string;      // 卡面唯一标识
    name: string;      // 卡面名称（中文）
    url: string;       // displayIcon URL
}

/** 缓存加载的卡面数据 */
let cachedCards: PlayerCardAvatar[] | null = null;
let loadingPromise: Promise<PlayerCardAvatar[]> | null = null;

/** 
 * OSS 基础 URL（可选）
 * 如果设置，将使用 OSS 图片而非原始 Valorant API 图片
 * 格式: https://valcards.oss-cn-guangzhou.aliyuncs.com/playercards
 */
const OSS_BASE_URL = import.meta.env.VITE_OSS_PLAYERCARDS_BASE_URL || '';

/**
 * 本地 JSON 路径（如果存在，优先使用）
 */
const LOCAL_JSON_PATH = '/data/playercards_cn.json';

/**
 * Valorant API URL（后备数据源）
 */
const VALORANT_API_URL = 'https://valorant-api.com/v1/playercards?language=zh-CN';

/**
 * 从 Valorant API 获取卡面数据
 */
async function fetchFromValorantAPI(): Promise<PlayerCardAvatar[]> {
    const response = await fetch(VALORANT_API_URL);
    const { data } = await response.json();

    // 过滤公开卡面，转换格式
    return data
        .filter((card: any) => !card.isHiddenIfNotOwned)
        .map((card: any) => ({
            uuid: card.uuid,
            name: card.displayName,
            url: card.displayIcon,
        }));
}

/**
 * 从本地 JSON 加载卡面数据（OSS 同步后生成）
 */
async function fetchFromLocalJSON(): Promise<PlayerCardAvatar[] | null> {
    try {
        const response = await fetch(LOCAL_JSON_PATH);
        if (!response.ok) return null;
        return await response.json();
    } catch {
        return null;
    }
}

/**
 * 加载玩家卡面列表
 * 优先使用本地 JSON（OSS 加速），否则回退到 Valorant API
 */
export async function loadPlayerCardAvatars(): Promise<PlayerCardAvatar[]> {
    // 返回缓存
    if (cachedCards) return cachedCards;

    // 防止并发重复加载
    if (loadingPromise) return loadingPromise;

    loadingPromise = (async () => {
        try {
            // 优先尝试本地 JSON（OSS 数据）
            const localData = await fetchFromLocalJSON();
            if (localData && localData.length > 0) {
                console.log('[PlayerCards] 使用本地 OSS 数据');
                cachedCards = localData;
                return localData;
            }
        } catch (e) {
            console.warn('[PlayerCards] 本地数据加载失败，使用 Valorant API');
        }

        // 回退到 Valorant API
        console.log('[PlayerCards] 使用 Valorant API');
        const apiData = await fetchFromValorantAPI();
        cachedCards = apiData;
        return apiData;
    })();

    return loadingPromise;
}

/**
 * 同步获取卡面列表（仅在已加载时有效）
 * 用于需要同步访问的场景
 */
export function getPlayerCardAvatarsSync(): PlayerCardAvatar[] {
    return cachedCards || [];
}

/**
 * 获取默认的玩家卡面头像 URL
 */
export function getDefaultPlayerCardAvatar(): string {
    const cards = getPlayerCardAvatarsSync();
    if (cards.length > 0) {
        return cards[0].url;
    }
    // 硬编码的默认卡面（无畏契约默认卡）
    return 'https://media.valorant-api.com/playercards/9fb348bc-41a0-91ad-8a3e-818035c4e561/displayicon.png';
}

/**
 * 根据用户 ID 生成确定性随机头像（同一 ID 始终返回相同头像）
 */
export function getPlayerCardByUserId(userId: string): string {
    const cards = getPlayerCardAvatarsSync();
    if (cards.length === 0) {
        return getDefaultPlayerCardAvatar();
    }

    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = ((hash << 5) - hash) + userId.charCodeAt(i);
        hash = hash & hash;
    }
    const index = Math.abs(hash) % cards.length;
    return cards[index].url;
}

/**
 * 根据用户邮箱生成确定性随机头像
 */
export function getPlayerCardByEmail(email: string): string {
    return getPlayerCardByUserId((email || '').toLowerCase());
}

/**
 * 预加载卡面数据
 * 应在应用启动时调用，避免首次打开头像选择器时的延迟
 */
export function preloadPlayerCards(): void {
    loadPlayerCardAvatars().catch(err => {
        console.warn('[PlayerCards] 预加载失败:', err);
    });
}
