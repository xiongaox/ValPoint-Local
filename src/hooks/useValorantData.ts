/**
 * useValorantData - ValorantData
 *
 * 职责：
 * - 封装ValorantData相关的状态与副作用。
 * - 对外提供稳定的接口与回调。
 * - 处理订阅、清理或缓存等生命周期细节。
 */

import { useEffect, useState } from 'react';
import { AgentData, MapOption } from '../types/lineup';
import { LOCAL_AGENTS } from '../data/localAgents';
import { LOCAL_MAPS } from '../data/localMaps';

export function useValorantData() {
  const [maps, setMaps] = useState<MapOption[]>([]);
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [selectedMap, setSelectedMap] = useState<MapOption | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentData | null>(null);

  useEffect(() => {
    const sortedAgents = [...LOCAL_AGENTS].sort((a, b) => a.displayName.localeCompare(b.displayName));
    setAgents(sortedAgents);
    if (sortedAgents.length > 0) setSelectedAgent(sortedAgents[0]);

    if (LOCAL_MAPS.length > 0) {
      setMaps(LOCAL_MAPS);
      setSelectedMap(LOCAL_MAPS[0]);
    }
  }, []);

  return {
    maps,
    setMaps,
    agents,
    setAgents,
    selectedMap,
    setSelectedMap,
    selectedAgent,
    setSelectedAgent,
  };
}
