/**
 * usePinnedLineups.ts - 点位收藏/置顶管理 Hook
 * 
 * 职责：
 * - 维护用户收藏的点位 ID 列表
 * - 实现点位的置顶切换逻辑 (Supabase user_profiles 表)
 * - 自动同步：本地 LocalStorage -> 云端数据库 (迁移)
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BaseLineup } from '../types/lineup';
import { supabase } from '../supabaseClient';

type Params = {
  userId: string | null;
  lineups: BaseLineup[];
};

const STORAGE_KEY = 'valpoint_pinned_lineups';

export function usePinnedLineups({ userId, lineups }: Params) {
  const [pinnedLineupIds, setPinnedLineupIds] = useState<string[]>([]);
  const [isMigrating, setIsMigrating] = useState(false);

  // 1. 初始化加载 & 迁移逻辑
  useEffect(() => {
    if (!userId) {
      setPinnedLineupIds([]);
      return;
    }

    let isMounted = true;

    async function loadAndMigrate() {
      try {
        // A. 从 Supabase 获取当前置顶
        const { data, error } = await supabase
          .from('user_profiles')
          .select('pinned_lineup_ids')
          .eq('id', userId)
          .single();

        if (error) throw error;

        const dbPins: string[] = data?.pinned_lineup_ids || [];

        // B. 检查本地缓存 (迁移逻辑)
        // 如果数据库为空，但本地有数据，则执行迁移
        const rawLocal = localStorage.getItem(STORAGE_KEY);
        const localStore = rawLocal ? JSON.parse(rawLocal) : {};
        // 确保 userId 存在
        const localPins = userId ? (localStore[userId] || []) : [];

        if (dbPins.length === 0 && localPins.length > 0 && userId) {
          if (isMounted) setIsMigrating(true);
          console.log('[PinnedLineups] Detected local pins, migrating to DB...', localPins);

          // 执行上传
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ pinned_lineup_ids: localPins })
            .eq('id', userId);

          if (!updateError) {
            console.log('[PinnedLineups] Migration successful.');
            if (isMounted) setPinnedLineupIds(localPins);
            // 清理已迁移的本地数据
            delete localStore[userId];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(localStore));
          } else {
            console.error('[PinnedLineups] Migration failed:', updateError);
          }
        } else {
          // 正常加载数据库数据
          if (isMounted) setPinnedLineupIds(dbPins);
        }
      } catch (err) {
        console.error('[PinnedLineups] Load error:', err);
      } finally {
        if (isMounted) setIsMigrating(false);
      }
    }

    loadAndMigrate();

    return () => {
      isMounted = false;
    };
  }, [userId]);


  // 2. 切换置顶 (乐观 UI + 数据库更新)
  const togglePinnedLineup = useCallback(
    async (id: string) => {
      if (!userId) return;

      // 乐观更新
      setPinnedLineupIds((prev) => {
        const next = prev.includes(id)
          ? prev.filter((x) => x !== id)
          : [id, ...prev.filter((x) => x !== id)]; // 新置顶排在前面

        // 异步更新数据库
        supabase
          .from('user_profiles')
          .update({ pinned_lineup_ids: next })
          .eq('id', userId)
          .then(({ error }) => {
            if (error) {
              console.error('[PinnedLineups] Update failed, rolling back.', error);
              // 回滚 (可选，简单场景下暂不回滚以避免跳动，依赖下一次 fetch)
            }
          });

        return next;
      });
    },
    [userId],
  );

  const orderedLineups = useMemo(() => {
    if (!lineups.length) return [];
    const orderMap = lineups.reduce<Record<string, number>>((acc, curr, idx) => {
      acc[curr.id] = idx;
      return acc;
    }, {});
    return [...lineups].sort((a, b) => {
      const aPinned = pinnedLineupIds.includes(a.id);
      const bPinned = pinnedLineupIds.includes(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return orderMap[a.id] - orderMap[b.id];
    });
  }, [lineups, pinnedLineupIds]);

  const isPinned = useCallback((id: string) => pinnedLineupIds.includes(id), [pinnedLineupIds]);

  return { pinnedLineupIds, togglePinnedLineup, isPinned, orderedLineups, isMigrating };
}
