/**
 * useEscapeClose - EscapeClose
 *
 * 职责：
 * - 封装EscapeClose相关的状态与副作用。
 * - 对外提供稳定的接口与回调。
 * - 处理订阅、清理或缓存等生命周期细节。
 */

import { useEffect, useRef } from 'react';

type EscapeHandler = () => void;

const escapeHandlers: EscapeHandler[] = [];
let hasListener = false;

const onKeyDown = (event: KeyboardEvent) => {
  if (event.key !== 'Escape') return;
  const handler = escapeHandlers[escapeHandlers.length - 1];
  if (!handler) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  handler();
};

const ensureListener = () => {
  if (hasListener || typeof document === 'undefined') return;
  document.addEventListener('keydown', onKeyDown);
  hasListener = true;
};

const releaseListener = () => {
  if (!hasListener || escapeHandlers.length > 0 || typeof document === 'undefined') return;
  document.removeEventListener('keydown', onKeyDown);
  hasListener = false;
};

export function useEscapeClose(isActive: boolean, onClose?: () => void) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isActive || !onCloseRef.current) return;

    ensureListener();

    const handler = () => {
      const current = onCloseRef.current;
      if (current) current();
    };

    escapeHandlers.push(handler);

    return () => {
      const index = escapeHandlers.lastIndexOf(handler);
      if (index !== -1) escapeHandlers.splice(index, 1);
      releaseListener();
    };
  }, [isActive]);
}
