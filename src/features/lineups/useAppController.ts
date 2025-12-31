/**
 * useAppController - 点位应用控制器
 *
 * 职责：
 * - 封装点位应用控制器相关的状态与副作用。
 * - 对外提供稳定的接口与回调。
 * - 处理订阅、清理或缓存等生命周期细节。
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useEmailAuth } from '../../hooks/useEmailAuth';
import { useLineups } from '../../hooks/useLineups';
import { useLineupActions } from '../../hooks/useLineupActions';
import { useValorantData } from '../../hooks/useValorantData';
import { useLineupFiltering } from '../../hooks/useLineupFiltering';
import { useModalState } from '../../hooks/useModalState';
import { usePinnedLineups } from '../../hooks/usePinnedLineups';
import { useLineupDownload } from '../../hooks/useLineupDownload';
import { AgentOption, BaseLineup, LibraryMode, SharedLineup, MapOption } from '../../types/lineup';
import { useMapInfo } from './controllers/useMapInfo';
import { useActionMenu } from './controllers/useActionMenu';
import { useAppLifecycle } from './controllers/useAppLifecycle';
import { useEditorController } from './controllers/useEditorController';
import { useDeletionController } from './controllers/useDeletionController';
import { useShareController } from './controllers/useShareController';
import { useViewController } from './controllers/useViewController';
import { buildMainViewProps } from './controllers/useMainViewProps';
import { buildModalProps } from './controllers/useModalProps';
import { buildUiProps } from './controllers/useUiProps';
import { useAppState } from './controllers/useAppState';
import { useUserProfile } from '../../hooks/useUserProfile';
import { supabase } from '../../supabaseClient';

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
  const { user, signOut } = useEmailAuth();
  const userId = user?.id || null;
  const { profile, isLoading: profileLoading } = useUserProfile();



  const [isProfileModalOpen, setIsProfileModalOpen] = React.useState(false);
  const userMode = 'login' as const;
  const isGuest = false;
  const isAuthModalOpen = false;
  const setIsAuthModalOpen = () => { };
  const pendingUserId = '';
  const setPendingUserId = () => { };
  const customUserIdInput = user?.user_metadata?.custom_id || '';
  const setCustomUserIdInput = () => { };
  const passwordInput = '';
  const setPasswordInput = () => { };
  const isAuthLoading = false;
  const targetUserId = userId || '';
  const handleApplyCustomUserId = () => { };
  const handleResetUserId = () => { };
  const handleConfirmUserAuth = async () => { };
  const { lineups, setLineups, fetchLineups } = useLineups(mapNameZhToEn);
  const { pinnedLineupIds, togglePinnedLineup, orderedLineups } = usePinnedLineups({
    userId,
    lineups,
  });
  const { handleDownload } = useLineupDownload({
    lineups: orderedLineups,
    setAlertMessage: modal.setAlertMessage,
  });
  const { saveNewLineup, updateLineup, deleteLineup, clearLineups, clearLineupsByAgent } = useLineupActions();
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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
    setSelectedSide('all');
    if (map && agents.length > 0) {
      setSelectedAgent(agents[0]);
    } else {
      setSelectedAgent(null);
    }
  }, [agents, setSelectedMap, setSelectedAgent, setSelectedSide]);

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
    isGuest,
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
    isGuest,
    userId,
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
    isGuest,
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
    isImageConfigOpen,
    setIsImageConfigOpen,
    imageBedConfig,
    isAdvancedSettingsOpen,
    setIsAdvancedSettingsOpen,
    isPngSettingsOpen,
    setIsPngSettingsOpen,
    imageProcessingSettings,
    handleImageBedConfig,
    handleOpenAdvancedSettings,
    handleOpenPngSettings,
    handleChangePassword,
    handleQuickClear,
    handleImageConfigSave,
    handleImageProcessingSave,
  } = useActionMenu({
    userId,
    setAlertMessage: (msg: string) => modal.setAlertMessage(msg),
    setIsAuthModalOpen,
    setPendingUserId,
    setCustomUserIdInput,
    setPasswordInput,
    handleClearAll,
    setIsChangePasswordOpen: modal.setIsChangePasswordOpen,
  });

  const { onSaveShared, isSavingShared, pendingTransfers } = useShareController({
    lineups,
    userId,
    isGuest,
    getMapEnglishName,
    setAlertMessage: modal.setAlertMessage,
    handleTabSwitch,
    setAlertActionLabel: modal.setAlertActionLabel,
    setAlertAction: modal.setAlertAction,
    setAlertSecondaryLabel: modal.setAlertSecondaryLabel,
    setAlertSecondaryAction: modal.setAlertSecondaryAction,
    imageBedConfig,
    saveNewLineup,
    fetchLineups,
    updateLineup,
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

  const handleChangePasswordSubmit = useCallback(
    async (oldPassword: string, newPassword: string, confirmPassword: string) => {
      if (!newPassword || !confirmPassword) {
        modal.setAlertMessage('请输入新密码');
        return;
      }

      if (newPassword !== confirmPassword) {
        modal.setAlertMessage('两次输入的密码不一致');
        return;
      }

      if (newPassword.length < 6) {
        modal.setAlertMessage('新密码长度不能少于 6 位');
        return;
      }

      setIsChangingPassword(true);

      try {
        if (!user?.email) throw new Error('用户未登录');

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: oldPassword,
        });

        if (signInError) {
          console.error('Verify old password failed:', signInError);
          modal.setAlertMessage('旧密码错误，请重新输入');
          setIsChangingPassword(false);
          return;
        }

        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (updateError) {
          throw updateError;
        }

        modal.setIsChangePasswordOpen(false);
        modal.setAlertMessage('密码修改成功！下次登录请使用新密码');

      } catch (err: any) {
        console.error('Change password failed:', err);
        modal.setAlertMessage(err.message || '修改密码失败，请稍后重试');
      } finally {
        setIsChangingPassword(false);
      }
    },
    [modal, user, setIsChangingPassword],
  );

  const togglePlacingType = (type: 'agent' | 'skill') => {
    if (isGuest) {
      modal.setAlertMessage('游客模式无法标注点位，请先输入密码进入登录模式');
      return;
    }
    setPlacingType((prev) => (prev === type ? null : type));
  };

  const mainViewProps = buildMainViewProps({
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
    onImageBedConfig: handleImageBedConfig,
    onAdvancedSettings: handleOpenAdvancedSettings,
    onPngSettings: handleOpenPngSettings,
    onChangePassword: handleChangePassword,
    onClearLineups: handleQuickClear,
    pendingTransfers,
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
    pinnedLimit: DEFAULT_PINNED_COUNT,
    hideSharedButton: imageProcessingSettings.hideSharedButton,
    hideAuthorLinks: imageProcessingSettings.hideAuthorLinks,
    onBatchDownload: () => modal.setIsBatchDownloadModalOpen(true),
    user,
    onSignOut: signOut,
    onOpenProfile: () => setIsProfileModalOpen(true),
    canBatchDownload: profile?.role === 'admin' || profile?.role === 'super_admin' || profile?.can_batch_download,
  });

  const modalProps = buildModalProps({
    isAuthModalOpen,
    userId,
    targetUserId,
    passwordInput,
    isAuthLoading,
    setIsAuthModalOpen,
    setPendingUserId,
    setPasswordInput,
    setCustomUserIdInput,
    handleResetUserId,
    handleConfirmUserAuth,
    handleApplyCustomUserId,
    isMapModalOpen: modal.isMapModalOpen,
    maps,
    selectedMap,
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
    isImageConfigOpen,
    imageBedConfig,
    onImageConfigSave: handleImageConfigSave,
    setIsImageConfigOpen,
    isAdvancedSettingsOpen,
    setIsAdvancedSettingsOpen,
    isPngSettingsOpen,
    setIsPngSettingsOpen,
    imageProcessingSettings,
    onImageProcessingSave: handleImageProcessingSave,
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
    isGuest,
    isChangePasswordOpen: modal.isChangePasswordOpen,
    setIsChangePasswordOpen: modal.setIsChangePasswordOpen,
    isChangingPassword,
    onChangePasswordSubmit: handleChangePasswordSubmit,
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
  });

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

  return {
    activeTab,
    mainViewProps,
    modalProps,
    isProfileModalOpen,
    setIsProfileModalOpen,
    orderedLineups, // 说明：暴露点位列表供 UserApp 直接投稿。
  };
}
