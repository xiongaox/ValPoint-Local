import { useEffect } from 'react';
import { ActiveTab } from '../../../types/app';
import { BaseLineup, LibraryMode, NewLineupForm, SharedLineup } from '../../../types/lineup';
import { createEmptyLineup } from '../lineupHelpers';

type Params = {
  userId: string | null;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  fetchLineups: (userId: string) => void;
  fetchSharedLineups: () => void;
  fetchSharedById: (id: string) => Promise<SharedLineup | null>;
  setLineups: (val: BaseLineup[]) => void;
  setSelectedLineupId: (val: string | null) => void;
  setViewingLineup: (val: BaseLineup | null) => void;
  setSharedLineup: (val: SharedLineup | null) => void;
  setEditingLineupId: (val: string | null) => void;
  setIsEditorOpen: (val: boolean) => void;
  setPlacingType: (val: 'agent' | 'skill' | null) => void;
  setNewLineupData: (val: NewLineupForm) => void;
  libraryMode: LibraryMode;
  setAlertMessage: (msg: string) => void;
};

export function useAppLifecycle({
  userId,
  activeTab,
  setActiveTab,
  fetchLineups,
  fetchSharedLineups,
  fetchSharedById,
  setLineups,
  setSelectedLineupId,
  setViewingLineup,
  setSharedLineup,
  setEditingLineupId,
  setIsEditorOpen,
  setPlacingType,
  setNewLineupData,
  libraryMode,
  setAlertMessage,
}: Params) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('id')) setActiveTab('shared');
  }, [setActiveTab]);

  useEffect(() => {
    if (!userId) return;
    fetchLineups(userId);
  }, [fetchLineups, userId]);

  useEffect(() => {
    if (!userId) return;
    setLineups([]);
    setSelectedLineupId(null);
    setViewingLineup(null);
    setSharedLineup(null);
    setEditingLineupId(null);
    setIsEditorOpen(false);
    setPlacingType(null);
    setNewLineupData(createEmptyLineup());
    setActiveTab('view');
  }, [
    setActiveTab,
    setEditingLineupId,
    setIsEditorOpen,
    setLineups,
    setNewLineupData,
    setPlacingType,
    setSelectedLineupId,
    setSharedLineup,
    setViewingLineup,
    userId,
  ]);

  useEffect(() => {
    setSelectedLineupId(null);
    setViewingLineup(null);
  }, [libraryMode, setSelectedLineupId, setViewingLineup]);

  useEffect(() => {
    if (libraryMode === 'shared') fetchSharedLineups();
  }, [libraryMode, fetchSharedLineups]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get('id');
    if (!shareId) return;
    const load = async () => {
      const lineup = await fetchSharedById(shareId);
      if (!lineup) {
        setAlertMessage('未找到该点位分享，可能已被删除。');
        setActiveTab('view');
        return;
      }
      setSharedLineup(lineup);
    };
    load();
  }, [activeTab, fetchSharedById, setActiveTab, setAlertMessage, setSharedLineup]);
}
