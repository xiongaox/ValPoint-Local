/**
 * main.tsx (User) - 共享库个人中心入口点
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import UserApp from './UserApp';
import { preloadPlayerCards } from '../../utils/playerCardAvatars';

// 预加载玩家卡面数据，减少首次打开头像选择器的延迟
preloadPlayerCards();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <UserApp />
    </React.StrictMode>
);
