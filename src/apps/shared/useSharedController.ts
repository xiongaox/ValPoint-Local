/**
 * useSharedController - 共享库控制器
 * 
 * 职责：
 * - 管理共享库的全部交互状态（地图、特工、筛选、点位列表）
 * - 处理点位打包下载逻辑 (需登录)
 * - 与 Supabase 服务层交互获取公共点位数据 (SharedLineups)
 */
import { useState, useCallback, useMemo, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useValorantData } from '../../hooks/useValorantData';
import { useMapInfo } from '../../features/lineups/controllers/useMapInfo';
import { fetchSharedList } from '../../services/shared';
import { BaseLineup, SharedLineup, AgentOption, MapOption, NewLineupForm } from '../../types/lineup';
import { downloadLineupBundle } from '../../lib/lineupDownload';
import { checkDailyDownloadLimit, incrementDownloadCount, logDownload } from '../../lib/downloadLimit';
import { MAP_TRANSLATIONS } from '../../constants/maps';
import { useIsMobile } from '../../hooks/useIsMobile';
import { createClient } from '@supabase/supabase-js';
import { getSubscriptionList, Subscription, addSubscription, removeSubscription, updateSubscription, reorderSubscription, generateTestSubscriptions } from './logic/subscription';



// ... (component body)

// 重新排序


// ... (inside component)

// 更新订阅


interface UseSharedControllerParams {
    user: User | null; // 可选，支持游客模式
    setAlertMessage: (msg: string | null) => void;
    setViewingImage: (img: { src: string; list?: string[]; index?: number } | null) => void;
    onRequestLogin: () => void; // 下载时请求登录
}

export function useSharedController({ user, setAlertMessage, setViewingImage, onRequestLogin }: UseSharedControllerParams) {
    // 移动端检测
    const isMobile = useIsMobile();

    // 地图数据
    const { maps, agents } = useValorantData();

    // 状态
    const [selectedMap, setSelectedMapState] = useState<MapOption | null>(null);
    const [selectedAgent, setSelectedAgent] = useState<AgentOption | null>(null);
    const [selectedAbilityIndex, setSelectedAbilityIndex] = useState<number | null>(null);
    // 桌面端默认全部，移动端默认进攻
    const [selectedSide, setSelectedSide] = useState<'all' | 'attack' | 'defense'>(() => isMobile ? 'attack' : 'all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [selectedLineupId, setSelectedLineupId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lineups, setLineups] = useState<BaseLineup[]>([]);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    // 点位详情弹窗
    const [viewingLineup, setViewingLineup] = useState<BaseLineup | null>(null);
    // 共享者筛选
    const [selectedSharedUserId, setSelectedSharedUserId] = useState<string | null>(null);
    // 下载状态
    const [isDownloading, setIsDownloading] = useState(false);

    // 新增点位数据（用于地图交互，但共享库不允许创建）
    const [newLineupData, setNewLineupData] = useState<NewLineupForm>({
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
    const [placingType, setPlacingType] = useState<'agent' | 'skill' | null>(null);

    // 创建地图名称中英对照表
    const mapNameZhToEn = useMemo<Record<string, string>>(() => {
        const reverse: Record<string, string> = {};
        Object.entries(MAP_TRANSLATIONS).forEach(([en, zh]) => {
            reverse[zh] = en;
        });
        return reverse;
    }, []);

    // 获取选中的点位
    const selectedLineup = useMemo(() => {
        return lineups.find((l) => l.id === selectedLineupId) || null;
    }, [lineups, selectedLineupId]) as SharedLineup | null;

    // 使用 useMapInfo 获取地图相关方法
    const { getMapDisplayName, getMapEnglishName, getMapUrl, getMapCoverUrl } = useMapInfo({
        selectedMap,
        selectedSide,
    });

    // 初始化默认地图（使用列表第一个）
    useEffect(() => {
        if (maps.length > 0 && !selectedMap) {
            setSelectedMapState(maps[0]);
        }
    }, [maps, selectedMap]);

    // 标记是否已完成首次英雄初始化
    const [hasInitializedAgent, setHasInitializedAgent] = useState(false);

    // 首次加载时默认选择第一个英雄，但用户点击"显示全部"后不再自动选择
    useEffect(() => {
        if (agents.length > 0 && !selectedAgent && !hasInitializedAgent) {
            setSelectedAgent(agents[0]);
            setHasInitializedAgent(true);
        }
    }, [agents, selectedAgent, hasInitializedAgent]);


    // 订阅管理状态
    const [subscriptions, setSubscriptions] = useState<Subscription[]>(getSubscriptionList());
    const [currentSubscription, setCurrentSubscription] = useState<Subscription>(subscriptions[0]); // Default to local

    // 动态创建 Client
    const activeClient = useMemo(() => {
        if (currentSubscription.id === 'local') {
            // 使用默认的 shared client (services/shared.ts 里引用的那个, 但这里 fetchSharedList 会默认用它，所以传 undefined 也行，或者我们需要从 supabaseClient 导出它)
            // 为了简单，我们让 service 默认值生效。但 fetchSharedList(..., client) 需要传参数。
            // 实际上 services/shared.ts 里的 shareSupabase 是全局单例。
            return undefined;
        }
        // 创建新的 Client
        return createClient(currentSubscription.api.supabaseUrl, currentSubscription.api.supabaseAnonKey);
    }, [currentSubscription]);

    // 刷新订阅列表
    const refreshSubscriptions = useCallback(() => {
        setSubscriptions(getSubscriptionList());
    }, []);

    // 切换订阅
    const handleSetSubscription = useCallback((sub: Subscription) => {
        setCurrentSubscription(sub);
        // 切换后自动清理旧数据，等待新加载
        setLineups([]);
    }, []);

    // 添加订阅
    const handleAddSubscription = useCallback((sub: Subscription) => {
        try {
            addSubscription(sub);
            refreshSubscriptions();
            setAlertMessage(`已订阅: ${sub.name}`);
        } catch (e: any) {
            setAlertMessage(e.message);
        }
    }, [refreshSubscriptions, setAlertMessage]);

    // 删除订阅
    const handleRemoveSubscription = useCallback((id: string) => {
        if (id === currentSubscription.id) {
            // 如果删除了当前选中的，切换回默认
            setCurrentSubscription(subscriptions[0]);
        }
        removeSubscription(id);
        refreshSubscriptions();
    }, [currentSubscription, subscriptions, refreshSubscriptions]);

    // 更新订阅
    const handleUpdateSubscription = useCallback((sub: Subscription) => {
        try {
            updateSubscription(sub);
            refreshSubscriptions();
            setAlertMessage(`已更新: ${sub.name}`);

            // 如果更新的是当前订阅，需要刷新状态
            if (currentSubscription.id === sub.id) {
                setCurrentSubscription(sub);
            }
        } catch (e: any) {
            setAlertMessage(e.message);
        }
    }, [refreshSubscriptions, setAlertMessage, currentSubscription]);

    // 重新排序
    const handleReorderSubscription = useCallback((id: string, direction: 'up' | 'down') => {
        reorderSubscription(id, direction);
        refreshSubscriptions();
    }, [refreshSubscriptions]);

    // 生成测试数据
    const handleGenerateTestSubscriptions = useCallback(() => {
        generateTestSubscriptions();
        refreshSubscriptions();
        setAlertMessage('已生成 10 条测试数据');
    }, [refreshSubscriptions, setAlertMessage]);

    // ... (maps, agents state...)

    // 加载共享库点位
    const loadLineups = useCallback(async () => {
        setIsLoading(true);
        try {
            // activeClient 为 undefined 时，fetchSharedList 会使用默认的 client
            // @ts-ignore activeClient 类型推断可能有细微差别，但 SupabaseClient 兼容
            const data = await fetchSharedList(mapNameZhToEn, activeClient);
            setLineups(data || []);
        } catch (err) {
            console.error('加载共享点位失败:', err);
            setAlertMessage('加载点位失败: 连接订阅源出错');
            setLineups([]);
        } finally {
            setIsLoading(false);
        }
    }, [mapNameZhToEn, setAlertMessage, activeClient]);

    // 监听订阅变化自动加载
    useEffect(() => {
        loadLineups();
    }, [loadLineups]); // loadLineups depends on activeClient -> currentSubscription


    // 手动过滤点位（包括共享者筛选）
    const filteredLineups = useMemo(() => {
        if (!selectedMap) return [];
        const mapKey = selectedMap.displayName;
        const mapKeyEn = mapNameZhToEn[mapKey] || mapKey;

        return lineups.filter((l) => {
            const mapMatch = l.mapName === mapKey || l.mapName === mapKeyEn;
            const agentMatch = !selectedAgent || l.agentName === selectedAgent.displayName;
            const sideMatch = selectedSide === 'all' || l.side === selectedSide;
            const abilityMatch = selectedAbilityIndex === null || l.abilityIndex === selectedAbilityIndex;
            const searchMatch = !searchQuery || l.title.toLowerCase().includes(searchQuery.toLowerCase());
            // 共享者筛选
            const userMatch = !selectedSharedUserId || l.userId === selectedSharedUserId;
            return mapMatch && agentMatch && sideMatch && abilityMatch && searchMatch && userMatch;
        });
    }, [lineups, selectedMap, selectedAgent, selectedSide, selectedAbilityIndex, searchQuery, selectedSharedUserId, mapNameZhToEn]);

    // 获取所有共享者列表
    const contributors = useMemo(() => {
        const userIds = lineups.map((l) => l.userId).filter(Boolean) as string[];
        return Array.from(new Set(userIds));
    }, [lineups]);

    // 计算每个特工的点位数量
    const agentCounts = useMemo(() => {
        if (!selectedMap) return {};
        const mapKey = selectedMap.displayName;
        const mapKeyEn = mapNameZhToEn[mapKey] || mapKey;
        const counts: Record<string, number> = {};

        lineups.forEach((l) => {
            if (l.mapName !== mapKey && l.mapName !== mapKeyEn) return;
            counts[l.agentName] = (counts[l.agentName] || 0) + 1;
        });
        return counts;
    }, [lineups, selectedMap, mapNameZhToEn]);

    // 获取地图 URL（需要依赖 selectedSide 以便攻防切换时更新）
    const mapIcon = useMemo(() => {
        return getMapUrl();
    }, [getMapUrl, selectedSide]);

    const mapCover = useMemo(() => {
        return getMapCoverUrl();
    }, [getMapCoverUrl, selectedSide]);

    // 选择地图
    const handleSelectMap = useCallback((map: MapOption) => {
        setSelectedMapState(map);
        setSelectedLineupId(null);
        // 切换地图时自动选择默认特工（第一个）
        if (agents.length > 0) {
            setSelectedAgent(agents[0]);
        } else {
            setSelectedAgent(null);
        }
        setIsMapModalOpen(false);
    }, [agents]);

    // 查看点位详情（打开弹窗）
    const handleViewLineup = useCallback((id: string) => {
        setSelectedLineupId(id);
        const lineup = lineups.find((l) => l.id === id);
        if (lineup) {
            setViewingLineup(lineup);
        }
    }, [lineups]);

    // 关闭点位详情弹窗（同时清除选中状态）
    const handleViewerClose = useCallback(() => {
        setViewingLineup(null);
        setSelectedLineupId(null);  // 清除选中，消除蚂蚁线连接
    }, []);

    // 下载点位 - 需要登录，下载 ZIP 包
    const handleDownload = useCallback(async (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();

        // 检查是否登录
        if (!user) {
            setAlertMessage('下载点位需要登录，请先登录');
            onRequestLogin();
            return;
        }

        const target = lineups.find((l) => l.id === id);
        if (!target) return;

        if (isDownloading) return;

        // 检查下载限制
        const { allowed, limit, remaining } = await checkDailyDownloadLimit(user.id);
        if (!allowed) {
            setAlertMessage(`今日下载次数已达上限 (${limit}次)，请明天再试`);
            return;
        }

        try {
            setIsDownloading(true);
            setAlertMessage('正在打包点位数据，请稍候...');

            const result = await downloadLineupBundle(target);

            // 记录下载次数和日志
            await incrementDownloadCount(user.id);
            await logDownload({
                userId: user.id,
                userEmail: user.email || '',
                lineupId: target.id,
                lineupTitle: target.title,
                mapName: target.mapName, // SharedLineup 使用 mapName
                agentName: target.agentName, // SharedLineup 使用 agentName
            });

            if (result.failedImages.length > 0) {
                setAlertMessage('部分图片下载失败，但数据包已生成');
            } else {
                setAlertMessage('打包下载成功');
            }
        } catch (err) {
            console.error('下载失败', err);
            setAlertMessage('打包下载失败，请稍后重试');
        } finally {
            setIsDownloading(false);
        }
    }, [lineups, setAlertMessage, user, onRequestLogin, isDownloading]);

    return {
        // 状态
        isLoading,
        isDownloading,
        user,

        // 地图
        maps,
        selectedMap,
        setSelectedMap: handleSelectMap,
        isMapModalOpen,
        setIsMapModalOpen,
        mapIcon,
        mapCover,
        getMapDisplayName,
        getMapEnglishName,

        // 特工
        agents,
        selectedAgent,
        setSelectedAgent,
        selectedAbilityIndex,
        setSelectedAbilityIndex,
        agentCounts,

        // 筛选
        selectedSide,
        setSelectedSide,
        searchQuery,
        setSearchQuery,
        isFilterModalOpen,
        setIsFilterModalOpen,

        // 点位
        lineups,
        filteredLineups,
        selectedLineupId,
        setSelectedLineupId,
        selectedLineup,
        handleViewLineup,
        handleDownload,
        // 点位详情弹窗
        viewingLineup,
        setViewingLineup,
        handleViewerClose,
        // 共享者筛选
        contributors,
        selectedSharedUserId,
        setSelectedSharedUserId,

        // 地图交互（只读模式）
        newLineupData,
        setNewLineupData,
        placingType,
        // 适配器函数，将 string | null 转换为正确的类型
        setPlacingType: (val: string | null) => {
            setPlacingType(val as 'agent' | 'skill' | null);
        },

        // 图片查看
        setViewingImage,

        // 订阅管理
        subscriptions,
        currentSubscription,
        setSubscription: handleSetSubscription,
        addSubscription: handleAddSubscription,
        removeSubscription: handleRemoveSubscription,
        updateSubscription: handleUpdateSubscription,
        reorderSubscription: handleReorderSubscription,
        generateTestSubscriptions: handleGenerateTestSubscriptions,
    };
}
