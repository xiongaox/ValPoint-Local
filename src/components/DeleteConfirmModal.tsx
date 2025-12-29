// @ts-nocheck
/**
 * DeleteConfirmModal - 删除确认模态框
 * 
 * 用于确认删除单个点位数据。
 * Refactored to use AlertModal for consistent styling.
 */
import React from 'react';
import AlertModal from './AlertModal';

const DeleteConfirmModal = ({ deleteTargetId, onCancel, onConfirm }) => {
  if (!deleteTargetId) return null;

  return (
    <AlertModal
      variant="danger"
      title="确认删除点位"
      subtitle="安全操作"
      message="删除后不可恢复"
      onClose={onCancel}
      actionLabel="确认删除"
      onAction={onConfirm}
      secondaryLabel="取消"
      onSecondary={onCancel}
    />
  );
};

export default DeleteConfirmModal;
