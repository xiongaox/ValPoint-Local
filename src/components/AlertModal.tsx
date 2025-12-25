/**
 * AlertModal - 通用提示/警告模态框
 * 
 * 用于展示错误信息、操作反馈或需要用户注意的简短提示。
 * 支持主操作按钮和次要操作按钮（默认为"关闭"）。
 */
import React from 'react';
import Icon from './Icon';

type AlertModalProps = {
  message: string | null;
  onClose?: () => void;
  actionLabel?: string | null;
  onAction?: (() => void) | null;
  secondaryLabel?: string | null;
  onSecondary?: (() => void) | null;
};

const AlertModal: React.FC<AlertModalProps> = ({ message, onClose, actionLabel, onAction, secondaryLabel, onSecondary }) => {
  if (!message) return null;
  const handlePrimary = () => {
    if (onAction) {
      onAction();
    }
    onClose?.();
  };
  const handleSecondary = () => {
    if (onSecondary) {
      onSecondary();
    } else {
      onClose?.();
    }
  };
  return (
    <div className="fixed inset-0 z-[2200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#181b1f]/95 shadow-2xl shadow-black/50 overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#1c2028]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ff4655]/15 border border-[#ff4655]/35 flex items-center justify-center text-[#ff4655]">
              <Icon name="Info" size={22} />
            </div>
            <div className="flex flex-col leading-tight">
              <h3 className="text-xl font-bold text-white">提示</h3>
              <span className="text-[11px] uppercase tracking-[0.15em] text-gray-500">系统消息</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-colors"
            aria-label="关闭"
          >
            <Icon name="X" size={16} />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-5 space-y-4 bg-[#181b1f]">
          <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-200 whitespace-pre-line flex items-start gap-2">
            <Icon name="Info" size={16} className="mt-[2px] text-gray-400 shrink-0" />
            <span>{message}</span>
          </div>

          {/* 按钮 */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {actionLabel && (
              <button
                onClick={handlePrimary}
                className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm font-semibold text-gray-200 hover:border-white/30 hover:text-white transition-colors"
              >
                {actionLabel}
              </button>
            )}
            <button
              onClick={handleSecondary}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-[#ff5b6b] to-[#ff3c4d] hover:from-[#ff6c7b] hover:to-[#ff4c5e] shadow-md shadow-red-900/30 transition-all"
            >
              {secondaryLabel || '关闭'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
