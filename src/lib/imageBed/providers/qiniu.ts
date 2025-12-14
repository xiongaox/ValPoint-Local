import { ImageBedProviderDefinition, UploadOptions, TransferOptions } from '../types';
import { ImageBedConfig } from '../../../types/imageBed';

export const qiniuDefinition: ImageBedProviderDefinition = {
  provider: 'qiniu',
  label: '七牛云',
  description: '使用七牛云对象存储作为图床',
  defaultConfig: {
    provider: 'qiniu',
    _configName: '',
    accessKey: '',
    secretKey: '',
    bucket: '',
    url: '',
    area: '',
    options: '',
    path: '',
  },
  fields: [
    { key: '_configName', label: '配置名称', required: true, placeholder: '用于区分不同图床配置' },
    { key: 'accessKey', label: 'accessKey', required: true },
    { key: 'secretKey', label: 'secretKey', required: true },
    { key: 'bucket', label: '存储空间名', required: true },
    { key: 'url', label: '访问网址', required: true },
    { key: 'area', label: '存储区域编号', required: true },
    { key: 'options', label: '网址后缀', placeholder: '如：imgslim' },
    { key: 'path', label: '自定义存储路径', placeholder: '如：img/' },
  ],
  upload: async (file: File | Blob, config: ImageBedConfig, options: UploadOptions = {}) => {
    // TODO: 实现七牛云上传逻辑
    throw new Error('七牛云上传功能暂未实现');
  },
  transferImage: async (sourceUrl: string, config: ImageBedConfig, options: TransferOptions = {}) => {
    // TODO: 实现七牛云转存逻辑
    throw new Error('七牛云转存功能暂未实现');
  },
};
