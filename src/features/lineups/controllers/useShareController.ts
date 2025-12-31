/**
 * useShareController - 点位共享控制器
 *
 * 职责：
 * - 封装点位共享控制器相关的状态与副作用。
 * - 对外提供稳定的接口与回调。
 * - 处理订阅、清理或缓存等生命周期细节。
 */

import { useCallback, useState } from 'react';
import { useShareActions } from '../../../hooks/useShareActions';
import { BaseLineup, SharedLineup, LineupDbPayload } from '../../../types/lineup';
import { ActiveTab } from '../../../types/app';
import { ImageBedConfig } from '../../../types/imageBed';

type Params = {
  lineups: BaseLineup[];
  userId: string | null;
  isGuest: boolean;
  getMapEnglishName: (name: string) => string;
  setAlertMessage: (msg: string | null) => void;
  handleTabSwitch: (tab: ActiveTab) => void;
  setAlertActionLabel: (label: string | null) => void;
  setAlertAction: (fn: (() => void) | null) => void;
  setAlertSecondaryLabel: (label: string | null) => void;
  setAlertSecondaryAction: (fn: (() => void) | null) => void;
  imageBedConfig: ImageBedConfig;
  saveNewLineup: (payload: LineupDbPayload) => Promise<BaseLineup>;
  fetchLineups: (userId: string | null) => Promise<void>;
  updateLineup: (id: string, payload: Partial<LineupDbPayload>) => Promise<void>;
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
      void handleSaveShared(lineupParam, sharedLineup ?? null);
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
