import React, { useState, useEffect } from 'react';

import './index.css';
import 'leaflet/dist/leaflet.css';
import MainView from './features/lineups/MainView';
import AppModals from './features/lineups/AppModals';
import { useAppController } from './features/lineups/useAppController';
import AlertModal from './components/AlertModal';

function App() {
    const { mainViewProps, modalProps } = useAppController();

    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [isAlertFading, setIsAlertFading] = useState(false);
    const [confirmState, setConfirmState] = useState<{
        message: string;
        onConfirm: () => void;
    } | null>(null);

    // 自动淡出警告信息
    useEffect(() => {
        if (alertMessage) {
            setIsAlertFading(false);
            const fadeTimer = setTimeout(() => {
                setIsAlertFading(true);
            }, 4500);

            const hideTimer = setTimeout(() => {
                setAlertMessage(null);
                setIsAlertFading(false);
            }, 5000);

            return () => {
                clearTimeout(fadeTimer);
                clearTimeout(hideTimer);
            };
        }
    }, [alertMessage]);

    return (
        <>
            <MainView {...mainViewProps} />
            <AppModals {...modalProps} />

            <AlertModal
                message={confirmState?.message ?? null}
                onClose={() => setConfirmState(null)}
                actionLabel="取消"
                secondaryLabel="确定"
                onSecondary={confirmState?.onConfirm}
            />

            {alertMessage && (
                <div
                    className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[2000] bg-[#1f2326] border border-white/10 rounded-xl px-6 py-3 shadow-xl transition-opacity duration-500 ${isAlertFading ? 'opacity-0' : 'opacity-100'}`}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-white text-sm">{alertMessage}</span>
                        <button
                            onClick={() => setAlertMessage(null)}
                            className="text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default App;
