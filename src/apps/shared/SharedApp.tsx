import React, { useState } from 'react';
import '../../styles/fonts.css';
import '../../index.css';
import 'leaflet/dist/leaflet.css';
import { useEmailAuth } from '../../hooks/useEmailAuth';
import SharedLoginPage from './SharedLoginPage';
import SharedMainView from './SharedMainView';
import Lightbox from '../../components/Lightbox';
import AlertModal from '../../components/AlertModal';
import { LightboxImage } from '../../types/ui';

/**
 * 共享库应用根组件
 * 开放浏览，下载时需要登录
 */
function SharedApp() {
    const { user, isLoading, signOut, signInWithEmail } = useEmailAuth();
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [viewingImage, setViewingImage] = useState<LightboxImage | null>(null);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // 认证加载中（短暂等待）
    if (isLoading) {
        return (
            <div className="flex h-screen w-screen bg-[#0f1923] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#ff4655] border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-400 text-sm">加载中...</span>
                </div>
            </div>
        );
    }

    // 显示登录弹窗
    if (showLoginModal && !user) {
        return (
            <>
                <SharedLoginPage
                    setAlertMessage={setAlertMessage}
                    onBack={() => setShowLoginModal(false)}
                />
                <AlertModal
                    message={alertMessage}
                    onClose={() => setAlertMessage(null)}
                />
            </>
        );
    }

    // 直接显示共享库主视图（无论是否登录）
    return (
        <>
            <SharedMainView
                user={user}
                onSignOut={signOut}
                setAlertMessage={setAlertMessage}
                setViewingImage={setViewingImage}
                onRequestLogin={() => setShowLoginModal(true)}
            />
            <Lightbox
                viewingImage={viewingImage}
                setViewingImage={setViewingImage}
            />
            <AlertModal
                message={alertMessage}
                onClose={() => setAlertMessage(null)}
            />
        </>
    );
}

export default SharedApp;
