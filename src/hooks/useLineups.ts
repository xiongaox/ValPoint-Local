/**
 * useLineups - 点位
 *
 * 职责：
 * - 封装点位相关的状态与副作用。
 * - 对外提供稳定的接口与回调。
 * - 处理订阅、清理或缓存等生命周期细节。
 */

import { useCallback, useState } from 'react';
import { fetchLineupsApi } from '../services/lineups';
import { BaseLineup } from '../types/lineup';

export const useLineups = (mapNameZhToEn: Record<string, string>) => {
  const [lineups, setLineups] = useState<BaseLineup[]>([]);

  const fetchLineups = useCallback(
    async (userId: string | null) => {
      if (!userId) return;
      const list = await fetchLineupsApi(userId, mapNameZhToEn);
      setLineups(list);
    },
    [mapNameZhToEn],
  );

  return { lineups, setLineups, fetchLineups };
};
