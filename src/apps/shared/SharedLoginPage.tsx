import React, { useState } from 'react';
import Icon from '../../components/Icon';
import { useEmailAuth } from '../../hooks/useEmailAuth';
import { validateEmail } from '../../lib/emailValidator';

interface SharedLoginPageProps {
    setAlertMessage: (msg: string | null) => void;
    onBack?: () => void; // 可选的返回回调
}

/**
 * 共享库登录页面
 * 使用邮箱 Magic Link 登录
 */
function SharedLoginPage({ setAlertMessage, onBack }: SharedLoginPageProps) {
    const { signInWithEmail } = useEmailAuth();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        setValidationError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 验证邮箱
        const validation = validateEmail(email);
        if (!validation.isValid) {
            setValidationError(validation.error || '邮箱格式不正确');
            return;
        }

        setIsSubmitting(true);
        const result = await signInWithEmail(email);
        setIsSubmitting(false);

        if (result.success) {
            setIsSent(true);
        } else {
            setAlertMessage(result.error || '发送登录链接失败');
        }
    };

    return (
        <div className="flex h-screen w-screen bg-[#0f1923] items-center justify-center">
            <div className="w-full max-w-md px-8">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <img src="/brand-logo.svg" alt="VALPOINT" className="h-10" />
                </div>

                {/* 登录卡片 */}
                <div className="bg-[#1f2326] rounded-xl border border-white/10 p-8 shadow-2xl">
                    <h1 className="text-2xl font-bold text-white mb-2 text-center">
                        共享库登录
                    </h1>
                    <p className="text-gray-400 text-sm mb-6 text-center">
                        浏览社区分享的技能点位
                    </p>

                    {isSent ? (
                        /* 发送成功状态 */
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Icon name="Mail" size={32} className="text-emerald-400" />
                            </div>
                            <h2 className="text-lg font-semibold text-white mb-2">
                                登录链接已发送！
                            </h2>
                            <p className="text-gray-400 text-sm mb-4">
                                请检查 <span className="text-white font-medium">{email}</span> 的收件箱
                            </p>
                            <p className="text-gray-500 text-xs">
                                链接有效期 1 小时，如未收到请检查垃圾邮件
                            </p>
                            <button
                                onClick={() => setIsSent(false)}
                                className="mt-6 text-sm text-[#ff4655] hover:text-[#ff6b77] transition-colors"
                            >
                                使用其他邮箱
                            </button>
                        </div>
                    ) : (
                        /* 登录表单 */
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm text-gray-400 mb-2">
                                    邮箱地址
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    placeholder="your@email.com"
                                    className={`w-full px-4 py-3 bg-[#0f1923] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${validationError
                                        ? 'border-red-500 focus:ring-red-500/50'
                                        : 'border-white/10 focus:ring-[#ff4655]/50 focus:border-[#ff4655]'
                                        }`}
                                    disabled={isSubmitting}
                                    autoFocus
                                />
                                {validationError && (
                                    <p className="mt-2 text-sm text-red-400">{validationError}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting || !email.trim()}
                                className="w-full py-3 bg-[#ff4655] hover:bg-[#ff5a67] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        发送中...
                                    </>
                                ) : (
                                    <>
                                        <Icon name="Send" size={18} />
                                        发送登录链接
                                    </>
                                )}
                            </button>

                            <p className="mt-4 text-xs text-gray-500 text-center">
                                仅支持主流邮箱（Gmail、QQ、163、Outlook 等）
                            </p>
                        </form>
                    )}
                </div>

                {/* 返回链接 */}
                <div className="mt-6 text-center space-y-2">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="block w-full text-sm text-[#ff4655] hover:text-[#ff6b77] transition-colors"
                        >
                            ← 返回继续浏览
                        </button>
                    )}
                    <a
                        href="/user.html"
                        className="block text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        返回个人库
                    </a>
                </div>
            </div>
        </div>
    );
}

export default SharedLoginPage;
