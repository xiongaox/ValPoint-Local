// @ts-nocheck
import React, { useEffect, useState } from 'react';
import Icon from './Icon';

const defaultConfig = {
  name: '',
  accessKeyId: '',
  accessKeySecret: '',
  bucket: '',
  region: '',
  basePath: '',
  endpointPath: '',
  customDomain: '',
  processParams: '',
};

type Props = {
  isOpen: boolean;
  config: typeof defaultConfig;
  onClose: () => void;
  onSave: (cfg: typeof defaultConfig) => void;
};

const ImageBedConfigModal: React.FC<Props> = ({ isOpen, config, onClose, onSave }) => {
  const [localConfig, setLocalConfig] = useState(defaultConfig);

  useEffect(() => {
    if (isOpen) setLocalConfig(config || defaultConfig);
  }, [isOpen, config]);

  const updateField = (key: keyof typeof defaultConfig, value: string) => {
    setLocalConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(localConfig, null, 2));
    } catch (e) {
      console.error(e);
      alert('复制失败，请手动复制。');
    }
  };

  const handleImport = async () => {
    const text = prompt('粘贴配置 JSON：');
    if (!text) return;
    try {
      const parsed = JSON.parse(text);
      setLocalConfig({ ...defaultConfig, ...parsed });
    } catch (e) {
      alert('解析失败，请确认格式正确。');
    }
  };

  const handleReset = () => setLocalConfig(defaultConfig);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1400] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#1f2326] border border-white/10 rounded-2xl shadow-2xl p-6 space-y-5 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Cloudy" className="text-[#ff4655]" />
            <div>
              <div className="text-xl font-bold text-white">阿里云 OSS 配置</div>
              <div className="text-xs text-gray-400">本地存储，仅当前设备生效，可复制导入导出</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white hover:border-white/40 transition-colors"
            >
              <Icon name="Copy" size={16} /> 复制配置
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-white/40 transition-colors"
            >
              <Icon name="X" size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="配置名" required value={localConfig.name} onChange={(v) => updateField('name', v)} />
          <Field label="设置 accessKeyId" required value={localConfig.accessKeyId} onChange={(v) => updateField('accessKeyId', v)} />
          <Field label="设置 accessKeySecret" required value={localConfig.accessKeySecret} onChange={(v) => updateField('accessKeySecret', v)} />
          <Field label="设置 Bucket" required value={localConfig.bucket} onChange={(v) => updateField('bucket', v)} />
          <Field label="设置存储区域" placeholder="如：oss-cn-guangzhou" value={localConfig.region} onChange={(v) => updateField('region', v)} />
          <Field label="设置存储路径" placeholder="/img_share" value={localConfig.basePath} onChange={(v) => updateField('basePath', v)} />
          <Field label="设置网关路径" placeholder="用于拼接网址路径" value={localConfig.endpointPath} onChange={(v) => updateField('endpointPath', v)} />
          <Field label="设置自定义域名" placeholder="https://test.com" value={localConfig.customDomain} onChange={(v) => updateField('customDomain', v)} />
          <Field label="设置网址后缀" placeholder="?x-oss-process=xxx" value={localConfig.processParams} onChange={(v) => updateField('processParams', v)} />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-gray-500">提示：密钥仅保存在本机；换设备需导出导入。</div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg border border-white/20 text-sm text-gray-200 hover:border-white/60 hover:bg-white/5 transition-colors"
            >
              重置
            </button>
            <button
              onClick={handleImport}
              className="px-4 py-2 rounded-lg bg-orange-500/80 hover:bg-orange-500 text-white font-bold text-sm transition-colors flex items-center gap-2"
            >
              <Icon name="Download" size={16} /> 导入
            </button>
            <button
              onClick={() => onSave(localConfig)}
              className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm transition-colors flex items-center gap-2"
            >
              <Icon name="Check" size={16} /> 确认
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, required = false, placeholder = '' }) => {
  return (
    <label className="flex flex-col gap-1 text-sm text-gray-300">
      <span className="text-xs text-gray-400">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0f1923] border border-white/10 rounded-lg px-3 py-2 text-white focus:border-[#ff4655] outline-none transition-colors"
      />
    </label>
  );
};

export default ImageBedConfigModal;
export { defaultConfig as defaultImageBedConfig };
