/**
 * imageBed - imageBed
 *
 * 职责：
 * - 声明imageBed相关的数据结构与类型约束。
 * - 为业务逻辑提供类型安全的契约。
 * - 集中管理跨模块共享的类型定义。
 */

export type ImageBedProvider = 'aliyun' | 'tencent' | 'qiniu';

export type ImageBedConfig = {
  provider: ImageBedProvider;
  _configName: string;
  accessKeyId?: string;
  accessKeySecret?: string;
  bucket?: string;
  area?: string;
  path?: string;
  customUrl?: string;
  secretId?: string;
  secretKey?: string;
  appId?: string;
  version?: 'v4' | 'v5';
  options?: string;
  slim?: boolean;
  accessKey?: string;
  url?: string;
  basePath?: string;
  endpointPath?: string;
  customDomain?: string;
  processParams?: string;
  region?: string;
};
