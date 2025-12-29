/**
 * StorageChart - 存储空间占用饼状图
 */
import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Legend,
    Tooltip
} from 'recharts';

// 模拟数据：存储空间分布
const mockData = [
    { name: '图片', value: 2.4, color: '#ff4655' },
    { name: '视频', value: 1.8, color: '#3b82f6' },
    { name: '缩略图', value: 0.6, color: '#10b981' },
    { name: '其他', value: 0.2, color: '#6b7280' },
];

const TOTAL_GB = mockData.reduce((sum, item) => sum + item.value, 0);

export default function StorageChart() {
    return (
        <div className="bg-[#1f2326] rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">存储空间占用</h3>
                <span className="text-sm text-gray-400">{TOTAL_GB.toFixed(1)} GB / 10 GB</span>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={mockData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, value }) => `${name} ${value}GB`}
                            labelLine={{ stroke: '#666' }}
                        >
                            {mockData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1f2326',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                            }}
                            formatter={(value) => [`${value} GB`, '占用']}
                        />
                        <Legend
                            formatter={(value) => <span style={{ color: '#9ca3af' }}>{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
