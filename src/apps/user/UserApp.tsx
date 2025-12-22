import React from 'react';
import '../../styles/fonts.css';
import '../../index.css';
import 'leaflet/dist/leaflet.css';
import MainView from '../../features/lineups/MainView';
import AppModals from '../../features/lineups/AppModals';
import { useAppController } from '../../features/lineups/useAppController';

/**
 * 个人库应用根组件
 * 保持与原 App.tsx 相同的功能
 */
function UserApp() {
    const { mainViewProps, modalProps } = useAppController();

    return (
        <>
            <MainView {...mainViewProps} />
            <AppModals {...modalProps} />
        </>
    );
}

export default UserApp;
