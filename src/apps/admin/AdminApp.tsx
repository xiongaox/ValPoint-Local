/**
 * AdminApp - 后台管理系统根组件
 * 
 * 职责：
 * - 提供管理员登录检查与侧边栏导航控制
 * - 实现基于环境变量的超级管理员认证
 * - 使用 Supabase anon key 读取数据（无需真实登录态）
 */
import React, { useState } from 'react';
import '../../styles/fonts.css';
import '../../index.css';
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

/** 管理员信息（环境变量登录） */
interface AdminInfo {
    account: string;
    isSuperAdmin: boolean;
}

/**
 * 后台管理应用根组件
 */
function AdminApp() {
    const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');
    const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);

    // 登录成功回调
    const handleLogin = (account: string) => {
        setAdminInfo({
            account,
            isSuperAdmin: true, // 环境变量登录的都是超级管理员
        });
    };

    // 退出登录
    const handleLogout = () => {
        setAdminInfo(null);
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

    // 未登录，显示登录页面
    if (!adminInfo) {
        return <AdminLoginPage onLogin={handleLogin} setAlertMessage={setAlertMessage} />;
    }

    // 已登录，显示管理后台
    return (
        <AdminLayout
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onLogout={handleLogout}
            adminAccount={adminInfo.account}
        >
            {renderPage()}
        </AdminLayout>
    );
}

export default AdminApp;
