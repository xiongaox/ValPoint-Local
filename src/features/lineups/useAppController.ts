/**
 * useAppController - 点位应用控制器
 *
 * 职责：
 * - 封装点位应用控制器相关的状态与副作用。
 * - 对外提供稳定的接口与回调。
 * - 处理订阅、清理或缓存等生命周期细节。
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useLineups } from '../../hooks/useLineups';
import { useLineupActions } from '../../hooks/useLineupActions';
import { useValorantData } from '../../hooks/useValorantData';
import { useLineupFiltering } from '../../hooks/useLineupFiltering';
import { useModalState } from '../../hooks/useModalState';
import { usePinnedLineups } from '../../hooks/usePinnedLineups';
import { useLineupDownload } from '../../hooks/useLineupDownload';
import { AgentOption, BaseLineup, MapOption } from '../../types/lineup';
import { useMapInfo } from './controllers/useMapInfo';
import { useActionMenu } from './controllers/useActionMenu';
import { useAppLifecycle } from './controllers/useAppLifecycle';
import { useEditorController } from './controllers/useEditorController';
import { useDeletionController } from './controllers/useDeletionController';
import { useViewController } from './controllers/useViewController';
import { buildMainViewProps } from './controllers/useMainViewProps';
import { buildModalProps } from './controllers/useModalProps';
import { buildUiProps } from './controllers/useUiProps';
import { useAppState } from './controllers/useAppState';
import { useUserProfile } from '../../hooks/useUserProfile';

const DEFAULT_PINNED_COUNT = 8;

export function useAppController() {
  const {
    activeTab,
    setActiveTab,
    selectedSide,
    setSelectedSide,
    selectedAbilityIndex,
    setSelectedAbilityIndex,
    searchQuery,
    setSearchQuery,
    selectedLineupId,
    setSelectedLineupId,
    viewingLineup,
    setViewingLineup,
    editingLineupId,
    setEditingLineupId,
    newLineupData,
    setNewLineupData,
    placingType,
    setPlacingType,
  } = useAppState();

  const { maps, agents, selectedMap, setSelectedMap, selectedAgent, setSelectedAgent } = useValorantData();
  const modal = useModalState();
  const { mapNameZhToEn, getMapDisplayName, getMapEnglishName, getMapUrl, getMapCoverUrl } = useMapInfo({
    selectedMap,
    selectedSide,
  });

  // URL State Initialization & Sync
  const [hasInitializedMap, setHasInitializedMap] = useState(false);
  const [hasInitializedAgent, setHasInitializedAgent] = useState(false);

  // 1. Initialize Map from URL
  useEffect(() => {
    if (maps.length > 0 && !hasInitializedMap) {
      const params = new URLSearchParams(window.location.search);
      const mapName = params.get('map');
      if (mapName) {
        const targetMap = maps.find(m => m.displayName === mapName);
        if (targetMap) setSelectedMap(targetMap);
      } else {
        // Default to first map if not set? 
        // useValorantData might already default to first map.
        // If generic default is applied, we don't need to force it unless we want strict URL sync.
      }
      setHasInitializedMap(true);
    }
  }, [maps, hasInitializedMap, setSelectedMap]);

  // 2. Initialize Agent from URL
  useEffect(() => {
    if (agents.length > 0 && !hasInitializedAgent) {
      const params = new URLSearchParams(window.location.search);
      const agentName = params.get('agent');
      if (agentName) {
        const targetAgent = agents.find(a => a.displayName === agentName);
        if (targetAgent) setSelectedAgent(targetAgent);
      }
      setHasInitializedAgent(true);
    }
  }, [agents, hasInitializedAgent, setSelectedAgent]);

  // 3. Sync State to URL
  useEffect(() => {
    if (!hasInitializedMap || !hasInitializedAgent) return;

    const params = new URLSearchParams(window.location.search);
    let changed = false;

    if (selectedMap && params.get('map') !== selectedMap.displayName) {
      params.set('map', selectedMap.displayName);
      changed = true;
    }

    if (selectedAgent && params.get('agent') !== selectedAgent.displayName) {
      params.set('agent', selectedAgent.displayName);
      changed = true;
    }

    if (selectedLineupId && params.get('lineup') !== selectedLineupId) {
      params.set('lineup', selectedLineupId);
      changed = true;
    } else if (!selectedLineupId && params.has('lineup')) {
      params.delete('lineup');
      changed = true;
    }

    if (changed) {
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState(null, '', newUrl);
    }
  }, [selectedMap, selectedAgent, selectedLineupId, hasInitializedMap, hasInitializedAgent]);

  const { profile } = useUserProfile();
  const userId = profile?.id || 'local-user';
  const { lineups, setLineups, fetchLineups } = useLineups(mapNameZhToEn);

  // Restore Lineup from URL (Deep Link)
  const hasRestoredLineup = React.useRef(false);
  const initialLineupId = React.useRef<string | null>(new URLSearchParams(window.location.search).get('lineup'));

  useEffect(() => {
    if (lineups.length > 0 && initialLineupId.current && !hasRestoredLineup.current && !selectedLineupId) {
      const target = lineups.find(l => l.id === initialLineupId.current);
      if (target) {
        setSelectedLineupId(target.id);
        setViewingLineup(target);
        hasRestoredLineup.current = true;
      }
    }
  }, [lineups, selectedLineupId, setSelectedLineupId, setViewingLineup]);

  const { pinnedLineupIds, togglePinnedLineup, orderedLineups } = usePinnedLineups({
    userId,
    lineups,
  });

  const { handleDownload } = useLineupDownload({
    lineups: orderedLineups,
    setAlertMessage: modal.setAlertMessage,
  });

  const { saveNewLineup, updateLineup, deleteLineup, clearLineups, clearLineupsByAgent } = useLineupActions();


  const { agentCounts, filteredLineups, isFlipped, mapLineups, allMapLineups } = useLineupFiltering({
    lineups: orderedLineups,
    selectedMap,
    selectedAgent,
    selectedSide,
    selectedAbilityIndex,
    searchQuery,
  });

  const handleSelectAgent = useCallback((agent: AgentOption | null) => {
    setSelectedAgent(agent);
    setSelectedSide('all');
  }, [setSelectedAgent, setSelectedSide]);

  const handleSelectMap = useCallback((map: MapOption | null) => {
    setSelectedMap(map);
    setSelectedSide('attack'); // 切换地图时默认选择进攻
    if (map && agents.length > 0) {
      setSelectedAgent(agents[0]);
    } else {
      setSelectedAgent(null);
    }
  }, [agents, setSelectedMap, setSelectedAgent, setSelectedSide]);

  const handleReset = useCallback(() => {
    if (maps.length > 0) setSelectedMap(maps[0]);
    if (agents.length > 0) setSelectedAgent(agents[0]);
    else setSelectedAgent(null);
    setSelectedAbilityIndex(null);
    setSelectedSide('all');
    setSelectedLineupId(null);
    setViewingLineup(null);
    setSearchQuery('');
  }, [maps, agents, setSelectedMap, setSelectedAgent, setSelectedAbilityIndex, setSelectedSide, setSelectedLineupId, setViewingLineup, setSearchQuery]);

  useAppLifecycle({
    userId,
    activeTab,
    setActiveTab,
    fetchLineups,
    setLineups,
    setSelectedLineupId,
    setViewingLineup,
    setEditingLineupId,
    setIsEditorOpen: modal.setIsEditorOpen,
    setPlacingType,
    setNewLineupData,
    setAlertMessage: modal.setAlertMessage,
  });

  const { handleTabSwitch, handlePreviewSubmit } = useViewController({
    isGuest: false,
    activeTab,
    agents,
    selectedAgent,
    selectedSide,
    setActiveTab,
    setPlacingType,
    setSelectedLineupId,
    setViewingLineup,
    setEditingLineupId,
    setNewLineupData,
    setSelectedSide,
    setSelectedAbilityIndex,
    setSelectedAgent: handleSelectAgent, // 说明：视情使用包装函数，视图控制器通常处理 Tab。
    fetchLineups,
    userId,
    setAlertMessage: modal.setAlertMessage,
    setSelectedMap,
  });

  const { handleOpenEditor, handleEditorClose, handleEditStart, handleEditorSave } = useEditorController({
    isGuest: false,
    userId,
    userCustomId: profile?.custom_id || null,
    activeTab,
    selectedMap,
    selectedAgent,
    selectedSide,
    selectedAbilityIndex,
    newLineupData,
    setNewLineupData,
    setSelectedSide,
    setSelectedAbilityIndex,
    setActiveTab,
    setPlacingType,
    setIsEditorOpen: modal.setIsEditorOpen,
    setEditingLineupId,
    setSelectedLineupId,
    setViewingLineup,
    setSelectedMap,
    setSelectedAgent: handleSelectAgent,
    maps,
    agents,
    getMapDisplayName,
    setAlertMessage: modal.setAlertMessage,
    fetchLineups,
    saveNewLineup,
    updateLineup,
    editingLineupId,
    lineups,
  });

  const { handleRequestDelete, performDelete, handleClearAll, performClearAll, performClearSelectedAgent } = useDeletionController({
    isGuest: false,
    userId,
    lineups,
    selectedAgent,
    deleteTargetId: modal.deleteTargetId,
    setDeleteTargetId: modal.setDeleteTargetId,
    setIsClearConfirmOpen: modal.setIsClearConfirmOpen,
    setAlertMessage: modal.setAlertMessage,
    deleteLineup,
    clearLineups,
    clearLineupsByAgent,
    setSelectedLineupId,
    setViewingLineup,
    fetchLineups,
  });

  const {
    isActionMenuOpen,
    setIsActionMenuOpen,
    handleQuickClear,
  } = useActionMenu({
    handleClearAll,
  });



  const handleBatchDownload = useCallback(async (scope: 'agent' | 'map') => {
    if (!selectedMap) return;

    let targets: BaseLineup[] = [];
    if (scope === 'map') {
      targets = allMapLineups;
    } else {
      if (!selectedAgent) {
        modal.setAlertMessage('请先选择一个特工');
        return;
      }
      targets = allMapLineups.filter(l => l.agentName === selectedAgent.displayName);
    }

    if (targets.length === 0) {
      modal.setAlertMessage('当前范围内没有可下载的点位');
      return;
    }

    for (const lineup of targets) {
      await handleDownload(lineup.id);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }, [selectedMap, selectedAgent, allMapLineups, handleDownload, modal]);


  const togglePlacingType = (type: 'agent' | 'skill') => {
    setPlacingType((prev) => (prev === type ? null : type));
  };

  const mainViewProps = useMemo(() => buildMainViewProps({
    activeTab,
    selectedMap,
    setSelectedMap: handleSelectMap, // 说明：用于移动端地图选择。
    maps, // 说明：移动端地图列表。
    setIsMapModalOpen: modal.setIsMapModalOpen,
    selectedSide,
    setSelectedSide,
    selectedAgent,
    setSelectedAgent: handleSelectAgent,
    agents,
    agentCounts,
    selectedAbilityIndex,
    setSelectedAbilityIndex,
    setIsPreviewModalOpen: modal.setIsPreviewModalOpen,
    setIsImportModalOpen: modal.setIsImportModalOpen,
    getMapDisplayName,
    openChangelog: () => modal.setIsChangelogOpen(true),
    mapIcon: getMapUrl(),
    mapCover: getMapCoverUrl(),
    lineups: mapLineups,
    selectedLineupId,
    onLineupSelect: setSelectedLineupId,
    newLineupData,
    setNewLineupData,
    placingType,
    setPlacingType,
    onViewLineup: (id: string) => {
      setSelectedLineupId(id);
      const lineup = orderedLineups.find((l) => l.id === id);
      if (lineup) setViewingLineup(lineup);
    },
    isFlipped,
    isActionMenuOpen,
    onToggleActions: () => setIsActionMenuOpen((v) => !v),
    onBatchDownload: () => modal.setIsBatchDownloadModalOpen(true),
    handleTabSwitch,
    togglePlacingType,
    handleOpenEditor,
    searchQuery,
    setSearchQuery,
    filteredLineups,
    selectedLineupIdRight: selectedLineupId,
    handleViewLineup: (id: string) => {
      setSelectedLineupId(id);
      const lineup = orderedLineups.find((l) => l.id === id);
      if (lineup) setViewingLineup(lineup);
    },
    handleDownload,
    handleRequestDelete,
    handleClearAll,
    setSelectedLineupId,
    setViewingLineup,
    userId,
    pinnedLineupIds,
    onTogglePinLineup: togglePinnedLineup,
    canBatchDownload: profile?.role === 'admin' || profile?.role === 'super_admin' || profile?.can_batch_download,
    onReset: handleReset,
  }), [
    activeTab, selectedMap, handleSelectMap, maps, modal, selectedSide, setSelectedSide,
    selectedAgent, handleSelectAgent, agents, agentCounts, selectedAbilityIndex,
    setSelectedAbilityIndex, getMapDisplayName, getMapUrl, getMapCoverUrl, mapLineups,
    selectedLineupId, setSelectedLineupId, newLineupData, setNewLineupData, placingType,
    setPlacingType, orderedLineups, setViewingLineup, isFlipped, isActionMenuOpen,
    setIsActionMenuOpen, handleTabSwitch, handleOpenEditor, searchQuery, setSearchQuery,
    filteredLineups, handleDownload, handleRequestDelete, handleClearAll, userId,
    pinnedLineupIds, togglePinnedLineup, profile, handleReset
  ]);

  const modalProps = useMemo(() => buildModalProps({
    isMapModalOpen: modal.isMapModalOpen,
    maps,
    selectedMap,
    selectedAgent,
    selectedAbilityIndex,
    setSelectedMap: handleSelectMap,
    setIsMapModalOpen: modal.setIsMapModalOpen,
    getMapDisplayName,
    isPreviewModalOpen: modal.isPreviewModalOpen,
    previewInput: modal.previewInput,
    setPreviewInput: modal.setPreviewInput,
    onPreviewSubmit: handlePreviewSubmit,
    setIsPreviewModalOpen: modal.setIsPreviewModalOpen,
    alertMessage: modal.alertMessage,
    alertActionLabel: modal.alertActionLabel,
    alertAction: modal.alertAction,
    alertSecondaryLabel: modal.alertSecondaryLabel,
    alertSecondaryAction: modal.alertSecondaryAction,
    setAlertMessage: modal.setAlertMessage,
    setAlertActionLabel: modal.setAlertActionLabel,
    setAlertAction: modal.setAlertAction,
    setAlertSecondaryLabel: modal.setAlertSecondaryLabel,
    setAlertSecondaryAction: modal.setAlertSecondaryAction,
    deleteTargetId: modal.deleteTargetId,
    isClearConfirmOpen: modal.isClearConfirmOpen,
    performDelete,
    performClearAll,
    performClearSelectedAgent,
    setDeleteTargetId: modal.setDeleteTargetId,
    setIsClearConfirmOpen: modal.setIsClearConfirmOpen,
    selectedAgentName: selectedAgent?.displayName ?? null,
    selectedAgentIcon: selectedAgent?.displayIcon ?? null,
    isEditorOpen: modal.isEditorOpen,
    editingLineupId,
    newLineupData,
    setNewLineupData,
    handleEditorSave,
    handleEditorClose,
    selectedSide,
    setSelectedSide,
    viewingLineup,
    setViewingLineup,
    setSelectedLineupId,
    handleEditStart,
    setViewingImage: modal.setViewingImage,
    getMapEnglishName,
    isGuest: false,
    viewingImage: modal.viewingImage,
    isChangelogOpen: modal.isChangelogOpen,
    setIsChangelogOpen: modal.setIsChangelogOpen,
    isImportModalOpen: modal.isImportModalOpen,
    setIsImportModalOpen: modal.setIsImportModalOpen,
    saveNewLineup,
    fetchLineups,
    lineups,
    isBatchDownloadModalOpen: modal.isBatchDownloadModalOpen,
    onBatchDownloadClose: () => modal.setIsBatchDownloadModalOpen(false),
    handleBatchDownload,
    totalMapLineups: allMapLineups.length,
    totalAgentLineups: selectedAgent ? allMapLineups.filter(l => l.agentName === selectedAgent.displayName).length : 0,
    userId,
  }), [
    modal, maps, selectedMap, selectedAgent, selectedAbilityIndex, handleSelectMap,
    getMapDisplayName, handlePreviewSubmit, performDelete, performClearAll,
    performClearSelectedAgent, editingLineupId, newLineupData, setNewLineupData,
    handleEditorSave, handleEditorClose, selectedSide, setSelectedSide, viewingLineup,
    setViewingLineup, setSelectedLineupId, handleEditStart, getMapEnglishName,
    saveNewLineup, fetchLineups, lineups, handleBatchDownload, allMapLineups.length, userId
  ]);

  const { alertProps, lightboxProps } = buildUiProps({
    alertMessage: modal.alertMessage,
    alertActionLabel: modal.alertActionLabel,
    alertAction: modal.alertAction,
    alertSecondaryLabel: modal.alertSecondaryLabel,
    alertSecondaryAction: modal.alertSecondaryAction,
    setAlertMessage: modal.setAlertMessage,
    setAlertActionLabel: modal.setAlertActionLabel,
    setAlertAction: modal.setAlertAction,
    setAlertSecondaryLabel: modal.setAlertSecondaryLabel,
    setAlertSecondaryAction: modal.setAlertSecondaryAction,
    viewingImage: modal.viewingImage,
    setViewingImage: modal.setViewingImage,
  });

  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);

  return {
    activeTab,
    mainViewProps,
    modalProps,
    isProfileModalOpen,
    setIsProfileModalOpen,
    orderedLineups,
  };
}
