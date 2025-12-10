import { useCallback, useState } from 'react';
import { useShareActions } from '../../../hooks/useShareActions';
import { SharedLineup } from '../../../types/lineup';
import { ActiveTab } from '../../../types/app';

type Params = {
  lineups: any[];
  userId: string | null;
  isGuest: boolean;
  getMapEnglishName: (name: string) => string;
  setAlertMessage: (msg: string | null) => void;
  handleTabSwitch: (tab: ActiveTab) => void;
  setAlertActionLabel: (label: string | null) => void;
  setAlertAction: (fn: (() => void) | null) => void;
  setAlertSecondaryLabel: (label: string | null) => void;
  setAlertSecondaryAction: (fn: (() => void) | null) => void;
  imageBedConfig: any;
  saveNewLineup: (payload: any) => Promise<any>;
  fetchLineups: (userId: string | null) => Promise<void>;
  updateLineup: (id: string, payload: any) => Promise<any>;
};

export function useShareController({
  lineups,
  userId,
  isGuest,
  getMapEnglishName,
  setAlertMessage,
  handleTabSwitch,
  setAlertActionLabel,
  setAlertAction,
  setAlertSecondaryLabel,
  setAlertSecondaryAction,
  imageBedConfig,
  saveNewLineup,
  fetchLineups,
  updateLineup,
}: Params) {
  const [isSavingShared, setIsSavingShared] = useState(false);
  const [pendingTransfers, setPendingTransfers] = useState(0);

  const { handleShare, handleSaveShared } = useShareActions({
    lineups,
    userId,
    isGuest,
    getMapEnglishName,
    setAlertMessage,
    setIsSharing: () => {},
    saveNewLineup,
    fetchLineups,
    handleTabSwitch,
    setAlertActionLabel,
    setAlertAction,
    setAlertSecondaryLabel,
    setAlertSecondaryAction,
    imageBedConfig,
    openImageBedConfig: () => setAlertMessage('请在动作菜单中配置图床'),
    isSavingShared,
    setIsSavingShared,
    updateLineup,
    onTransferStart: (count: number) => setPendingTransfers((v) => v + count),
    onTransferProgress: (delta: number) => setPendingTransfers((v) => Math.max(0, v + delta)),
  });

  const onShare = useCallback(
    (id: string, e?: React.MouseEvent) => {
      e?.stopPropagation();
      handleShare(id);
    },
    [handleShare],
  );

  const onSaveShared = useCallback(
    (lineupParam: SharedLineup | null = null, sharedLineup?: SharedLineup | null) => {
      void handleSaveShared(lineupParam, sharedLineup);
    },
    [handleSaveShared],
  );

  return {
    onShare,
    onSaveShared,
    isSavingShared,
    pendingTransfers,
  };
}
