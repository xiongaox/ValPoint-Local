// @ts-nocheck
import React from 'react';
import Icon from './Icon';

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  onImageBedConfig: () => void;
  onChangePassword: () => void;
  onClearLineups: () => void;
};

const QuickActions: React.FC<Props> = ({ isOpen, onToggle, onImageBedConfig, onChangePassword, onClearLineups }) => {
  return (
    <div className="absolute bottom-4 right-4 z-30 flex flex-col items-end gap-2">
      {isOpen && (
        <div className="bg-[#11161c] border border-white/15 rounded-2xl shadow-2xl p-3 w-56 space-y-2 backdrop-blur">
          <div className="text-xs text-gray-400 uppercase tracking-wider flex items-center gap-2 mb-1">
            <Icon name="Settings" size={14} /> 快捷功能
          </div>
          <button
            onClick={onImageBedConfig}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-white border border-white/10 transition-colors"
          >
            <span className="flex items-center gap-2"><Icon name="Image" size={16} /> 图床配置</span>
            <Icon name="ChevronRight" size={14} className="text-gray-400" />
          </button>
          <button
            onClick={onChangePassword}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-white border border-white/10 transition-colors"
          >
            <span className="flex items-center gap-2"><Icon name="Key" size={16} /> 修改密码</span>
            <Icon name="ChevronRight" size={14} className="text-gray-400" />
          </button>
          <button
            onClick={onClearLineups}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#ff4655]/10 hover:bg-[#ff4655]/20 text-sm text-[#ffb3ba] border border-[#ff4655]/40 transition-colors"
          >
            <span className="flex items-center gap-2"><Icon name="Trash2" size={16} /> 清空点位</span>
            <Icon name="ChevronRight" size={14} className="text-[#ffb3ba]" />
          </button>
        </div>
      )}
      <button
        onClick={onToggle}
        className="w-12 h-12 rounded-full bg-[#ff4655] hover:bg-[#d93a49] text-white flex items-center justify-center shadow-lg shadow-red-900/40 border border-white/10 transition-colors"
        title="快捷功能"
      >
        <Icon name={isOpen ? 'X' : 'Menu'} size={22} />
      </button>
    </div>
  );
};

export default QuickActions;
