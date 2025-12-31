/**
 * useModalState - 弹窗State
 *
 * 职责：
 * - 封装弹窗State相关的状态与副作用。
 * - 对外提供稳定的接口与回调。
 * - 处理订阅、清理或缓存等生命周期细节。
 */

import { useState, useCallback } from 'react';
import { LightboxImage } from '../types/ui';

export function useModalState() {
  const [isMapModalOpen, setIsMapModalOpen] = useState<boolean>(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [previewInput, setPreviewInput] = useState<string>('');
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState<boolean>(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertActionLabel, setAlertActionLabel] = useState<string | null>(null);
  const [alertAction, setAlertAction] = useState<(() => void) | null>(null);
  const [alertSecondaryLabel, setAlertSecondaryLabel] = useState<string | null>(null);
  const [alertSecondaryAction, setAlertSecondaryAction] = useState<(() => void) | null>(null);
  const [viewingImage, setViewingImage] = useState<LightboxImage | null>(null);
  const [isChangelogOpen, setIsChangelogOpen] = useState<boolean>(false);
  const [isSharedFilterOpen, setIsSharedFilterOpen] = useState<boolean>(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [isBatchDownloadModalOpen, setIsBatchDownloadModalOpen] = useState<boolean>(false);

  return {
    isMapModalOpen,
    setIsMapModalOpen,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    previewInput,
    setPreviewInput,
    isEditorOpen,
    setIsEditorOpen,
    isClearConfirmOpen,
    setIsClearConfirmOpen,
    deleteTargetId,
    setDeleteTargetId,
    alertMessage,
    setAlertMessage,
    alertActionLabel,
    setAlertActionLabel,
    alertAction,
    setAlertAction,
    alertSecondaryLabel,
    setAlertSecondaryLabel,
    alertSecondaryAction,
    setAlertSecondaryAction,
    viewingImage,
    setViewingImage,
    isChangelogOpen,
    setIsChangelogOpen,
    isSharedFilterOpen,
    setIsSharedFilterOpen,
    isChangePasswordOpen,
    setIsChangePasswordOpen,
    isImportModalOpen,
    setIsImportModalOpen,
    isBatchDownloadModalOpen,
    setIsBatchDownloadModalOpen,
  };
}
