/**
 * main.tsx (Admin) - 后台管理系统入口点
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import AdminApp from './AdminApp';
import { preloadPlayerCards } from '../../utils/playerCardAvatars';

// 预加载玩家卡面数据
preloadPlayerCards();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <AdminApp />
    </React.StrictMode>
);
