/**
 * UserGrowthChart - 管理端用户Growth图表
 *
 * 职责：
 * - 渲染管理端用户Growth图表相关的界面结构与样式。
 * - 处理用户交互与状态变更并触发回调。
 * - 组合子组件并提供可配置项。
 */

import React, { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { fetchUserGrowthTrends, UserTrend } from '../../../../services/adminStatsService';
import { format, parseISO } from 'date-fns';

export default function UserGrowthChart() {
    const [data, setData] = useState<UserTrend[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const trends = await fetchUserGrowthTrends();
                setData(trends);
            } catch (err) {
                console.error('Failed to load user growth data', err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const chartData = data.map(item => ({
        ...item,
        displayDate: format(parseISO(item.date), 'MM/dd')
    }));

    return (
        <div className="bg-[#1f2326] rounded-xl border border-white/10 p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-2 flex-none">
                <h3 className="text-sm font-semibold text-white">用户增长趋势 (7天)</h3>
            </div>
            <div className="flex-1 min-h-0">
                {loading ? (
                    <div className="h-full flex items-center justify-center text-gray-500">加载中...</div>
                ) : (
                    <ResponsiveContainer width="99%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="displayDate" stroke="#666" fontSize={12} />
                            <YAxis stroke="#666" fontSize={12} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2326',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                }}
                                formatter={(value) => [`${value} 人`, '新增注册']}
                                labelStyle={{ color: '#fff' }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="count"
                                name="新增用户"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
