/**
 * AdminApp - 管理端应用
 *
 * 职责：
 * - 渲染管理端应用相关的界面结构与样式。
 * - 处理用户交互与状态变更并触发回调。
 * - 组合子组件并提供可配置项。
 */

import React, { useState } from 'react';
import '../../styles/fonts.css';
import '../../index.css';
import { adminSupabase } from '../../supabaseClient';
import AdminLayout from './components/AdminLayout';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import DownloadLogsPage from './pages/DownloadLogsPage';
import LineupUploadPage from './pages/LineupUploadPage';
import SettingsPage from './pages/SettingsPage';
import LineupReviewPage from './pages/LineupReviewPage';
import SharedManagePage from './pages/SharedManagePage';
import AdminLoginPage from './pages/AdminLoginPage';

export type AdminPage = 'dashboard' | 'users' | 'logs' | 'upload' | 'review' | 'shared' | 'settings';

export interface AdminInfo {
    account: string;
    isSuperAdmin: boolean;
    userId?: string;
    nickname?: string;
    avatar?: string;
    role?: 'user' | 'admin' | 'super_admin';
}

function AdminApp() {
    const [currentPage, setCurrentPage] = useState<AdminPage>(() => {
        try {
            const storedPage = localStorage.getItem('valpoint_admin_page');
            if (storedPage && ['dashboard', 'users', 'logs', 'upload', 'review', 'shared', 'settings'].includes(storedPage)) {
                return storedPage as AdminPage;
            }
        } catch (e) {
        }
        return 'dashboard';
    });
    const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(() => {
        try {
            const stored = localStorage.getItem('valpoint_admin_info');
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            return null;
        }
    });
    const [alertMessage, setAlertMessage] = useState<string | null>(null);

    React.useEffect(() => {
        localStorage.setItem('valpoint_admin_page', currentPage);
    }, [currentPage]);

    React.useEffect(() => {
        const checkSession = async () => {
            if (adminInfo?.userId) {
                const { data: { session } } = await adminSupabase.auth.getSession();
                if (!session) {
                    handleLogout();
                }
            }
        };
        checkSession();
    }, []);

    const handleLogin = (info: AdminInfo) => {
        setAdminInfo(info);
        localStorage.setItem('valpoint_admin_info', JSON.stringify(info));
    };

    const handleLogout = () => {
        setAdminInfo(null);
        localStorage.removeItem('valpoint_admin_info');
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <DashboardPage />;
            case 'users':
                return <UsersPage />;
            case 'logs':
                return <DownloadLogsPage />;
            case 'upload':
                return <LineupUploadPage setAlertMessage={setAlertMessage} />;
            case 'review':
                return <LineupReviewPage />;
            case 'shared':
                return <SharedManagePage />;
            case 'settings':
                return <SettingsPage isSuperAdmin={adminInfo?.isSuperAdmin ?? false} />;
            default:
                return <DashboardPage />;
        }
    };

    if (!adminInfo) {
        return <AdminLoginPage onLogin={handleLogin} setAlertMessage={setAlertMessage} />;
    }

    return (
        <AdminLayout
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onLogout={handleLogout}
            adminInfo={adminInfo}
        >
            {renderPage()}
        </AdminLayout>
    );
}

export default AdminApp;
