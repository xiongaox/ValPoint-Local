import React, { useState, useEffect } from 'react';
import Icon from '../../../components/Icon';
import { getSystemSettings, updateSystemSettings } from '../../../lib/systemSettings';

interface Settings {
    dailyDownloadLimit: number;
    enableEmailVerification: boolean;
    enableDownloadLogs: boolean;
    maintenanceMode: boolean;
}

interface LibraryUrls {
    personalLibraryUrl: string;
    sharedLibraryUrl: string;
}

/**
 * 系统设置页面
 */
function SettingsPage() {
    const [settings, setSettings] = useState<Settings>({
        dailyDownloadLimit: 5,
        enableEmailVerification: true,
        enableDownloadLogs: true,
        maintenanceMode: false,
    });
    const [libraryUrls, setLibraryUrls] = useState<LibraryUrls>({
        personalLibraryUrl: '',
        sharedLibraryUrl: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // 从 Supabase 加载域名配置
    useEffect(() => {
        async function loadSettings() {
            setIsLoading(true);
            const settings = await getSystemSettings();
            if (settings) {
                setLibraryUrls({
                    personalLibraryUrl: settings.personal_library_url || '',
                    sharedLibraryUrl: settings.shared_library_url || '',
                });
            }
            setIsLoading(false);
        }
        loadSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        // 保存域名配置到 Supabase
        const result = await updateSystemSettings({
            personal_library_url: libraryUrls.personalLibraryUrl,
            shared_library_url: libraryUrls.sharedLibraryUrl,
        });

        if (result.success) {
            alert('设置已保存');
        } else {
            alert('保存失败: ' + (result.error || '未知错误'));
        }
        setIsSaving(false);
    };

    if (isLoading) {
        return (
            <div className="max-w-2xl flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-[#ff4655] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl space-y-6">
            {/* 下载限制 */}
            <div className="bg-[#1f2326] rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold mb-4">下载限制</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            每日下载次数限制
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="number"
                                value={settings.dailyDownloadLimit}
                                onChange={(e) =>
                                    setSettings((prev) => ({
                                        ...prev,
                                        dailyDownloadLimit: parseInt(e.target.value) || 0,
                                    }))
                                }
                                min={1}
                                max={100}
                                className="w-32 px-4 py-2.5 bg-[#0f1923] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff4655]/50"
                            />
                            <span className="text-sm text-gray-500">次/人/天</span>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            每个用户每天最多可下载的点位数量
                        </p>
                    </div>
                </div>
            </div>

            {/* 功能开关 */}
            <div className="bg-[#1f2326] rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold mb-4">功能开关</h3>
                <div className="space-y-4">
                    {/* 邮箱验证 */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-white">强制邮箱验证</div>
                            <div className="text-xs text-gray-500">用户必须验证邮箱才能下载</div>
                        </div>
                        <button
                            onClick={() =>
                                setSettings((prev) => ({
                                    ...prev,
                                    enableEmailVerification: !prev.enableEmailVerification,
                                }))
                            }
                            className={`relative w-12 h-6 rounded-full transition-colors ${settings.enableEmailVerification ? 'bg-[#ff4655]' : 'bg-gray-600'
                                }`}
                        >
                            <div
                                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.enableEmailVerification ? 'left-6' : 'left-0.5'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* 下载日志 */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-white">记录下载日志</div>
                            <div className="text-xs text-gray-500">记录用户的下载行为</div>
                        </div>
                        <button
                            onClick={() =>
                                setSettings((prev) => ({
                                    ...prev,
                                    enableDownloadLogs: !prev.enableDownloadLogs,
                                }))
                            }
                            className={`relative w-12 h-6 rounded-full transition-colors ${settings.enableDownloadLogs ? 'bg-[#ff4655]' : 'bg-gray-600'
                                }`}
                        >
                            <div
                                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.enableDownloadLogs ? 'left-6' : 'left-0.5'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* 维护模式 */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-white">维护模式</div>
                            <div className="text-xs text-gray-500">开启后共享库暂停访问</div>
                        </div>
                        <button
                            onClick={() =>
                                setSettings((prev) => ({
                                    ...prev,
                                    maintenanceMode: !prev.maintenanceMode,
                                }))
                            }
                            className={`relative w-12 h-6 rounded-full transition-colors ${settings.maintenanceMode ? 'bg-orange-500' : 'bg-gray-600'
                                }`}
                        >
                            <div
                                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.maintenanceMode ? 'left-6' : 'left-0.5'
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* 域名配置 */}
            <div className="bg-[#1f2326] rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold mb-4">库切换域名</h3>
                <p className="text-xs text-gray-500 mb-4">
                    配置后，用户可以在个人库和共享库之间通过按钮快速切换
                </p>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            个人库域名
                        </label>
                        <input
                            type="url"
                            value={libraryUrls.personalLibraryUrl}
                            onChange={(e) =>
                                setLibraryUrls((prev) => ({
                                    ...prev,
                                    personalLibraryUrl: e.target.value,
                                }))
                            }
                            placeholder="https://personal.example.com"
                            className="w-full px-4 py-2.5 bg-[#0f1923] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff4655]/50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">
                            共享库域名
                        </label>
                        <input
                            type="url"
                            value={libraryUrls.sharedLibraryUrl}
                            onChange={(e) =>
                                setLibraryUrls((prev) => ({
                                    ...prev,
                                    sharedLibraryUrl: e.target.value,
                                }))
                            }
                            placeholder="https://shared.example.com"
                            className="w-full px-4 py-2.5 bg-[#0f1923] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff4655]/50"
                        />
                    </div>
                </div>
            </div>

            {/* 保存按钮 */}
            <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-3 bg-[#ff4655] hover:bg-[#ff5a67] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isSaving ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        保存中...
                    </>
                ) : (
                    <>
                        <Icon name="Save" size={18} />
                        保存设置
                    </>
                )}
            </button>
        </div>
    );
}

export default SettingsPage;
