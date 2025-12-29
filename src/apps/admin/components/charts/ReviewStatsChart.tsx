/**
 * ReviewStatsChart - 每周审核点位堆叠柱形图
 */
import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

// 模拟数据：过去4周审核统计
const mockData = [
    { week: '第1周', approved: 45, rejected: 12 },
    { week: '第2周', approved: 62, rejected: 8 },
    { week: '第3周', approved: 38, rejected: 15 },
    { week: '第4周', approved: 71, rejected: 6 },
];

export default function ReviewStatsChart() {
    const totalApproved = mockData.reduce((sum, item) => sum + item.approved, 0);
    const totalRejected = mockData.reduce((sum, item) => sum + item.rejected, 0);

    return (
        <div className="bg-[#1f2326] rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">每周审核统计</h3>
                <div className="flex items-center gap-4 text-sm">
                    <span className="text-emerald-400">通过 {totalApproved}</span>
                    <span className="text-red-400">拒绝 {totalRejected}</span>
                </div>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="week" stroke="#666" fontSize={12} />
                        <YAxis stroke="#666" fontSize={12} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1f2326',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                            }}
                            labelStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Bar
                            dataKey="approved"
                            name="已通过"
                            stackId="a"
                            fill="#10b981"
                            radius={[0, 0, 0, 0]}
                        />
                        <Bar
                            dataKey="rejected"
                            name="已拒绝"
                            stackId="a"
                            fill="#ef4444"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
