/**
 * adminStatsService - 管理后台统计数据服务
 * 
 * 提供聚合查询功能，用于对接仪表盘的真实数据。
 */
import { supabase } from '../supabaseClient';
import { TABLE } from './tables';

export interface DashboardStats {
    totalLineups: number;
    todayNewLineups: number;
    totalUsers: number;
    todayDownloads: number;
    trends: {
        lineups: number;
        users: number;
        downloads: number;
    };
}

export interface RecentActivity {
    id: string;
    action: string;
    user: string;
    time: string;
    created_at: string;
}

/**
 * 计算周环比百分比
 * 公式: ((本周 - 上周) / 上周) * 100
 */
function calculateTrend(current: number, previous: number): number {
    if (previous === 0) {
        return current > 0 ? 100 : 0; // 上周为0时，有增长显示100%，无增长显示0%
    }
    return Math.round(((current - previous) / previous) * 100);
}

/**
 * 获取仪表盘核心指标
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    // 计算本周和上周的时间范围
    const dayOfWeek = now.getDay(); // 0=周日, 1=周一...
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    // 本周一 00:00
    const thisWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToMonday);
    thisWeekStart.setHours(0, 0, 0, 0);

    // 上周一 00:00
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    // 上周日 23:59:59 (本周一的前一毫秒)
    const lastWeekEnd = new Date(thisWeekStart.getTime() - 1);

    // 1. 各项总数
    const [
        { count: totalLineups },
        { count: totalUsers },
        { count: todayNewLineups },
        { data: downloadData }
    ] = await Promise.all([
        supabase.from(TABLE.lineups).select('*', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from(TABLE.lineups).select('*', { count: 'exact', head: true }).gte('created_at', todayStart),
        supabase.from('download_logs').select('download_count').gte('created_at', todayStart)
    ]);

    const todayDownloads = downloadData?.reduce((acc, current) => acc + (current.download_count || 0), 0) || 0;

    // 2. 获取本周和上周的数据用于环比计算
    const [
        { count: thisWeekLineups },
        { count: lastWeekLineups },
        { count: thisWeekUsers },
        { count: lastWeekUsers },
        { data: thisWeekDownloadsData },
        { data: lastWeekDownloadsData }
    ] = await Promise.all([
        // 本周新增点位
        supabase.from(TABLE.lineups).select('*', { count: 'exact', head: true })
            .gte('created_at', thisWeekStart.toISOString()),
        // 上周新增点位
        supabase.from(TABLE.lineups).select('*', { count: 'exact', head: true })
            .gte('created_at', lastWeekStart.toISOString())
            .lte('created_at', lastWeekEnd.toISOString()),
        // 本周新增用户
        supabase.from('user_profiles').select('*', { count: 'exact', head: true })
            .gte('created_at', thisWeekStart.toISOString()),
        // 上周新增用户
        supabase.from('user_profiles').select('*', { count: 'exact', head: true })
            .gte('created_at', lastWeekStart.toISOString())
            .lte('created_at', lastWeekEnd.toISOString()),
        // 本周下载量
        supabase.from('download_logs').select('download_count')
            .gte('created_at', thisWeekStart.toISOString()),
        // 上周下载量
        supabase.from('download_logs').select('download_count')
            .gte('created_at', lastWeekStart.toISOString())
            .lte('created_at', lastWeekEnd.toISOString())
    ]);

    const thisWeekDownloads = thisWeekDownloadsData?.reduce((acc, d) => acc + (d.download_count || 0), 0) || 0;
    const lastWeekDownloads = lastWeekDownloadsData?.reduce((acc, d) => acc + (d.download_count || 0), 0) || 0;

    // 3. 计算周环比趋势
    return {
        totalLineups: totalLineups || 0,
        todayNewLineups: todayNewLineups || 0,
        totalUsers: totalUsers || 0,
        todayDownloads,
        trends: {
            lineups: calculateTrend(thisWeekLineups || 0, lastWeekLineups || 0),
            users: calculateTrend(thisWeekUsers || 0, lastWeekUsers || 0),
            downloads: calculateTrend(thisWeekDownloads, lastWeekDownloads)
        }
    };
}

/**
 * 获取最近活动列表
 */
export async function fetchRecentActivities(): Promise<RecentActivity[]> {
    // 聚合多个表的最新动态
    const [
        { data: newUsers },
        { data: newLineups },
        { data: newDownloads },
        { data: newSubmissions }
    ] = await Promise.all([
        supabase.from('user_profiles').select('id, email, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from(TABLE.lineups).select('id, title, user_id, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('download_logs').select('id, user_email, lineup_title, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('lineup_submissions').select('id, title, submitter_email, status, created_at').order('created_at', { ascending: false }).limit(5)
    ]);

    const activities: RecentActivity[] = [];

    // 用户注册
    newUsers?.forEach(u => activities.push({
        id: `user-${u.id}`,
        action: '新用户注册',
        user: u.email || '未知用户',
        time: formatTimeAgo(u.created_at),
        created_at: u.created_at
    }));

    // 上传点位
    newLineups?.forEach(l => activities.push({
        id: `lineup-${l.id}`,
        action: `上传了新点位: ${l.title}`,
        user: '用户',
        time: formatTimeAgo(l.created_at),
        created_at: l.created_at
    }));

    // 下载记录
    newDownloads?.forEach(d => activities.push({
        id: `download-${d.id}`,
        action: `下载了点位: ${d.lineup_title}`,
        user: d.user_email || '匿名用户',
        time: formatTimeAgo(d.created_at),
        created_at: d.created_at
    }));

    // 投稿状态
    newSubmissions?.forEach(s => activities.push({
        id: `sub-${s.id}`,
        action: `新投稿: ${s.title} (${s.status === 'pending' ? '待审核' : s.status})`,
        user: s.submitter_email || '未知',
        time: formatTimeAgo(s.created_at),
        created_at: s.created_at
    }));

    // 按时间倒序排序并取前 10
    return activities
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);
}

/**
 * 辅助：简单的相对时间格式化
 */
function formatTimeAgo(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return '刚刚';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} 分钟前`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} 小时前`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} 小时前`;
    return `${Math.floor(diffInSeconds / 86400)} 天前`;
}

export interface UserTrend {
    date: string;
    count: number;
}

/**
 * 获取过去 7 天的用户增长趋势
 */
export async function fetchUserGrowthTrends(): Promise<UserTrend[]> {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
        .from('user_profiles')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString());

    if (error) {
        console.error('Error fetching user growth:', error);
        return [];
    }

    // 初始化每天的计数为 0
    const trends: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
        const d = new Date(sevenDaysAgo);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        trends[dateStr] = 0;
    }

    // 聚合数据
    data?.forEach(u => {
        const dateStr = new Date(u.created_at).toISOString().split('T')[0];
        if (trends[dateStr] !== undefined) {
            trends[dateStr]++;
        }
    });

    return Object.entries(trends)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
}
