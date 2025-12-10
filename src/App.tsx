import React from 'react';
import SharedLineupView from './features/shared/SharedLineupView';
import MainView from './features/lineups/MainView';
import AppModals from './features/lineups/AppModals';
import Lightbox from './components/Lightbox';
import AlertModal from './components/AlertModal';
import { useAppController } from './features/lineups/useAppController';

function App() {
  const { isSharedView, sharedViewProps, mainViewProps, modalProps, alertProps, lightboxProps } = useAppController();

  if (isSharedView && sharedViewProps) {
    return (
      <>
        <SharedLineupView {...sharedViewProps} />
        <Lightbox {...lightboxProps} />
        <AlertModal {...alertProps} />
      </>
    );
  }

  return (
    <>
      <MainView {...mainViewProps} />
      <AppModals {...modalProps} />
    </>
  );
}

export default App;
