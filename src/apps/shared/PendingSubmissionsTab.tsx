/**
 * 待审点位 Tab 内容
 * 显示当前用户提交的点位及其审核状态
 */
import React, { useEffect, useState } from 'react';
import Icon from '../../components/Icon';
import { getUserSubmissions, deleteSubmission, cancelSubmission, deleteSubmissionsByStatus } from '../../lib/submissionUpload';
import { LineupSubmission, SubmissionStatus } from '../../types/submission';

interface Props {
    userId: string | null;
}

/** 状态标签配置 */
const STATUS_CONFIG: Record<SubmissionStatus, { label: string; color: string; bgColor: string; borderColor: string }> = {
    pending: {
        label: '待审核',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30',
    },
    approved: {
        label: '已通过',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/30',
    },
    rejected: {
        label: '已拒绝',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
    },
};

const PendingSubmissionsTab: React.FC<Props> = ({ userId }) => {
    const [submissions, setSubmissions] = useState<LineupSubmission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteMenu, setShowDeleteMenu] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const loadSubmissions = async () => {
        if (!userId) {
            setSubmissions([]);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        const data = await getUserSubmissions(userId);
        setSubmissions(data);
        setIsLoading(false);
    };

    useEffect(() => {
        loadSubmissions();
    }, [userId]);

    // 取消审核
    const handleCancel = async (id: string) => {
        if (!userId) return;
        setIsDeleting(id);
        const result = await cancelSubmission(id, userId);
        if (!result.success) {
            alert(result.error);
        }
        await loadSubmissions();
        setIsDeleting(null);
    };

    // 删除单个
    const handleDelete = async (id: string) => {
        if (!userId) return;
        if (!confirm('确定要删除这条记录吗？')) return;
        setIsDeleting(id);
        const result = await deleteSubmission(id, userId);
        if (!result.success) {
            alert(result.error);
        }
        await loadSubmissions();
        setIsDeleting(null);
    };

    // 批量删除
    const handleBatchDelete = async (filter: 'all' | 'approved' | 'rejected') => {
        if (!userId) return;
        const labels = { all: '所有已审核的', approved: '所有已通过的', rejected: '所有已拒绝的' };
        if (!confirm(`确定要删除${labels[filter]}投稿吗？审核中的不会被删除。`)) return;
        setShowDeleteMenu(false);
        setIsLoading(true);
        const result = await deleteSubmissionsByStatus(userId, filter);
        if (!result.success) {
            alert(result.error);
        } else {
            alert(`已删除 ${result.deletedCount} 条记录`);
        }
        await loadSubmissions();
    };

    // 未登录状态
    if (!userId) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <Icon name="Lock" size={32} className="text-gray-500" />
                </div>
                <p className="text-white font-semibold mb-2">请先登录</p>
                <p className="text-gray-500 text-sm text-center">登录后即可查看您的投稿记录</p>
            </div>
        );
    }

    // 加载中
    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-[#ff4655] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // 无投稿记录
    if (submissions.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                    <Icon name="Inbox" size={32} className="text-gray-500" />
                </div>
                <p className="text-white font-semibold mb-2">暂无投稿记录</p>
                <p className="text-gray-500 text-sm text-center">点击「投稿点位」开始投稿</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* 顶部操作栏 */}
            <div className="p-3 border-b border-white/10 flex items-center justify-between">
                <span className="text-xs text-gray-400">共 {submissions.length} 条记录</span>
                <div className="relative">
                    <button
                        onClick={() => setShowDeleteMenu(!showDeleteMenu)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ff4655] text-white text-xs font-semibold hover:bg-[#ff5b6a] transition-colors"
                    >
                        <Icon name="Trash2" size={14} />
                        删除
                    </button>
                    {showDeleteMenu && (
                        <div className="absolute top-full right-0 mt-1 w-36 bg-[#1f2326] border border-white/10 rounded-lg shadow-xl z-10 overflow-hidden">
                            <button
                                onClick={() => handleBatchDelete('all')}
                                className="w-full px-3 py-2 text-left text-xs text-white hover:bg-white/10 transition-colors"
                            >
                                删除全部
                            </button>
                            <button
                                onClick={() => handleBatchDelete('approved')}
                                className="w-full px-3 py-2 text-left text-xs text-emerald-400 hover:bg-white/10 transition-colors"
                            >
                                删除已通过
                            </button>
                            <button
                                onClick={() => handleBatchDelete('rejected')}
                                className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-white/10 transition-colors"
                            >
                                删除已拒绝
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* 列表 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {submissions.map((item) => {
                    const statusConfig = STATUS_CONFIG[item.status];
                    const isProcessing = isDeleting === item.id;
                    return (
                        <div
                            key={item.id}
                            className="p-4 rounded-lg border border-white/10 bg-[#0f1923] space-y-3"
                        >
                            {/* 标题行 */}
                            <div className="flex items-center justify-between gap-2">
                                <h4 className="text-sm font-bold text-white truncate flex-1">
                                    {item.title}
                                </h4>
                                <span
                                    className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${statusConfig.color} ${statusConfig.bgColor} ${statusConfig.borderColor}`}
                                >
                                    {statusConfig.label}
                                </span>
                            </div>

                            {/* 详情行 */}
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{item.map_name}</span>
                                <span>·</span>
                                <span>{item.agent_name}</span>
                                <span>·</span>
                                <span className={item.side === 'attack' ? 'text-red-400' : 'text-emerald-400'}>
                                    {item.side === 'attack' ? '进攻' : '防守'}
                                </span>
                            </div>

                            {/* 时间 */}
                            <div className="text-[10px] text-gray-600">
                                投稿于 {new Date(item.created_at).toLocaleString('zh-CN')}
                            </div>

                            {/* 拒绝理由 */}
                            {item.status === 'rejected' && item.reject_reason && (
                                <div className="p-2 rounded bg-red-500/10 border border-red-500/20">
                                    <p className="text-xs text-red-400">
                                        <span className="font-bold">拒绝理由：</span>
                                        {item.reject_reason}
                                    </p>
                                </div>
                            )}

                            {/* 操作按钮 */}
                            <div className="flex justify-end">
                                {item.status === 'pending' ? (
                                    <button
                                        onClick={() => handleCancel(item.id)}
                                        disabled={isProcessing}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-amber-400 border border-amber-500/30 hover:bg-amber-500/10 transition-colors disabled:opacity-50"
                                    >
                                        <Icon name="X" size={12} />
                                        {isProcessing ? '处理中...' : '取消审核'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        disabled={isProcessing}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                    >
                                        <Icon name="Trash2" size={12} />
                                        {isProcessing ? '删除中...' : '删除'}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PendingSubmissionsTab;

