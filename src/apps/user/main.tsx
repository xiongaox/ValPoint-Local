/**
 * main - 个人库主入口
 *
 * 职责：
 * - 渲染个人库主入口相关的界面结构与样式。
 * - 处理用户交互与状态变更并触发回调。
 * - 组合子组件并提供可配置项。
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import UserApp from './UserApp';
import { preloadPlayerCards } from '../../utils/playerCardAvatars';

preloadPlayerCards();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <UserApp />
    </React.StrictMode>
);
