/**
 * main - 主入口
 *
 * 职责：
 * - 渲染主入口相关的界面结构与样式。
 * - 处理用户交互与状态变更并触发回调。
 * - 组合子组件并提供可配置项。
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import UserApp from './apps/user/UserApp';
import './styles/fonts.css';
import './index.css';
import 'leaflet/dist/leaflet.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <UserApp />
  </React.StrictMode>,
);
