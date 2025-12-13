export type AuthorInfo = {
  name: string;
  avatar: string;
  uid?: string; // B站用户ID，用于拼接个人主页链接
};

// 使用 CORS 代理服务
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

export async function fetchAuthorInfo(sourceLink: string): Promise<AuthorInfo | null> {
  try {
    const url = new URL(sourceLink);
    
    // B站
    if (url.hostname.includes('bilibili.com')) {
      return await fetchBilibiliAuthor(sourceLink);
    }
    
    // 抖音
    if (url.hostname.includes('douyin.com')) {
      return await fetchDouyinAuthor(sourceLink);
    }
    
    return null;
  } catch (error) {
    console.error('获取作者信息失败:', error);
    return null;
  }
}

// 修复 B 站头像 URL（补全协议）
function fixBilibiliAvatar(avatar: string): string {
  if (avatar.startsWith('//')) {
    return 'https:' + avatar;
  }
  if (avatar.startsWith('http://')) {
    return avatar.replace('http://', 'https://');
  }
  return avatar;
}

async function fetchBilibiliAuthor(url: string): Promise<AuthorInfo | null> {
  try {
    // 从 B 站个人主页链接提取 UID
    const spaceMatch = url.match(/space\.bilibili\.com\/(\d+)/);
    if (spaceMatch) {
      const mid = spaceMatch[1];
      const apiUrl = `https://api.bilibili.com/x/web-interface/card?mid=${mid}`;
      
      const response = await fetch(CORS_PROXY + encodeURIComponent(apiUrl));
      const data = await response.json();
      
      if (data.code === 0 && data.data && data.data.card) {
        return {
          name: data.data.card.name,
          avatar: fixBilibiliAvatar(data.data.card.face),
          uid: mid,
        };
      }
    }
    
    // 从 B 站视频链接提取 BV 号
    const bvMatch = url.match(/BV[\w]+/);
    if (bvMatch) {
      const bvid = bvMatch[0];
      const apiUrl = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`;
      
      const response = await fetch(CORS_PROXY + encodeURIComponent(apiUrl));
      const data = await response.json();
      
      if (data.code === 0 && data.data && data.data.owner) {
        return {
          name: data.data.owner.name,
          avatar: fixBilibiliAvatar(data.data.owner.face),
          uid: String(data.data.owner.mid),
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('获取 B 站作者信息失败:', error);
    return null;
  }
}

async function fetchDouyinAuthor(url: string): Promise<AuthorInfo | null> {
  try {
    // 使用项目的 Supabase Edge Function
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('Supabase 配置缺失');
      return null;
    }
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/get-douyin-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`抖音 API 错误 ${response.status}:`, errorText);
      return null;
    }

    const result = await response.json();
    
    if (result.status === 'success' && result.data) {
      // 从抖音主页链接提取 sec_uid
      const secUidMatch = result.data.user_home_url?.match(/\/user\/(MS4wLjABAAAA[A-Za-z0-9_\-]+)/);
      
      return {
        name: result.data.username,
        avatar: result.data.avatar,
        uid: secUidMatch ? secUidMatch[1] : undefined,
      };
    }
    
    return null;
  } catch (error) {
    console.error('获取抖音作者信息失败:', error);
    return null;
  }
}
