import { useState } from 'react';

type Params = {
  handleClearAll: () => void;
};

export function useActionMenu({
  handleClearAll,
}: Params) {
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

  const handleQuickClear = () => {
    setIsActionMenuOpen(false);
    handleClearAll();
  };

  return {
    isActionMenuOpen,
    setIsActionMenuOpen,
    handleQuickClear,
  };
}
