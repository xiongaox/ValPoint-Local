/**
 * imageProcessing - imageProcessing
 *
 * 职责：
 * - 声明imageProcessing相关的数据结构与类型约束。
 * - 为业务逻辑提供类型安全的契约。
 * - 集中管理跨模块共享的类型定义。
 */

export type ImageProcessingSettings = {
  enablePngConversion: boolean;
  pngConvertFormat: 'jpeg' | 'webp';
  jpegQuality: number;
  hideSharedButton?: boolean;
  hideAuthorLinks?: boolean;
};

export const defaultImageProcessingSettings: ImageProcessingSettings = {
  enablePngConversion: true,
  pngConvertFormat: 'webp',
  jpegQuality: 0.82,
  hideSharedButton: false,
  hideAuthorLinks: false,
};
