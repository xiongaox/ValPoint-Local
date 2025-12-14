import { ImageBedProviderDefinition, UploadOptions, TransferOptions } from '../types';
import { ImageBedConfig } from '../../../types/imageBed';

export const tencentDefinition: ImageBedProviderDefinition = {
  provider: 'tencent',
  label: '腾讯云',
  description: '使用腾讯云 COS 作为图床',
  defaultConfig: {
    provider: 'tencent',
    _configName: '',
    secretId: '',
    secretKey: '',
    bucket: '',
    appId: '',
    area: '',
    path: '',
    customUrl: '',
    version: 'v5',
    options: '',
    slim: false,
  },
  fields: [
    { key: '_configName', label: '配置名称', required: true, placeholder: '用于区分不同图床配置' },
    { key: 'secretId', label: 'secretId', required: true },
    { key: 'secretKey', label: 'secretKey', required: true },
    { key: 'bucket', label: '存储桶名', required: true, placeholder: '注意 v4/v5 版本命名差异' },
    { key: 'appId', label: 'appId', required: true, placeholder: '例如：1250000000' },
    { key: 'area', label: '存储区域', required: true, placeholder: '如：ap-beijing-1' },
    { key: 'path', label: '自定义存储路径', placeholder: '如：img/' },
    { key: 'customUrl', label: '自定义域名', placeholder: '需包含 http:// 或 https://' },
    {
      key: 'version',
      label: 'COS 版本',
      type: 'select',
      options: [
        { label: 'v5', value: 'v5' },
        { label: 'v4', value: 'v4' },
      ],
      required: true,
    },
    { key: 'options', label: '网站后缀', placeholder: '如：imageMogr2/thumbnail/500x500' },
    { key: 'slim', label: '开启极智压缩', type: 'switch' },
  ],
  upload: async (file: File | Blob, config: ImageBedConfig, options: UploadOptions = {}) => {
    // TODO: 实现腾讯云上传逻辑
    throw new Error('腾讯云上传功能暂未实现');
  },
  transferImage: async (sourceUrl: string, config: ImageBedConfig, options: TransferOptions = {}) => {
    // TODO: 实现腾讯云转存逻辑
    throw new Error('腾讯云转存功能暂未实现');
  },
};
