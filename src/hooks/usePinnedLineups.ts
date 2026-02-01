/**
 * usePinnedLineups - 本地置顶功能
 * 基于 localStorage 实现点位置顶排序逻辑
 */

import { useMemo, useCallback, useState, useEffect } from 'react';
import { BaseLineup } from '../types/lineup';

interface UsePinnedLineupsOptions {
    userId: string | null;
    lineups: BaseLineup[];
}

export function usePinnedLineups({ userId, lineups }: UsePinnedLineupsOptions) {
    const [pinnedLineupIds, setPinnedLineupIds] = useState<string[]>([]);

    // 从 localStorage 加载置顶数据
    useEffect(() => {
        try {
            const stored = localStorage.getItem('valpoint_pinned_lineups');
            if (stored) {
                setPinnedLineupIds(JSON.parse(stored));
            }
        } catch {
            // ignore
        }
    }, []);

    // 保存到 localStorage
    useEffect(() => {
        localStorage.setItem('valpoint_pinned_lineups', JSON.stringify(pinnedLineupIds));
    }, [pinnedLineupIds]);

    const togglePinnedLineup = useCallback((id: string) => {
        setPinnedLineupIds(prev => {
            if (prev.includes(id)) {
                return prev.filter(p => p !== id);
            }
            return [...prev, id];
        });
    }, []);

    const orderedLineups = useMemo(() => {
        const pinned = lineups.filter(l => pinnedLineupIds.includes(l.id));
        const unpinned = lineups.filter(l => !pinnedLineupIds.includes(l.id));
        return [...pinned, ...unpinned];
    }, [lineups, pinnedLineupIds]);

    return {
        pinnedLineupIds,
        togglePinnedLineup,
        orderedLineups,
    };
}
