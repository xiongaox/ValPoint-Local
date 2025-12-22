import { useMemo } from 'react';
import { CUSTOM_MAP_URLS, MAP_TRANSLATIONS } from '../../../constants/maps';
import { ActiveTab } from '../../../types/app';
import { MapOption, SharedLineup } from '../../../types/lineup';

type MapSide = 'all' | 'attack' | 'defense';

type MapInfoParams = {
  selectedMap: MapOption | null;
  selectedSide: MapSide;
};

export function useMapInfo({ selectedMap, selectedSide }: MapInfoParams) {
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

  const getMapUrl = (): string | null => {
    if (!selectedMap) return null;
    const config = (CUSTOM_MAP_URLS as Record<string, { attack: string; defense: string }>)[selectedMap.displayName];
    if (config) return selectedSide === 'defense' ? config.defense : config.attack;
    return selectedMap.displayIcon || null;
  };

  const getMapCoverUrl = () => {
    return selectedMap?.displayIcon || getMapUrl() || null;
  };

  return {
    mapNameZhToEn,
    getMapDisplayName,
    getMapEnglishName,
    getMapUrl,
    getMapCoverUrl,
  };
}
