/**
 * lineupHelpers.ts - 点位处理辅助函数
 * 
 * 职责：
 * - 提供点位去重、版本比较、数据清洗等纯逻辑函数
 * - 处理点位与本地缓存之间的转换关系
 */
import { LineupDbPayload, MapOption, AgentOption, NewLineupForm, LineupSide, LineupPosition, AgentData, BaseLineup } from '../../types/lineup';

/**
 * 检查标题是否已存在（同一特工范围内，排除当前编辑的点位）
 */
export const checkTitleExists = (
  title: string,
  lineups: BaseLineup[],
  agentName: string,
  excludeId?: string | null
): boolean => {
  const normalizedTitle = title.trim().toLowerCase();
  const normalizedAgent = agentName.trim().toLowerCase();
  return lineups.some(
    (l) =>
      l.title.trim().toLowerCase() === normalizedTitle &&
      l.agentName.trim().toLowerCase() === normalizedAgent &&
      l.id !== excludeId
  );
};

/**
 * 生成唯一标题（同一特工范围内，如果重名则添加 -01, -02 等后缀）
 */
export const generateUniqueTitle = (
  baseTitle: string,
  lineups: BaseLineup[],
  agentName: string
): string => {
  const normalizedBase = baseTitle.trim();
  if (!checkTitleExists(normalizedBase, lineups, agentName)) {
    return normalizedBase;
  }

  // 过滤出同一特工的点位
  const normalizedAgent = agentName.trim().toLowerCase();
  const agentLineups = lineups.filter(l => l.agentName.trim().toLowerCase() === normalizedAgent);

  // 如果已有后缀，先移除
  const suffixPattern = /-(\d{2})$/;
  const cleanTitle = normalizedBase.replace(suffixPattern, '');

  // 查找最大后缀
  let maxSuffix = 0;
  agentLineups.forEach((l) => {
    const title = l.title.trim();
    if (title.toLowerCase().startsWith(cleanTitle.toLowerCase())) {
      const match = title.match(suffixPattern);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxSuffix) maxSuffix = num;
      } else if (title.toLowerCase() === cleanTitle.toLowerCase()) {
        // 原始标题存在，后缀从 01 开始
        if (maxSuffix === 0) maxSuffix = 0;
      }
    }
  });

  return `${cleanTitle}-${String(maxSuffix + 1).padStart(2, '0')}`;
};

export const createEmptyLineup = (): NewLineupForm => ({
  title: '',
  agentPos: null,
  skillPos: null,
  standImg: '',
  standDesc: '',
  stand2Img: '',
  stand2Desc: '',
  aimImg: '',
  aimDesc: '',
  aim2Img: '',
  aim2Desc: '',
  landImg: '',
  landDesc: '',
  sourceLink: '',
  authorName: '',
  authorAvatar: '',
  authorUid: '',
  enableStand2: false,
  enableAim2: false,
});

type WritableLineup = {
  title: string;
  mapName: string;
  agentName: string;
  agentIcon?: string | null;
  skillIcon?: string | null;
  side: LineupSide;
  abilityIndex: number | null;
  ability_index?: number | null; // 兼容性字段
  agentPos: LineupPosition | null;
  skillPos: LineupPosition | null;
  standImg?: string | null;
  standDesc?: string | null;
  stand2Img?: string | null;
  stand2Desc?: string | null;
  aimImg?: string | null;
  aimDesc?: string | null;
  aim2Img?: string | null;
  aim2Desc?: string | null;
  landImg?: string | null;
  landDesc?: string | null;
  sourceLink?: string | null;
  authorName?: string | null;
  authorAvatar?: string | null;
  authorUid?: string | null;
  clonedFrom?: string | null;
};

export const toDbPayload = (data: WritableLineup, userId: string): LineupDbPayload => ({
  title: data.title,
  map_name: data.mapName,
  agent_name: data.agentName,
  agent_icon: data.agentIcon || null,
  skill_icon: data.skillIcon || null,
  side: data.side,
  ability_index: data.abilityIndex ?? data.ability_index ?? null,
  agent_pos: data.agentPos,
  skill_pos: data.skillPos,
  stand_img: data.standImg || '',
  stand_desc: data.standDesc || '',
  stand2_img: data.stand2Img || '',
  stand2_desc: data.stand2Desc || '',
  aim_img: data.aimImg || '',
  aim_desc: data.aimDesc || '',
  aim2_img: data.aim2Img || '',
  aim2_desc: data.aim2Desc || '',
  land_img: data.landImg || '',
  land_desc: data.landDesc || '',
  source_link: data.sourceLink || '',
  author_name: data.authorName || null,
  author_avatar: data.authorAvatar || null,
  author_uid: data.authorUid || null,
  user_id: userId,
  cloned_from: data.clonedFrom || null,
});

export const getMapDisplayName = (map: MapOption | null, translations: Record<string, string>) =>
  map ? translations[map.displayName] || map.displayName : '';

export const getMapEnglishName = (displayName: string, translations: Record<string, string>) =>
  Object.keys(translations).find((key) => translations[key] === displayName) || displayName;

export const getAbilityIconSafe = (agent: AgentOption | null, abilityIndex: number | null, getter: any) =>
  agent && abilityIndex !== null ? getter(agent, abilityIndex) : null;
