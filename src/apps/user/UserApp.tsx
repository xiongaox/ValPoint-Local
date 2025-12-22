import React from 'react';
import '../../styles/fonts.css';
import '../../index.css';
import 'leaflet/dist/leaflet.css';
import SharedLineupView from '../../features/shared/SharedLineupView';
import MainView from '../../features/lineups/MainView';
import AppModals from '../../features/lineups/AppModals';
import Lightbox from '../../components/Lightbox';
import AlertModal from '../../components/AlertModal';
import { useAppController } from '../../features/lineups/useAppController';

/**
 * 个人库应用根组件
 * 保持与原 App.tsx 相同的功能
 */
function UserApp() {
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

export default UserApp;
