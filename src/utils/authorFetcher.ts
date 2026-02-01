/**
 * authorFetcher - 作者信息抓取工具
 * 通过调用后端代理 API 获取视频作者的详细信息（如 B站、抖音等）
 */

export interface AuthorInfo {
    username: string;
    avatar: string;
    user_home_url: string;
    uid?: string;
    source: string;
}

/**
 * 从 B站/抖音 视频链接获取作者信息
 */
export async function fetchAuthorInfo(url: string): Promise<AuthorInfo | null> {
    try {
        const response = await fetch('/api/proxy/author', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
        });

        if (!response.ok) {
            console.error('获取作者信息失败');
            return null;
        }

        const result = await response.json();
        return result.data;
    } catch (error) {
        console.error('获取作者信息失败:', error);
        return null;
    }
}
