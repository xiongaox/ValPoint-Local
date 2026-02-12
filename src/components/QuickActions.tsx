/**
 * QuickActions - 快捷操作 (Docker 本地版)
 *
 * 职责：
 * - 渲染快捷操作相关的界面结构与样式。
 * - 处理用户交互与状态变更。
 */

import React from 'react';
import Icon, { IconName } from './Icon';

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  onBatchDownload?: () => void; // 说明：批量下载。
  canBatchDownload?: boolean; // 说明：允许批量下载。
  mode?: 'default' | 'pad';
  sizeMode?: 'default' | 'pad';
};

const ActionButton = ({
  onClick,
  icon,
  title,
  color = 'bg-[#2a2f38]',
  isPadMode = false,
}: {
  onClick: () => void;
  icon: IconName;
  title: string;
  color?: string;
  isPadMode?: boolean;
}) => (
  <div className="flex items-center gap-3 animate-in slide-in-from-bottom-2 fade-in duration-200">
    <div className="px-2 py-1 bg-[#11161c] border border-white/10 rounded-md text-xs text-gray-300 shadow-lg whitespace-nowrap">
      {title}
    </div>
    <button
      onClick={onClick}
      className={`${isPadMode ? 'w-14 h-14' : 'w-12 h-12'} rounded-full ${color} hover:brightness-110 text-white flex items-center justify-center shadow-lg border border-white/10 transition-all active:scale-95`}
      title={title}
    >
      <Icon name={icon} size={isPadMode ? 24 : 20} />
    </button>
  </div>
);

const QuickActions: React.FC<Props> = ({
  isOpen,
  onToggle,
  onBatchDownload,
  canBatchDownload = false,
  mode = 'default',
  sizeMode,
}) => {
  const isPadMode = mode === 'pad';
  const isPadSize = (sizeMode ?? mode) === 'pad';

  return (
    <div className={`absolute bottom-4 ${isPadMode ? 'right-2' : 'right-4'} z-30 pointer-events-none`}>
      <div className="relative flex items-end flex-col gap-3 pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-end gap-3 button-list">
          {isOpen && (
            <>
              {!isPadMode && onBatchDownload && canBatchDownload && (
                <ActionButton onClick={onBatchDownload} icon="Download" title="批量下载" isPadMode={isPadSize} />
              )}

              {!isPadMode && (
                <ActionButton
                  onClick={() => window.open('/reticle.html', '_blank')}
                  icon="Crosshair"
                  title="瞄点编辑器"
                  isPadMode={isPadSize}
                />
              )}
            </>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={onToggle}
              className={`${isPadSize ? 'w-14 h-14' : 'w-12 h-12'} rounded-full text-white flex items-center justify-center shadow-lg border border-white/10 transition-all duration-300 z-40 ${isOpen ? 'bg-[#2a2f38] rotate-90' : 'bg-[#ff4655] hover:bg-[#d93a49] shadow-red-900/40'
                }`}
              title="快捷功能"
            >
              <Icon name={isOpen ? 'X' : 'Menu'} size={isPadSize ? 26 : 22} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
