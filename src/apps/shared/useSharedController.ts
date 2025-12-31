/**
 * useSharedController - 共享库控制器
 *
 * 职责：
 * - 封装共享库控制器相关的状态与副作用。
 * - 对外提供稳定的接口与回调。
 * - 处理订阅、清理或缓存等生命周期细节。
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
import { getSubscriptionList, Subscription, addSubscription, removeSubscription, updateSubscription, reorderSubscription } from './logic/subscription';
import { fetchUserSubscriptions, updateUserSubscriptions } from '../../services/userProfile';


interface UseSharedControllerParams {
    user: User | null; // 说明：可选，支持游客模式。
    setAlertMessage: (msg: string | null) => void;
    setViewingImage: (img: { src: string; list?: string[]; index?: number } | null) => void;
    onRequestLogin: () => void; // 说明：下载受限内容时提示登录。
}

export function useSharedController({ user, setAlertMessage, setViewingImage, onRequestLogin }: UseSharedControllerParams) {
    const isMobile = useIsMobile();

    const { maps, agents } = useValorantData();

    const [selectedMap, setSelectedMapState] = useState<MapOption | null>(null);
    const [selectedAgent, setSelectedAgent] = useState<AgentOption | null>(null);
    const [selectedAbilityIndex, setSelectedAbilityIndex] = useState<number | null>(null);
    const [selectedSide, setSelectedSide] = useState<'all' | 'attack' | 'defense'>(() => isMobile ? 'attack' : 'all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [selectedLineupId, setSelectedLineupId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [lineups, setLineups] = useState<BaseLineup[]>([]);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [viewingLineup, setViewingLineup] = useState<BaseLineup | null>(null);
    const [selectedSharedUserId, setSelectedSharedUserId] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

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

    const [subscriptions, setSubscriptions] = useState<Subscription[]>(getSubscriptionList());
    const [currentSubscription, setCurrentSubscription] = useState<Subscription>(subscriptions[0]); // 说明：默认使用本地订阅。

    useEffect(() => {
        if (!user) return;

        const syncSubscriptions = async () => {
            try {
                const cloudSubs = await fetchUserSubscriptions(user.id);
                const localSubs = getSubscriptionList().filter(s => s.id !== 'local');

                if (cloudSubs.length === 0 && localSubs.length > 0) {
                    await updateUserSubscriptions(user.id, localSubs);
                }
                else if (cloudSubs.length > 0) {
                    const merged = [getSubscriptionList()[0], ...cloudSubs];

                    localStorage.setItem('valpoint_subscriptions', JSON.stringify(cloudSubs));

                    setSubscriptions(merged);

                    if (currentSubscription.id !== 'local' && !cloudSubs.find(s => s.id === currentSubscription.id)) {
                        setCurrentSubscription(merged[0]);
                    }
                }
            } catch (err) {
                console.error('Subscription sync failed:', err);
            }
        };

        syncSubscriptions();
    }, [user]); // 说明：登录后重新执行。

    const syncToCloud = useCallback(async () => {
        if (!user) return;
        const currentList = getSubscriptionList().filter(s => s.id !== 'local');
        try {
            await updateUserSubscriptions(user.id, currentList);
        } catch (e) {
            console.error('Failed to sync to cloud', e);
        }
    }, [user]);

    const activeClient = useMemo(() => {
        if (currentSubscription.id === 'local' || currentSubscription.mode === 'redirect' || !currentSubscription.api) {
            return undefined;
        }
        return createClient(currentSubscription.api.supabaseUrl, currentSubscription.api.supabaseAnonKey);
    }, [currentSubscription]);

    const mapNameZhToEn = useMemo<Record<string, string>>(() => {
        const reverse: Record<string, string> = {};
        Object.entries(MAP_TRANSLATIONS).forEach(([en, zh]) => {
            reverse[zh] = en;
        });
        return reverse;
    }, []);

    const selectedLineup = useMemo(() => {
        return lineups.find((l) => l.id === selectedLineupId) || null;
    }, [lineups, selectedLineupId]) as SharedLineup | null;

    const { getMapDisplayName, getMapEnglishName, getMapUrl, getMapCoverUrl } = useMapInfo({
        selectedMap,
        selectedSide,
    });

    useEffect(() => {
        if (maps.length > 0 && !selectedMap) {
            setSelectedMapState(maps[0]);
        }
    }, [maps, selectedMap]);

    const [hasInitializedAgent, setHasInitializedAgent] = useState(false);

    useEffect(() => {
        if (agents.length > 0 && !selectedAgent && !hasInitializedAgent) {
            setSelectedAgent(agents[0]);
            setHasInitializedAgent(true);
        }
    }, [agents, selectedAgent, hasInitializedAgent]);

    const refreshSubscriptions = useCallback(() => {
        const list = getSubscriptionList();
        setSubscriptions(list);
        syncToCloud(); // 说明：触发后台同步。
    }, [syncToCloud]);

    const handleSetSubscription = useCallback((sub: Subscription) => {
        if (sub.mode === 'redirect') {
            window.open(sub.url, '_blank', 'noopener,noreferrer');
            return;
        }
        setCurrentSubscription(sub);
        setLineups([]);
    }, []);

    const handleAddSubscription = useCallback((sub: Subscription) => {
        try {
            addSubscription(sub);
            refreshSubscriptions();
        } catch (e: any) {
            setAlertMessage(e.message);
        }
    }, [refreshSubscriptions, setAlertMessage]);

    const handleRemoveSubscription = useCallback((id: string) => {
        if (id === currentSubscription.id) {
            setCurrentSubscription(subscriptions[0]);
        }
        removeSubscription(id);
        refreshSubscriptions();
    }, [currentSubscription, subscriptions, refreshSubscriptions]);

    const handleUpdateSubscription = useCallback((sub: Subscription) => {
        try {
            updateSubscription(sub);
            refreshSubscriptions();

            if (currentSubscription.id === sub.id) {
                setCurrentSubscription(sub);
            }
        } catch (e: any) {
            setAlertMessage(e.message);
        }
    }, [refreshSubscriptions, setAlertMessage, currentSubscription]);

    const handleReorderSubscription = useCallback((id: string, direction: 'up' | 'down') => {
        reorderSubscription(id, direction);
        refreshSubscriptions();
    }, [refreshSubscriptions]);




    const loadLineups = useCallback(async () => {
        setIsLoading(true);
        try {
            // @ts-ignore
            // 说明：activeClient 类型推断存在差异，但与 SupabaseClient 兼容。
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

    useEffect(() => {
        loadLineups();
    }, [loadLineups]); // 说明：依赖 currentSubscription 影响 activeClient。


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
            const userMatch = !selectedSharedUserId || l.userId === selectedSharedUserId;
            return mapMatch && agentMatch && sideMatch && abilityMatch && searchMatch && userMatch;
        });
    }, [lineups, selectedMap, selectedAgent, selectedSide, selectedAbilityIndex, searchQuery, selectedSharedUserId, mapNameZhToEn]);

    const contributors = useMemo(() => {
        const userIds = lineups.map((l) => l.userId).filter(Boolean) as string[];
        return Array.from(new Set(userIds));
    }, [lineups]);

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

    const mapIcon = useMemo(() => {
        return getMapUrl();
    }, [getMapUrl, selectedSide]);

    const mapCover = useMemo(() => {
        return getMapCoverUrl();
    }, [getMapCoverUrl, selectedSide]);

    const handleSelectMap = useCallback((map: MapOption) => {
        setSelectedMapState(map);
        setSelectedLineupId(null);
        if (agents.length > 0) {
            setSelectedAgent(agents[0]);
        } else {
            setSelectedAgent(null);
        }
        setIsMapModalOpen(false);
    }, [agents]);

    const handleViewLineup = useCallback((id: string) => {
        setSelectedLineupId(id);
        const lineup = lineups.find((l) => l.id === id);
        if (lineup) {
            setViewingLineup(lineup);
        }
    }, [lineups]);

    const handleViewerClose = useCallback(() => {
        setViewingLineup(null);
        setSelectedLineupId(null); // 说明：清除选中以移除连线。
    }, []);

    const handleDownload = useCallback(async (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();

        if (!user) {
            setAlertMessage('下载点位需要登录，请先登录');
            onRequestLogin();
            return;
        }

        const target = lineups.find((l) => l.id === id);
        if (!target) return;

        if (isDownloading) return;

        const { allowed, limit, remaining } = await checkDailyDownloadLimit(user.id);
        if (!allowed) {
            setAlertMessage(`今日下载次数已达上限 (${limit}次)，请明天再试`);
            return;
        }

        try {
            setIsDownloading(true);
            setAlertMessage('正在打包点位数据，请稍候...');

            const result = await downloadLineupBundle(target);

            await incrementDownloadCount(user.id);
            await logDownload({
                userId: user.id,
                userEmail: user.email || '',
                lineupId: target.id,
                lineupTitle: target.title,
                mapName: target.mapName, // 说明：SharedLineup 使用 mapName。
                agentName: target.agentName, // 说明：SharedLineup 使用 agentName。
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
        isLoading,
        isDownloading,
        user,

        maps,
        selectedMap,
        setSelectedMap: handleSelectMap,
        isMapModalOpen,
        setIsMapModalOpen,
        mapIcon,
        mapCover,
        getMapDisplayName,
        getMapEnglishName,

        agents,
        selectedAgent,
        setSelectedAgent,
        selectedAbilityIndex,
        setSelectedAbilityIndex,
        agentCounts,

        selectedSide,
        setSelectedSide,
        searchQuery,
        setSearchQuery,
        isFilterModalOpen,
        setIsFilterModalOpen,

        lineups,
        filteredLineups,
        selectedLineupId,
        setSelectedLineupId,
        selectedLineup,
        handleViewLineup,
        handleDownload,
        viewingLineup,
        setViewingLineup,
        handleViewerClose,
        contributors,
        selectedSharedUserId,
        setSelectedSharedUserId,

        newLineupData,
        setNewLineupData,
        placingType,
        setPlacingType: (val: string | null) => {
            setPlacingType(val as 'agent' | 'skill' | null);
        },

        setViewingImage,

        subscriptions,
        currentSubscription,
        setSubscription: handleSetSubscription,
        addSubscription: handleAddSubscription,
        removeSubscription: handleRemoveSubscription,
        updateSubscription: handleUpdateSubscription,
        reorderSubscription: handleReorderSubscription,

    };
}