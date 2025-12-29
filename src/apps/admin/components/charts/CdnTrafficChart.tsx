/**
 * CdnTrafficChart - CDN 流量消耗柱形图
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
} from 'recharts';

// 模拟数据：过去7天CDN流量 (单位: GB)
const mockData = [
    { day: '12/23', traffic: 12.5 },
    { day: '12/24', traffic: 18.2 },
    { day: '12/25', traffic: 25.8 },
    { day: '12/26', traffic: 22.1 },
    { day: '12/27', traffic: 19.6 },
    { day: '12/28', traffic: 28.4 },
    { day: '12/29', traffic: 15.3 },
];

const TOTAL_TRAFFIC = mockData.reduce((sum, item) => sum + item.traffic, 0);

export default function CdnTrafficChart() {
    return (
        <div className="bg-[#1f2326] rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">CDN 流量消耗</h3>
                <span className="text-sm text-gray-400">本周共 {TOTAL_TRAFFIC.toFixed(1)} GB</span>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="day" stroke="#666" fontSize={12} />
                        <YAxis stroke="#666" fontSize={12} unit=" GB" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1f2326',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                            }}
                            formatter={(value) => [`${value} GB`, '流量']}
                            labelStyle={{ color: '#fff' }}
                        />
                        <Bar
                            dataKey="traffic"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
