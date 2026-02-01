/**
 * shortId - 短ID生成工具
 * 提供简单的随机短ID生成逻辑
 */

export function generateShortId(): string {
    return Math.random().toString(36).substring(2, 10);
}

export function parseShortId(id: string): string {
    return id;
}
