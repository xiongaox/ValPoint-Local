/**
 * PendingSubmissionsDrawer - 个人库待审投稿Drawer
 *
 * 职责：
 * - 渲染个人库待审投稿Drawer相关的界面结构与样式。
 * - 处理用户交互与状态变更并触发回调。
 * - 组合子组件并提供可配置项。
 */

import React, { useState, useEffect } from 'react';
import Icon from '../../components/Icon';
import PendingSubmissionsTab from '../shared/PendingSubmissionsTab';
import { useEscapeClose } from '../../hooks/useEscapeClose';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null;
}

const PendingSubmissionsDrawer: React.FC<Props> = ({ isOpen, onClose, userId }) => {
    useEscapeClose(isOpen, onClose);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1200] pointer-events-none flex justify-end">
            <div className="pointer-events-auto h-full w-[383px] max-w-[383px] min-w-[383px] bg-[#10151b]/95 backdrop-blur-md border-l border-[#1b1f2a] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
                <div className="flex items-start justify-between gap-3 p-5 border-b border-[#1b1f2a] bg-[#1f2326]/90">
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Icon name="Clock" className="text-amber-400" /> 我的投稿
                        </h2>
                        <p className="text-xs text-gray-500">查看已提交的点位审核状态</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg border border-[#1b1f2a] text-gray-400 hover:text-white hover:border-[#ff4655]/50 transition-colors"
                    >
                        <Icon name="X" size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <PendingSubmissionsTab userId={userId} />
                </div>
            </div>
        </div>
    );
};

export default PendingSubmissionsDrawer;
