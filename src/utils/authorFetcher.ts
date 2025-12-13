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
    // 抖音 API 需要特殊处理，这里提供基础框架
    // 实际使用可能需要后端代理或第三方服务
    console.warn('抖音作者信息获取暂未实现');
    return null;
  } catch (error) {
    console.error('获取抖音作者信息失败:', error);
    return null;
  }
}
