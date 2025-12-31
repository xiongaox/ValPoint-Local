/**
 * useUiProps - 点位UiProps
 *
 * 职责：
 * - 封装点位UiProps相关的状态与副作用。
 * - 对外提供稳定的接口与回调。
 * - 处理订阅、清理或缓存等生命周期细节。
 */

import AlertModal from '../../../components/AlertModal';
import Lightbox from '../../../components/Lightbox';
import { LightboxImage } from '../../../types/ui';

type Params = {
  alertMessage: string | null;
  alertActionLabel: string | null;
  alertAction: (() => void) | null;
  alertSecondaryLabel: string | null;
  alertSecondaryAction: (() => void) | null;
  setAlertMessage: (val: string | null) => void;
  setAlertActionLabel: (val: string | null) => void;
  setAlertAction: (val: (() => void) | null) => void;
  setAlertSecondaryLabel: (val: string | null) => void;
  setAlertSecondaryAction: (val: (() => void) | null) => void;
  viewingImage: LightboxImage | null;
  setViewingImage: (v: LightboxImage | null) => void;
};

export function buildUiProps(params: Params): {
  alertProps: React.ComponentProps<typeof AlertModal>;
  lightboxProps: React.ComponentProps<typeof Lightbox>;
} {
  return {
    alertProps: {
      message: params.alertMessage,
      actionLabel: params.alertActionLabel ?? null,
      onAction: params.alertAction ?? null,
      secondaryLabel: params.alertSecondaryLabel ?? null,
      onSecondary: params.alertSecondaryAction ?? null,
      onClose: () => {
        params.setAlertMessage(null);
        params.setAlertActionLabel(null);
        params.setAlertAction(null);
        params.setAlertSecondaryLabel(null);
        params.setAlertSecondaryAction(null);
      },
    },
    lightboxProps: {
      viewingImage: params.viewingImage,
      setViewingImage: params.setViewingImage,
    },
  };
}
