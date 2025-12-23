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

export type AdminPage = 'dashboard' | 'users' | 'logs' | 'upload' | 'review' | 'shared' | 'settings';

/**
 * 后台管理应用根组件
 */
function AdminApp() {
    const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <DashboardPage />;
            case 'users':
                return <UsersPage />;
            case 'logs':
                return <DownloadLogsPage />;
            case 'upload':
                return <LineupUploadPage />;
            case 'review':
                return <LineupReviewPage />;
            case 'shared':
                return <SharedManagePage />;
            case 'settings':
                return <SettingsPage />;
            default:
                return <DashboardPage />;
        }
    };

    return (
        <AdminLayout currentPage={currentPage} onPageChange={setCurrentPage}>
            {renderPage()}
        </AdminLayout>
    );
}

export default AdminApp;
