import { useMemo } from 'react';
import { CUSTOM_MAP_URLS, MAP_TRANSLATIONS } from '../../../constants/maps';
import { ActiveTab } from '../../../types/app';
import { MapOption, SharedLineup } from '../../../types/lineup';

type MapSide = 'all' | 'attack' | 'defense';

type MapInfoParams = {
  selectedMap: MapOption | null;
  selectedSide: MapSide;
  activeTab: ActiveTab;
  sharedLineup: SharedLineup | null;
};

export function useMapInfo({ selectedMap, selectedSide, activeTab, sharedLineup }: MapInfoParams) {
  const mapNameZhToEn = useMemo<Record<string, string>>(() => {
    const reverse: Record<string, string> = {};
    Object.entries(MAP_TRANSLATIONS).forEach(([en, zh]) => {
      reverse[zh] = en;
    });
    return reverse;
  }, []);

  const getMapDisplayName = (apiMapName: string) => MAP_TRANSLATIONS[apiMapName] || apiMapName;

  const getMapEnglishName = (displayName: string) =>
    Object.keys(MAP_TRANSLATIONS).find((key) => MAP_TRANSLATIONS[key] === displayName) || displayName;

  const mapCoverOverrides: Record<string, string> = {
    Abyss: 'https://game.gtimg.cn/images/val/agamezlk/map/abyss/cover.PNG',
  };

  const getMapUrl = (): string | null => {
    if (activeTab === 'shared' && sharedLineup) {
      const enName = getMapEnglishName(sharedLineup.mapName);
      const config = (CUSTOM_MAP_URLS as Record<string, { attack: string; defense: string }>)[enName];
      if (config) return sharedLineup.side === 'defense' ? config.defense : config.attack;
    }
    if (!selectedMap) return null;
    const config = (CUSTOM_MAP_URLS as Record<string, { attack: string; defense: string }>)[selectedMap.displayName];
    if (config) return selectedSide === 'defense' ? config.defense : config.attack;
    return selectedMap.displayIcon || null;
  };

  const getMapCoverUrl = () => {
    const enName = selectedMap ? getMapEnglishName(selectedMap.displayName) : '';
    const key = enName ? enName.toLowerCase() : '';
    const template = key ? `https://game.gtimg.cn/images/val/agamezlk/map/${key}/cover.PNG` : null;
    return (enName && mapCoverOverrides[enName]) || template || selectedMap?.displayIcon || getMapUrl() || null;
  };

  return {
    mapNameZhToEn,
    getMapDisplayName,
    getMapEnglishName,
    getMapUrl,
    getMapCoverUrl,
  };
}
