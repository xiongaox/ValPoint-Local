/**
 * authorLinks - 作者Links
 *
 * 职责：
 * - 声明作者Links相关的数据结构与类型约束。
 * - 为业务逻辑提供类型安全的契约。
 * - 集中管理跨模块共享的类型定义。
 */

export interface AuthorLinks {
    github_url: string;
    tutorial_url: string;
    donate_wechat_qr: string;
    donate_alipay_qr: string;
    contact_wechat_qr: string;
}

export const defaultAuthorLinks: AuthorLinks = {
    github_url: '',
    tutorial_url: '',
    donate_wechat_qr: '',
    donate_alipay_qr: '',
    contact_wechat_qr: '',
};
