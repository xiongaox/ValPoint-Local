/**
 * 邮箱域名白名单验证工具
 * 只允许主流邮箱域名，拒绝企业/域名邮箱
 */

// 允许的邮箱域名列表
const ALLOWED_DOMAINS = [
    // Google
    'gmail.com',
    // 腾讯
    'qq.com',
    'foxmail.com',
    // 网易
    '163.com',
    '126.com',
    'yeah.net',
    // 微软
    'outlook.com',
    'hotmail.com',
    'live.com',
    'msn.com',
    // 新浪/搜狐
    'sina.com',
    'sina.cn',
    'sohu.com',
    // 雅虎
    'yahoo.com',
    'yahoo.cn',
    // iCloud
    'icloud.com',
    'me.com',
    // 其他常用
    'mail.com',
    'protonmail.com',
    'zoho.com',
];

export interface EmailValidationResult {
    isValid: boolean;
    error?: string;
}

/**
 * 验证邮箱格式和域名白名单
 */
export function validateEmail(email: string): EmailValidationResult {
    // 开发环境绕过验证
    const devBypassEmail = import.meta.env.VITE_DEV_BYPASS_EMAIL;
    if (devBypassEmail && email.toLowerCase() === devBypassEmail.toLowerCase()) {
        return { isValid: true };
    }

    // 基础格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return {
            isValid: false,
            error: '请输入有效的邮箱地址',
        };
    }

    // 提取域名
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) {
        return {
            isValid: false,
            error: '邮箱格式不正确',
        };
    }

    // 域名白名单检查
    if (!ALLOWED_DOMAINS.includes(domain)) {
        return {
            isValid: false,
            error: '仅支持主流邮箱（如 Gmail、QQ、163、Outlook 等）',
        };
    }

    return { isValid: true };
}

/**
 * 获取允许的邮箱域名列表
 */
export function getAllowedDomains(): string[] {
    return [...ALLOWED_DOMAINS];
}
