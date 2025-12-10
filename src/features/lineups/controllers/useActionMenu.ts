import { useEffect, useState } from 'react';
import { defaultImageBedConfig } from '../../../components/ImageBedConfigModal';

type Params = {
  userId: string | null;
  setAlertMessage: (msg: string) => void;
  setIsAuthModalOpen: (val: boolean) => void;
  setPendingUserId: (val: string) => void;
  setCustomUserIdInput: (val: string) => void;
  setPasswordInput: (val: string) => void;
  handleClearAll: () => void;
};

export function useActionMenu({
  userId,
  setAlertMessage,
  setIsAuthModalOpen,
  setPendingUserId,
  setCustomUserIdInput,
  setPasswordInput,
  handleClearAll,
}: Params) {
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [isImageConfigOpen, setIsImageConfigOpen] = useState(false);
  const [imageBedConfig, setImageBedConfig] = useState(defaultImageBedConfig);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('valpoint_imagebed_config');
      if (saved) setImageBedConfig({ ...defaultImageBedConfig, ...JSON.parse(saved) });
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleImageBedConfig = () => {
    setIsActionMenuOpen(false);
    setIsImageConfigOpen(true);
  };

  const handleChangePassword = () => {
    if (!userId) {
      setAlertMessage('请先创建或登录一个 ID，再修改密码');
      setIsAuthModalOpen(true);
      return;
    }
    setIsActionMenuOpen(false);
    setPendingUserId(userId);
    setCustomUserIdInput(userId);
    setPasswordInput('');
    setIsAuthModalOpen(true);
  };

  const handleQuickClear = () => {
    setIsActionMenuOpen(false);
    handleClearAll();
  };

  const handleImageConfigSave = (cfg: typeof defaultImageBedConfig) => {
    setImageBedConfig(cfg);
    try {
      localStorage.setItem('valpoint_imagebed_config', JSON.stringify(cfg));
    } catch (e) {
      console.error(e);
    }
    setAlertMessage('图床配置已保存，仅当前设备生效。');
    setIsImageConfigOpen(false);
  };

  return {
    isActionMenuOpen,
    setIsActionMenuOpen,
    isImageConfigOpen,
    setIsImageConfigOpen,
    imageBedConfig,
    setImageBedConfig,
    handleImageBedConfig,
    handleChangePassword,
    handleQuickClear,
    handleImageConfigSave,
  };
}
