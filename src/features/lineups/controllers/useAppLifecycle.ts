import { useEffect } from 'react';
import { ActiveTab } from '../../../types/app';
import { BaseLineup, LibraryMode, NewLineupForm, SharedLineup } from '../../../types/lineup';
import { createEmptyLineup } from '../lineupHelpers';

type Params = {
  userId: string | null;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  fetchLineups: (userId: string) => void;
  setLineups: (val: BaseLineup[]) => void;
  setSelectedLineupId: (val: string | null) => void;
  setViewingLineup: (val: BaseLineup | null) => void;
  setEditingLineupId: (val: string | null) => void;
  setIsEditorOpen: (val: boolean) => void;
  setPlacingType: (val: 'agent' | 'skill' | null) => void;
  setNewLineupData: (val: NewLineupForm) => void;
  setAlertMessage: (msg: string) => void;
};

export function useAppLifecycle({
  userId,
  activeTab,
  setActiveTab,
  fetchLineups,
  setLineups,
  setSelectedLineupId,
  setViewingLineup,
  setEditingLineupId,
  setIsEditorOpen,
  setPlacingType,
  setNewLineupData,
  setAlertMessage,
}: Params) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('id')) {
      // Shared link handling removed in Personal Library
      // Potentially redirect or show message?
      // For now, just clear the param or ignore
      window.history.replaceState({}, document.title, window.location.pathname);
    }
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
    setViewingLineup,
    userId,
  ]);
}
