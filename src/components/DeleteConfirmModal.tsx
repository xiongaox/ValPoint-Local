/**
 * DeleteConfirmModal - DeleteConfirm弹窗
 *
 * 职责：
 * - 渲染DeleteConfirm弹窗内容与操作区域。
 * - 处理打开/关闭、确认/取消等交互。
 * - 与表单校验或数据提交逻辑联动。
 */

// @ts-nocheck
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
