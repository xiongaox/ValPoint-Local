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
import CdnTrafficChart from '../components/charts/CdnTrafficChart';
import MapDistributionChart from '../components/charts/MapDistributionChart';
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
        <div className="flex gap-6 items-start">
            {/* 左侧主内容区 */}
            <div className="flex-1 space-y-6 min-w-0">
                {/* 统计卡片 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="bg-[#1f2326] rounded-xl border border-white/10 p-6"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-lg ${stat.color}`}>
                                    <Icon name={stat.icon} size={20} />
                                </div>
                                {stat.trend && (
                                    <div
                                        className={`flex items-center gap-1 text-xs ${stat.trend.isUp ? 'text-emerald-400' : 'text-red-400'
                                            }`}
                                    >
                                        <Icon
                                            name={stat.trend.isUp ? 'TrendingUp' : 'TrendingDown'}
                                            size={12}
                                        />
                                        {stat.trend.value}%
                                    </div>
                                )}
                            </div>
                            <div className="text-2xl font-bold text-white mb-1">
                                {typeof stat.value === 'number'
                                    ? stat.value.toLocaleString()
                                    : stat.value}
                            </div>
                            <div className="text-sm text-gray-400">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* 第一行图表：用户留存 + 存储空间 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <RetentionChart />
                    <StorageChart />
                </div>

                {/* 第二行图表：CDN流量 + 地图分布 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <CdnTrafficChart />
                    <MapDistributionChart />
                </div>

                {/* 第三行：审核统计 */}
                <ReviewStatsChart />
            </div>

            {/* 右侧最近活动侧边栏 */}
            <div className="w-80 shrink-0 hidden xl:block">
                <div className="bg-[#1f2326] rounded-xl border border-white/10 p-6 sticky top-6">
                    <h3 className="text-lg font-semibold mb-4">最近活动</h3>
                    <div className="space-y-3">
                        {[
                            { action: '上传了新点位', user: 'admin@example.com', time: '2 分钟前' },
                            { action: '用户注册', user: 'test@gmail.com', time: '15 分钟前' },
                            { action: '下载了点位包', user: 'user@qq.com', time: '1 小时前' },
                            { action: '审核通过点位', user: 'admin@example.com', time: '2 小时前' },
                            { action: '新投稿待审核', user: 'player@val.gg', time: '3 小时前' },
                            { action: '点位被下载', user: 'gamer@steam.com', time: '4 小时前' },
                            { action: '用户修改资料', user: 'user123@qq.com', time: '5 小时前' },
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

