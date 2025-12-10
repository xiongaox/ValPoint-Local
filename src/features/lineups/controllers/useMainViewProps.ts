import React from 'react';
import MainView from '../MainView';
import { ActiveTab } from '../../../types/app';
import { AgentOption, BaseLineup, LibraryMode, MapOption, NewLineupForm, SharedLineup } from '../../../types/lineup';

type Params = {
  activeTab: ActiveTab;
  selectedMap: MapOption | null;
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
  sharedLineup: SharedLineup | null;
  isActionMenuOpen: boolean;
  onToggleActions: () => void;
  onImageBedConfig: () => void;
  onChangePassword: () => void;
  onClearLineups: () => void;
  pendingTransfers: number;
  libraryMode: LibraryMode;
  setLibraryMode: React.Dispatch<React.SetStateAction<LibraryMode>>;
  handleTabSwitch: (tab: ActiveTab) => void;
  togglePlacingType: (type: 'agent' | 'skill') => void;
  handleOpenEditor: () => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filteredLineups: BaseLineup[];
  selectedLineupIdRight: string | null;
  handleViewLineup: (id: string) => void;
  handleShare: (id: string, e?: any) => void;
  handleRequestDelete: (id: string, e?: any) => void;
  handleClearAll: () => void;
  userId: string | null;
  userMode: 'login' | 'guest';
  customUserIdInput: string;
  setCustomUserIdInput: (v: string) => void;
  handleApplyCustomUserId: () => void;
  handleResetUserId: () => void;
};

export function buildMainViewProps(params: Params): React.ComponentProps<typeof MainView> {
  return {
    activeTab: params.activeTab,
    selectedMap: params.selectedMap,
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
    mapIcon: params.mapIcon,
    mapCover: params.mapCover,
    lineups: params.lineups,
    selectedLineupId: params.selectedLineupId,
    onLineupSelect: params.onLineupSelect,
    newLineupData: params.newLineupData,
    setNewLineupData: params.setNewLineupData,
    placingType: params.placingType,
    setPlacingType: params.setPlacingType,
    onViewLineup: params.onViewLineup,
    isFlipped: params.isFlipped,
    sharedLineup: params.sharedLineup,
    isActionMenuOpen: params.isActionMenuOpen,
    onToggleActions: params.onToggleActions,
    onImageBedConfig: params.onImageBedConfig,
    onChangePassword: params.onChangePassword,
    onClearLineups: params.onClearLineups,
    pendingTransfers: params.pendingTransfers,
    libraryMode: params.libraryMode,
    setLibraryMode: params.setLibraryMode,
    handleTabSwitch: params.handleTabSwitch,
    togglePlacingType: params.togglePlacingType,
    handleOpenEditor: params.handleOpenEditor,
    searchQuery: params.searchQuery,
    setSearchQuery: params.setSearchQuery,
    filteredLineups: params.filteredLineups,
    selectedLineupIdRight: params.selectedLineupIdRight,
    handleViewLineup: params.handleViewLineup,
    handleShare: params.handleShare,
    handleRequestDelete: params.handleRequestDelete,
    handleClearAll: params.handleClearAll,
    userId: params.userId,
    userMode: params.userMode,
    customUserIdInput: params.customUserIdInput,
    setCustomUserIdInput: params.setCustomUserIdInput,
    handleApplyCustomUserId: params.handleApplyCustomUserId,
    handleResetUserId: params.handleResetUserId,
  };
}
