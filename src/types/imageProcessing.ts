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
