/**
 * DashboardPage - 管理后台概览页
 * 
 * 职责：
 * - 展示应用核心指标统计（点位总数、共享总数、用户总数、今日下载等）
 * - 渲染多维度的趋势图表 (Retention, Storage, CDN, API, Reviews)
 * - 提供快速审核入口指示
 */
import React, { useState, useEffect } from 'react';
import Icon, { IconName } from '../../../components/Icon';

// 图表组件
import RetentionChart from '../components/charts/RetentionChart';
import StorageChart from '../components/charts/StorageChart';
import DailyDownloadsChart from '../components/charts/DailyDownloadsChart';
import ReviewStatsChart from '../components/charts/ReviewStatsChart';

interface StatsCard {
    label: string;
    value: number | string;
    icon: IconName;
    color: string;
    trend?: { value: number; isUp: boolean };
}

/**
 * 统计仪表盘页面
 */
function DashboardPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<StatsCard[]>([]);

    useEffect(() => {
        // TODO: 从 Supabase 加载真实数据
        const mockStats: StatsCard[] = [
            {
                label: '总点位数',
                value: 1234,
                icon: 'MapPin',
                color: 'bg-blue-500/20 text-blue-400',
                trend: { value: 12, isUp: true },
            },
            {
                label: '今日新增',
                value: 23,
                icon: 'TrendingUp',
                color: 'bg-emerald-500/20 text-emerald-400',
                trend: { value: 5, isUp: true },
            },
            {
                label: '注册用户',
                value: 456,
                icon: 'Users',
                color: 'bg-purple-500/20 text-purple-400',
                trend: { value: 8, isUp: true },
            },
            {
                label: '今日下载',
                value: 89,
                icon: 'Download',
                color: 'bg-orange-500/20 text-orange-400',
                trend: { value: 3, isUp: false },
            },
        ];

        setTimeout(() => {
            setStats(mockStats);
            setIsLoading(false);
        }, 500);
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-3 border-[#ff4655] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex gap-4 items-start h-[calc(100vh-100px)] overflow-hidden">
            {/* 左侧主内容区 - Flex 布局自动填充高度 */}
            <div className="flex-1 flex flex-col gap-4 min-w-0 h-full overflow-hidden">
                {/* 统计卡片 - 固定高度 */}
                <div className="flex-none grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="bg-[#1f2326] rounded-xl border border-white/10 p-3 flex items-center justify-between"
                        >
                            <div>
                                <div className="text-sm text-gray-400 mb-0.5">{stat.label}</div>
                                <div className="text-xl font-bold text-white flex items-baseline gap-2">
                                    {typeof stat.value === 'number'
                                        ? stat.value.toLocaleString()
                                        : stat.value}
                                    {stat.trend && (
                                        <span
                                            className={`flex items-center text-xs ${stat.trend.isUp ? 'text-emerald-400' : 'text-red-400'
                                                }`}
                                        >
                                            <Icon
                                                name={stat.trend.isUp ? 'TrendingUp' : 'TrendingDown'}
                                                size={10}
                                                className="mr-0.5"
                                            />
                                            {stat.trend.value}%
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className={`p-2 rounded-lg ${stat.color}`}>
                                <Icon name={stat.icon} size={18} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* 第一行图表 - 自动填充剩余高度的一半 */}
                <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <RetentionChart />
                    <StorageChart />
                </div>

                {/* 第二行图表 - 自动填充剩余高度的一半 */}
                <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <DailyDownloadsChart />
                    <ReviewStatsChart />
                </div>
            </div>

            {/* 右侧最近活动侧边栏 - 高度填满，内部滚动 */}
            <div className="w-80 shrink-0 hidden xl:block h-full">
                <div className="bg-[#1f2326] rounded-xl border border-white/10 p-4 h-full flex flex-col">
                    <h3 className="text-lg font-semibold mb-4 flex-none">最近活动</h3>
                    <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar pr-2">
                        {[
                            { action: '上传了新点位', user: 'admin@example.com', time: '2 分钟前' },
                            { action: '用户注册', user: 'test@gmail.com', time: '15 分钟前' },
                            { action: '下载了点位包', user: 'user@qq.com', time: '1 小时前' },
                            { action: '审核通过点位', user: 'admin@example.com', time: '2 小时前' },
                            { action: '新投稿待审核', user: 'player@val.gg', time: '3 小时前' },
                            { action: '点位被下载', user: 'gamer@steam.com', time: '4 小时前' },
                            { action: '用户修改资料', user: 'user123@qq.com', time: '5 小时前' },
                            { action: '系统备份完成', user: 'system', time: '6 小时前' },
                            { action: '清理缓存', user: 'system', time: '7 小时前' },
                            { action: '更新隐私政策', user: 'admin@example.com', time: '8 小时前' },
                        ].map((activity, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0"
                            >
                                <div className="w-8 h-8 bg-[#ff4655]/20 rounded-full flex items-center justify-center shrink-0">
                                    <Icon name="Activity" size={14} className="text-[#ff4655]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm text-white">{activity.action}</div>
                                    <div className="text-xs text-gray-500 truncate">{activity.user}</div>
                                    <div className="text-xs text-gray-600 mt-1">{activity.time}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;

