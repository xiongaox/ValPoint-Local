/**
 * 向后兼容：重新导出统一上传接口
 */
import { ImageBedConfig } from '../types/imageBed';
import { uploadImage } from '../lib/imageBed';

export const uploadToOss = async (file: File | Blob, config: ImageBedConfig) => {
  return uploadImage(file, config);
};

export type { ImageBedConfig } from '../types/imageBed';
