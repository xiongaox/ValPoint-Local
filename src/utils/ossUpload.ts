type ImageBedConfig = {
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
  region: string;
  basePath?: string;
  endpointPath?: string;
  customDomain?: string;
  processParams?: string;
};

const encoder = new TextEncoder();

const toBase64 = (value: string) => {
  const bytes = encoder.encode(value);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
};

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
};

const trimSlashes = (value = '') => value.replace(/^\/+|\/+$/g, '');

const getObjectDir = (objectKey: string) => {
  const lastSlash = objectKey.lastIndexOf('/');
  if (lastSlash === -1) return '';
  return objectKey.slice(0, lastSlash + 1);
};

const ensureProcessParams = (processParams?: string) => {
  if (!processParams) return '';
  if (processParams.startsWith('?') || processParams.startsWith('&')) return processParams;
  return `?${processParams}`;
};

const pad = (num: number, len = 2) => num.toString().padStart(len, '0');

const buildTimestampName = () => {
  const d = new Date();
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds()) +
    pad(d.getMilliseconds(), 3)
  );
};

const buildFileName = (ext: string) => `${buildTimestampName()}.${ext}`;

const buildObjectKey = (basePath: string, filename: string) => {
  const prefix = trimSlashes(basePath);
  return [prefix, filename].filter(Boolean).join('/');
};

const signPolicy = async (policyBase64: string, accessKeySecret: string) => {
  const key = await crypto.subtle.importKey('raw', encoder.encode(accessKeySecret), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(policyBase64));
  return arrayBufferToBase64(signature);
};

export const uploadToOss = async (file: File | Blob, config: ImageBedConfig) => {
  const { accessKeyId, accessKeySecret, bucket, region } = config || {};
  if (!accessKeyId || !accessKeySecret || !bucket || !region) {
    throw new Error('MISSING_CONFIG');
  }

  const ext = (file as File).name?.split('.').pop() || file.type?.split('/').pop() || 'png';
  const filename = buildFileName(ext);
  const objectKey = buildObjectKey(config.basePath || '', filename);
  const dir = getObjectDir(objectKey);

  const policy = {
    expiration: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    conditions: [
      ['starts-with', '$key', dir],
      ['content-length-range', 0, 20 * 1024 * 1024],
    ],
  };

  const policyBase64 = toBase64(JSON.stringify(policy));
  const signature = await signPolicy(policyBase64, accessKeySecret);
  const uploadHost = `https://${bucket}.${region}.aliyuncs.com`;

  const formData = new FormData();
  formData.append('key', objectKey);
  formData.append('policy', policyBase64);
  formData.append('OSSAccessKeyId', accessKeyId);
  formData.append('success_action_status', '200');
  formData.append('Signature', signature);
  const uploadFile = file instanceof File ? file : new File([file], filename, { type: file.type || 'application/octet-stream' });
  formData.append('file', uploadFile);

  const resp = await fetch(uploadHost, { method: 'POST', body: formData });
  if (!resp.ok && resp.status !== 204 && resp.status !== 201) {
    const message = await resp.text().catch(() => '');
    throw new Error(message || 'UPLOAD_FAILED');
  }

  const baseUrl = (config.customDomain || uploadHost).replace(/\/+$/g, '');
  const endpointPath = trimSlashes(config.endpointPath || '');
  const path = [endpointPath, objectKey].filter(Boolean).join('/');
  const url = `${baseUrl}/${path}${ensureProcessParams(config.processParams)}`;

  return { url, objectKey };
};

export type { ImageBedConfig };
