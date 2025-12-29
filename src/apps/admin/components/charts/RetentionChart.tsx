/**
 * RetentionChart - 用户留存/回访率折线图
 */
import React from 'react';
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

// 模拟数据：过去7天的留存率
const mockData = [
    { day: '周一', newUsers: 120, returning: 85, rate: 71 },
    { day: '周二', newUsers: 98, returning: 72, rate: 73 },
    { day: '周三', newUsers: 145, returning: 112, rate: 77 },
    { day: '周四', newUsers: 132, returning: 95, rate: 72 },
    { day: '周五', newUsers: 168, returning: 138, rate: 82 },
    { day: '周六', newUsers: 210, returning: 175, rate: 83 },
    { day: '周日', newUsers: 195, returning: 158, rate: 81 },
];

export default function RetentionChart() {
    return (
        <div className="bg-[#1f2326] rounded-xl border border-white/10 p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-2 flex-none">
                <h3 className="text-sm font-semibold text-white">用户留存率</h3>
                <div className="flex gap-2"></div>
            </div>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="day" stroke="#666" fontSize={12} />
                        <YAxis stroke="#666" fontSize={12} unit="%" />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1f2326',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                            }}
                            labelStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="rate"
                            name="留存率"
                            stroke="#ff4655"
                            strokeWidth={2}
                            dot={{ fill: '#ff4655', strokeWidth: 2 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
