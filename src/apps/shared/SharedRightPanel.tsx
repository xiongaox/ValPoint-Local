import React from 'react';
import Icon from '../../components/Icon';
import { BaseLineup } from '../../types/lineup';

interface SharedRightPanelProps {
    isLoading: boolean;
    searchQuery: string;
    setSearchQuery: (v: string) => void;
    filteredLineups: BaseLineup[];
    selectedLineupId: string | null;
    handleViewLineup: (id: string) => void;
    handleDownload: (id: string, e?: React.MouseEvent) => void;
    getMapDisplayName: (name: string) => string;
    onOpenFilter: () => void;
}

/**
 * 共享库右侧面板
 * 精简版的 RightPanel，移除了：
 * - Tab 切换（查看/创建）
 * - 新增点位按钮
 * - 自定义 ID 输入
 * - 清空按钮
 * - 删除按钮
 */
function SharedRightPanel({
    isLoading,
    searchQuery,
    setSearchQuery,
    filteredLineups,
    selectedLineupId,
    handleViewLineup,
    handleDownload,
    getMapDisplayName,
    onOpenFilter,
}: SharedRightPanelProps) {
    return (
        <div className="w-[360px] flex-shrink-0 flex flex-col bg-[#1f2326] border-l border-white/10 z-20 shadow-2xl">
            {/* 顶部标题栏 */}
            <div className="h-16 flex items-center justify-between gap-3 px-6 border-b border-white/5 bg-[#1f2326] shadow-sm">
                <div className="flex items-center gap-3">
                    <img src="/brand-logo.svg" alt="Logo" className="w-[168px] h-[32px]" />
                </div>
                <button
                    onClick={onOpenFilter}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <Icon name="Filter" size={14} />
                    筛选
                </button>
            </div>

            {/* 搜索栏 */}
            <div className="p-4 border-b border-white/5">
                <div className="relative">
                    <Icon
                        name="Search"
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="搜索点位..."
                        className="w-full pl-10 pr-4 py-2.5 bg-[#0f1923] border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff4655]/50 focus:border-[#ff4655] transition-colors"
                    />
                </div>
            </div>

            {/* 点位列表 */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="w-8 h-8 border-3 border-[#ff4655] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filteredLineups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                        <Icon name="Inbox" size={32} className="mb-2 opacity-50" />
                        <span className="text-sm">暂无点位</span>
                    </div>
                ) : (
                    <div className="p-2 space-y-1">
                        {filteredLineups.map((lineup) => (
                            <div
                                key={lineup.id}
                                onClick={() => handleViewLineup(lineup.id)}
                                className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${selectedLineupId === lineup.id
                                        ? 'bg-[#ff4655]/20 border border-[#ff4655]/50'
                                        : 'bg-[#0f1923]/50 border border-transparent hover:bg-[#0f1923] hover:border-white/10'
                                    }`}
                            >
                                {/* 特工图标 */}
                                {lineup.agentIcon && (
                                    <img
                                        src={lineup.agentIcon}
                                        alt=""
                                        className="w-10 h-10 rounded-full bg-[#0f1923] border border-white/10"
                                    />
                                )}

                                {/* 点位信息 */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span
                                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${lineup.side === 'attack'
                                                    ? 'bg-red-500/20 text-red-400'
                                                    : 'bg-emerald-500/20 text-emerald-400'
                                                }`}
                                        >
                                            {lineup.side === 'attack' ? 'ATK' : 'DEF'}
                                        </span>
                                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                                            {getMapDisplayName(lineup.mapName)}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-medium text-white truncate">
                                        {lineup.title || '未命名点位'}
                                    </h3>
                                </div>

                                {/* 下载按钮 */}
                                <button
                                    onClick={(e) => handleDownload(lineup.id, e)}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-[#ff4655] hover:bg-[#ff4655]/10 rounded-lg transition-all"
                                    title="下载点位"
                                >
                                    <Icon name="Download" size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 底部统计 */}
            <div className="px-4 py-3 border-t border-white/5 bg-[#181b1f]">
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>共 {filteredLineups.length} 个点位</span>
                    <a
                        href="/user.html"
                        className="text-[#ff4655] hover:text-[#ff6b77] transition-colors"
                    >
                        返回个人库 →
                    </a>
                </div>
            </div>
        </div>
    );
}

export default SharedRightPanel;
