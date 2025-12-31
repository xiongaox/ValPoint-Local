/**
 * Icon - Icon
 *
 * 职责：
 * - 渲染Icon相关的界面结构与样式。
 * - 处理用户交互与状态变更并触发回调。
 * - 组合子组件并提供可配置项。
 */

// @ts-nocheck
import React from 'react';
import * as lucideIcons from 'lucide-react';

export type IconName = keyof typeof lucideIcons;

const Icon: React.FC<{ name: IconName; size?: number; className?: string }> = ({
  name,
  size = 18,
  className = '',
}) => {
  const Lucide = lucideIcons[name];
  if (!Lucide) return null;
  return <Lucide size={size} className={className} />;
};

export default Icon;
