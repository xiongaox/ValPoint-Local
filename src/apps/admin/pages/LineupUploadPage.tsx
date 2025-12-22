import React, { useState, useRef } from 'react';
import Icon from '../../../components/Icon';

/**
 * 点位包上传页面
 */
function LineupUploadPage() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files).filter(
            (file) => file.name.endsWith('.zip')
        );
        setUploadedFiles((prev) => [...prev, ...files]);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files).filter(
                (file) => file.name.endsWith('.zip')
            );
            setUploadedFiles((prev) => [...prev, ...files]);
        }
    };

    const handleUpload = async () => {
        if (uploadedFiles.length === 0) return;

        setIsUploading(true);
        // TODO: 实现真实的上传逻辑
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsUploading(false);
        setUploadedFiles([]);
        alert('上传成功！');
    };

    const removeFile = (index: number) => {
        setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-6">
            {/* 上传说明 */}
            <div className="bg-[#1f2326] rounded-xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold mb-4">上传点位包</h3>
                <p className="text-sm text-gray-400 mb-4">
                    上传 ZIP 格式的点位数据包，文件名格式：
                    <code className="mx-1 px-2 py-0.5 bg-[#0f1923] rounded text-[#ff4655]">
                        地图名_特工名_技能_描述.zip
                    </code>
                </p>
                <p className="text-xs text-gray-500">
                    示例：亚海悬城_不死鸟_技能Q_B外-吸点火.zip
                </p>
            </div>

            {/* 上传区域 */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`bg-[#1f2326] rounded-xl border-2 border-dashed p-12 text-center cursor-pointer transition-all ${isDragging
                        ? 'border-[#ff4655] bg-[#ff4655]/10'
                        : 'border-white/10 hover:border-white/30'
                    }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".zip"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <div className="w-16 h-16 bg-[#ff4655]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="Upload" size={32} className="text-[#ff4655]" />
                </div>
                <h4 className="text-lg font-medium text-white mb-2">
                    {isDragging ? '释放文件开始上传' : '拖拽文件到此处'}
                </h4>
                <p className="text-sm text-gray-400">或点击选择文件</p>
                <p className="text-xs text-gray-500 mt-2">仅支持 ZIP 格式</p>
            </div>

            {/* 已选择的文件 */}
            {uploadedFiles.length > 0 && (
                <div className="bg-[#1f2326] rounded-xl border border-white/10 p-6">
                    <h4 className="text-sm font-semibold text-gray-400 mb-4">
                        已选择 {uploadedFiles.length} 个文件
                    </h4>
                    <div className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-[#0f1923] rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <Icon name="FileArchive" size={18} className="text-[#ff4655]" />
                                    <div>
                                        <div className="text-sm text-white">{file.name}</div>
                                        <div className="text-xs text-gray-500">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFile(index)}
                                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <Icon name="X" size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="mt-4 w-full py-3 bg-[#ff4655] hover:bg-[#ff5a67] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isUploading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                上传中...
                            </>
                        ) : (
                            <>
                                <Icon name="Upload" size={18} />
                                开始上传
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}

export default LineupUploadPage;
