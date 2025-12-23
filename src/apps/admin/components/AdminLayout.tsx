import React from 'react';
import Icon, { IconName } from '../../../components/Icon';
import { AdminPage } from '../AdminApp';

interface AdminLayoutProps {
    currentPage: AdminPage;
    onPageChange: (page: AdminPage) => void;
    children: React.ReactNode;
}

// 导航菜单配置
const NAV_ITEMS: { id: AdminPage; label: string; icon: IconName }[] = [
    { id: 'dashboard', label: '仪表盘', icon: 'LayoutDashboard' },
    { id: 'users', label: '用户管理', icon: 'Users' },
    { id: 'logs', label: '下载日志', icon: 'FileText' },
    { id: 'upload', label: '上传点位', icon: 'Upload' },
    { id: 'review', label: '审核投稿', icon: 'ClipboardCheck' },
    { id: 'settings', label: '系统设置', icon: 'Settings' },
];

/**
 * 后台管理布局组件
 * 包含侧边导航栏
 */
function AdminLayout({ currentPage, onPageChange, children }: AdminLayoutProps) {
    return (
        <div className="flex h-screen w-screen bg-[#0f1923] text-white overflow-hidden">
            {/* 侧边导航栏 */}
            <div className="w-64 flex-shrink-0 flex flex-col bg-[#1f2326] border-r border-white/10">
                {/* Logo */}
                <div className="h-16 flex items-center px-6 border-b border-white/5">
                    <img src="/brand-logo.svg" alt="VALPOINT" className="h-8" />
                    <span className="ml-2 text-xs text-gray-500 font-mono">ADMIN</span>
                </div>

                {/* 导航菜单 */}
                <nav className="flex-1 p-4 space-y-1">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onPageChange(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${currentPage === item.id
                                ? 'bg-[#ff4655] text-white'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon name={item.icon} size={18} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* 底部链接 */}
                <div className="p-4 border-t border-white/5">
                    <div className="flex flex-col gap-2 text-xs text-gray-500">
                        <a
                            href="/user.html"
                            className="hover:text-white transition-colors"
                        >
                            → 返回个人库
                        </a>
                        <a
                            href="/shared.html"
                            className="hover:text-white transition-colors"
                        >
                            → 查看共享库
                        </a>
                    </div>
                </div>
            </div>

            {/* 主内容区域 */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* 顶部栏 */}
                <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-[#1f2326]">
                    <h1 className="text-lg font-semibold">
                        {NAV_ITEMS.find((item) => item.id === currentPage)?.label || '后台管理'}
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-400">管理员</span>
                        <div className="w-8 h-8 bg-[#ff4655]/20 rounded-full flex items-center justify-center">
                            <Icon name="Shield" size={16} className="text-[#ff4655]" />
                        </div>
                    </div>
                </header>

                {/* 页面内容 */}
                <main className="flex-1 overflow-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;
