/**
 * MapDistributionChart - 各地图点位分布柱形图
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

// 模拟数据：各地图点位数量（后续可从 Supabase 查询）
const mockData = [
    { map: 'Ascent', count: 186 },
    { map: 'Bind', count: 152 },
    { map: 'Haven', count: 143 },
    { map: 'Split', count: 128 },
    { map: 'Icebox', count: 112 },
    { map: 'Breeze', count: 98 },
    { map: 'Fracture', count: 87 },
    { map: 'Pearl', count: 76 },
    { map: 'Lotus', count: 68 },
    { map: 'Sunset', count: 54 },
    { map: 'Abyss', count: 42 },
];

export default function MapDistributionChart() {
    const total = mockData.reduce((sum, item) => sum + item.count, 0);

    return (
        <div className="bg-[#1f2326] rounded-xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">各地图点位分布</h3>
                <span className="text-sm text-gray-400">共 {total} 个点位</span>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={mockData}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis
                            dataKey="map"
                            stroke="#666"
                            fontSize={10}
                            angle={-35}
                            textAnchor="end"
                            height={50}
                        />
                        <YAxis stroke="#666" fontSize={12} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1f2326',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                            }}
                            formatter={(value) => [`${value} 个`, '点位数']}
                            labelStyle={{ color: '#fff' }}
                        />
                        <Bar
                            dataKey="count"
                            fill="#ff4655"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={35}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
