import { useState } from 'react';
import { ActiveTab } from '../../../types/app';
import { BaseLineup, LibraryMode, NewLineupForm, SharedLineup } from '../../../types/lineup';
import { createEmptyLineup } from '../lineupHelpers';

export function useAppState() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('view');
  const [selectedSide, setSelectedSide] = useState<'all' | 'attack' | 'defense'>('all');
  const [selectedAbilityIndex, setSelectedAbilityIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLineupId, setSelectedLineupId] = useState<string | null>(null);
  const [viewingLineup, setViewingLineup] = useState<BaseLineup | null>(null);
  const [editingLineupId, setEditingLineupId] = useState<string | null>(null);
  const [sharedLineup, setSharedLineup] = useState<SharedLineup | null>(null);
  const [libraryMode, setLibraryMode] = useState<LibraryMode>('personal');
  const [newLineupData, setNewLineupData] = useState<NewLineupForm>(createEmptyLineup());
  const [placingType, setPlacingType] = useState<'agent' | 'skill' | null>(null);

  return {
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
    sharedLineup,
    setSharedLineup,
    libraryMode,
    setLibraryMode,
    newLineupData,
    setNewLineupData,
    placingType,
    setPlacingType,
  };
}
