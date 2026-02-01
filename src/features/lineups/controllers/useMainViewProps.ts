/**
 * useMainViewProps - 点位主视图Props
 *
 * 职责：
 * - 封装点位主视图Props相关的状态与副作用。
 * - 对外提供稳定的接口与回调。
 * - 处理订阅、清理或缓存等生命周期细节。
 */

import React from 'react';
import MainView from '../MainView';
import { ActiveTab } from '../../../types/app';
import { AgentOption, BaseLineup, MapOption, NewLineupForm } from '../../../types/lineup';

type Params = {
  activeTab: ActiveTab;
  selectedMap: MapOption | null;
  setSelectedMap: (map: MapOption | null) => void; // 说明：用于移动端地图选择。
  maps: MapOption[]; // 说明：移动端地图列表。
  setIsMapModalOpen: (v: boolean) => void;
  selectedSide: 'all' | 'attack' | 'defense';
  setSelectedSide: React.Dispatch<React.SetStateAction<'all' | 'attack' | 'defense'>>;
  selectedAgent: AgentOption | null;
  setSelectedAgent: (v: AgentOption | null) => void;
  agents: AgentOption[];
  agentCounts: Record<string, number>;
  selectedAbilityIndex: number | null;
  setSelectedAbilityIndex: (v: number | null) => void;
  setIsPreviewModalOpen: (v: boolean) => void;
  setIsImportModalOpen: (v: boolean) => void;
  getMapDisplayName: (name: string) => string;
  openChangelog: () => void;
  mapIcon: string | null;
  mapCover: string | null;
  lineups: BaseLineup[];
  selectedLineupId: string | null;
  onLineupSelect: (id: string | null) => void;
  newLineupData: NewLineupForm;
  setNewLineupData: (fn: (prev: NewLineupForm) => NewLineupForm) => void;
  placingType: 'agent' | 'skill' | null;
  setPlacingType: React.Dispatch<React.SetStateAction<'agent' | 'skill' | null>>;
  onViewLineup: (id: string) => void;
  isFlipped: boolean;
  isActionMenuOpen: boolean;
  onToggleActions: () => void;
  handleTabSwitch: (tab: ActiveTab) => void;
  togglePlacingType: (type: 'agent' | 'skill') => void;
  handleOpenEditor: () => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filteredLineups: BaseLineup[];
  selectedLineupIdRight: string | null;
  handleViewLineup: (id: string) => void;
  handleDownload: (id: string, e?: React.MouseEvent) => void;
  handleRequestDelete: (id: string, e?: React.MouseEvent) => void;
  handleClearAll: () => void;
  setSelectedLineupId: React.Dispatch<React.SetStateAction<string | null>>;
  setViewingLineup: React.Dispatch<React.SetStateAction<BaseLineup | null>>;
  userId: string | null;
  pinnedLineupIds: string[];
  onTogglePinLineup: (id: string) => void;
  hideSharedButton?: boolean;
  hideAuthorLinks?: boolean;
  onBatchDownload: () => void;
  canBatchDownload?: boolean;
  onReset?: () => void;
};

export function buildMainViewProps(params: Params): React.ComponentProps<typeof MainView> {
  return {
    activeTab: params.activeTab,

    clearSelection: () => {
      params.setSelectedLineupId(null);
      params.setViewingLineup(null);
    },
    left: {
      activeTab: params.activeTab,
      selectedMap: params.selectedMap,
      setSelectedMap: params.setSelectedMap, // 说明：用于移动端地图选择。
      maps: params.maps, // 说明：移动端地图列表。
      setIsMapModalOpen: params.setIsMapModalOpen,
      selectedSide: params.selectedSide,
      setSelectedSide: params.setSelectedSide,
      selectedAgent: params.selectedAgent,
      setSelectedAgent: params.setSelectedAgent,
      agents: params.agents,
      agentCounts: params.agentCounts,
      selectedAbilityIndex: params.selectedAbilityIndex,
      setSelectedAbilityIndex: params.setSelectedAbilityIndex,
      setIsPreviewModalOpen: params.setIsPreviewModalOpen,
      getMapDisplayName: params.getMapDisplayName,
      openChangelog: params.openChangelog,
      onReset: params.onReset,
    },
    map: {
      activeTab: params.activeTab,
      mapIcon: params.mapIcon,
      mapCover: params.mapCover,
      lineups: params.lineups,
      selectedLineupId: params.selectedLineupId,
      onLineupSelect: params.onLineupSelect,
      newLineupData: params.newLineupData,
      setNewLineupData: params.setNewLineupData,
      placingType: params.placingType,
      setPlacingType: params.setPlacingType,
      selectedAgent: params.selectedAgent,
      selectedAbilityIndex: params.selectedAbilityIndex,
      onViewLineup: params.onViewLineup,
      isFlipped: params.isFlipped,

    },
    quickActions: {
      isOpen: params.isActionMenuOpen,
      onToggle: params.onToggleActions,
      onBatchDownload: params.onBatchDownload,
      canBatchDownload: params.canBatchDownload,
    },
    right: {
      activeTab: params.activeTab,
      handleTabSwitch: params.handleTabSwitch,
      selectedSide: params.selectedSide,
      setSelectedSide: params.setSelectedSide,
      placingType: params.placingType,
      togglePlacingType: params.togglePlacingType,
      newLineupData: params.newLineupData,
      handleOpenEditor: params.handleOpenEditor,
      searchQuery: params.searchQuery,
      setSearchQuery: params.setSearchQuery,
      filteredLineups: params.filteredLineups,
      selectedLineupId: params.selectedLineupIdRight,
      handleViewLineup: params.handleViewLineup,
      handleDownload: params.handleDownload,
      handleRequestDelete: params.handleRequestDelete,
      handleClearAll: params.handleClearAll,
      getMapDisplayName: params.getMapDisplayName,
      onOpenImportModal: () => params.setIsImportModalOpen(true),
      userId: params.userId,
      pinnedLineupIds: params.pinnedLineupIds,
      onTogglePinLineup: params.onTogglePinLineup,
    },
    hideSharedButton: params.hideSharedButton,
    hideAuthorLinks: params.hideAuthorLinks,
  };
}
