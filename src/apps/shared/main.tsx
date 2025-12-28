/**
 * main.tsx (Shared) - 共享库应用入口点
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import SharedApp from './SharedApp';
import { preloadPlayerCards } from '../../utils/playerCardAvatars';

// 预加载玩家卡面数据，减少首次打开头像选择器的延迟
preloadPlayerCards();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <SharedApp />
    </React.StrictMode>
);
