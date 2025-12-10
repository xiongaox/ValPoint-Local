import AlertModal from '../../../components/AlertModal';
import Lightbox from '../../../components/Lightbox';

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
  viewingImage: any;
  setViewingImage: (v: any) => void;
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
