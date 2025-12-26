/**
 * AuthorLinks - 作者信息链接类型定义
 * 
 * 用于配置地图右上角的快捷按钮：
 * - 项目地址 (GitHub)
 * - 使用教程
 * - 打赏作者 (微信/支付宝收款码)
 * - 联系作者 (微信二维码)
 */

export interface AuthorLinks {
    /** GitHub 项目地址 */
    github_url: string;
    /** 使用教程地址 */
    tutorial_url: string;
    /** 微信收款码图片 URL */
    donate_wechat_qr: string;
    /** 支付宝收款码图片 URL */
    donate_alipay_qr: string;
    /** 微信二维码图片 URL */
    contact_wechat_qr: string;
}

/** 默认空配置 */
export const defaultAuthorLinks: AuthorLinks = {
    github_url: '',
    tutorial_url: '',
    donate_wechat_qr: '',
    donate_alipay_qr: '',
    contact_wechat_qr: '',
};
