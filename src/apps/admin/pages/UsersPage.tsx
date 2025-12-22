import React, { useState } from 'react';
import Icon from '../../../components/Icon';

interface User {
    id: string;
    email: string;
    createdAt: string;
    downloadCount: number;
    isActive: boolean;
}

/**
 * 用户管理页面
 */
function UsersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading] = useState(false);

    // TODO: 从 Supabase 加载真实数据
    const mockUsers: User[] = [
        { id: '1', email: 'user1@gmail.com', createdAt: '2024-12-20', downloadCount: 15, isActive: true },
        { id: '2', email: 'user2@qq.com', createdAt: '2024-12-19', downloadCount: 8, isActive: true },
        { id: '3', email: 'user3@163.com', createdAt: '2024-12-18', downloadCount: 23, isActive: false },
        { id: '4', email: 'test@outlook.com', createdAt: '2024-12-17', downloadCount: 5, isActive: true },
    ];

    const filteredUsers = mockUsers.filter((user) =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* 搜索栏 */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Icon
                        name="Search"
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="搜索用户邮箱..."
                        className="w-full pl-10 pr-4 py-2.5 bg-[#0f1923] border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff4655]/50"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-[#ff4655] hover:bg-[#ff5a67] text-white text-sm font-medium rounded-lg transition-colors">
                    <Icon name="UserPlus" size={16} />
                    添加用户
                </button>
            </div>

            {/* 用户表格 */}
            <div className="bg-[#1f2326] rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                邮箱
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                注册时间
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                下载次数
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                状态
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                操作
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <div className="w-6 h-6 border-2 border-[#ff4655] border-t-transparent rounded-full animate-spin mx-auto" />
                                </td>
                            </tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    暂无用户数据
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-[#ff4655]/20 rounded-full flex items-center justify-center">
                                                <Icon name="User" size={14} className="text-[#ff4655]" />
                                            </div>
                                            <span className="text-sm text-white">{user.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400">{user.createdAt}</td>
                                    <td className="px-6 py-4 text-sm text-white">{user.downloadCount}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${user.isActive
                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                    : 'bg-gray-500/20 text-gray-400'
                                                }`}
                                        >
                                            {user.isActive ? '活跃' : '已禁用'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                                title="编辑"
                                            >
                                                <Icon name="Pencil" size={14} />
                                            </button>
                                            <button
                                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="删除"
                                            >
                                                <Icon name="Trash2" size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* 分页 */}
            <div className="flex items-center justify-between text-sm text-gray-400">
                <span>共 {filteredUsers.length} 个用户</span>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded transition-colors">
                        上一页
                    </button>
                    <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded transition-colors">
                        下一页
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UsersPage;
