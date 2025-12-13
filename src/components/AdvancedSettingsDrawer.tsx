import React, { useState } from 'react';
import Icon from './Icon';
import { ImageProcessingSettings } from '../types/imageProcessing';

type Props = {
  isOpen: boolean;
  settings: ImageProcessingSettings;
  onClose: () => void;
  onSave: (settings: ImageProcessingSettings) => void;
};

const clampQuality = (val: number) => Math.min(1, Math.max(0.1, val));

const AdvancedSettingsDrawer: React.FC<Props> = ({ isOpen, settings, onClose, onSave }) => {
  const [localSettings, setLocalSettings] = useState<ImageProcessingSettings>(settings);

  React.useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleQualityChange = (val: number) => {
    setLocalSettings((prev) => ({ ...prev, jpegQuality: clampQuality(val) }));
  };

  const handleSave = () => {
    onSave(localSettings);
  };

  return (
    <>
      <div className="fixed inset-0 z-[1100] bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-[#1f2326] border-l border-white/10 z-[1101] shadow-2xl flex flex-col animate-in slide-in-from-right">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Icon name="SlidersHorizontal" className="text-[#ff4655]" size={24} />
            <div>
              <h3 className="text-lg font-bold text-white">高级设置</h3>
              <p className="text-xs text-gray-400">一些高级设置</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-[#ff4655]/50 transition-colors"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="bg-[#0f1923] border border-white/10 rounded-xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="Image" size={18} className="text-[#ff4655]" />
                  <div className="text-sm font-bold text-white">PNG 转 JPG</div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  开启后会将剪贴板图片转成 JPG 并压缩，便于上传。适用于截图等场景。
                </p>
              </div>
              <button
                onClick={() => setLocalSettings((prev) => ({ ...prev, enablePngToJpg: !prev.enablePngToJpg }))}
                className={`relative w-14 h-8 rounded-full border transition-colors flex items-center px-1 flex-shrink-0 ${
                  localSettings.enablePngToJpg ? 'bg-[#ff4655] border-[#ff7884]' : 'bg-[#1c2430] border-white/10'
                }`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-150 ${
                    localSettings.enablePngToJpg ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {localSettings.enablePngToJpg && (
              <div className="pt-4 border-t border-white/10 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">压缩系数</div>
                    <p className="text-xs text-gray-400 mt-1">范围 0.1 - 1，越高越清晰</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.01"
                      min={0.1}
                      max={1}
                      value={localSettings.jpegQuality.toFixed(2)}
                      onChange={(e) => handleQualityChange(Number(e.target.value))}
                      className="w-20 bg-[#0f1923] border border-[#2a323d] rounded-lg px-2 py-1 text-sm text-white focus:border-[#ff4655] outline-none"
                    />
                  </div>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.01}
                  value={localSettings.jpegQuality}
                  onChange={(e) => handleQualityChange(Number(e.target.value))}
                  className="w-full accent-[#ff4655]"
                />
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-white/10 text-sm text-gray-200 hover:text-white hover:border-[#ff4655]/50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-[#ff5b6b] to-[#ff3c4d] hover:from-[#ff6c7b] hover:to-[#ff4c5e] shadow-lg shadow-red-900/30 transition-all"
          >
            保存设置
          </button>
        </div>
      </div>
    </>
  );
};

export default AdvancedSettingsDrawer;
