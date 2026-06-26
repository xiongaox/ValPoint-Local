/**
 * useErrorMarks - 报错标记 Hook
 *
 * 职责：
 * - 管理点位报错标记的 CRUD 操作（本地 SQLite 后端）
 * - 通过 CustomEvent 实现跨组件实时同步点位报错状态
 * - 支持乐观更新与失败回滚
 */

import { useState, useEffect, useCallback } from 'react';

export type ErrorMarkType = '描述错误' | '图片错误' | '图片未标记';

type ErrorMarkEventDetail = {
  lineupId: string;
  type: ErrorMarkType | null;
};

export function useErrorMarks(userId?: string) {
  const [errorMarks, setErrorMarks] = useState<Record<string, ErrorMarkType>>({});
  const [loading, setLoading] = useState(false);

  const fetchErrorMarks = useCallback(async () => {
    if (!userId) {
      setErrorMarks({});
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/error-marks?user_id=${encodeURIComponent(userId)}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      const marksMap: Record<string, ErrorMarkType> = {};
      data?.forEach((mark: any) => {
        marksMap[mark.lineup_id] = mark.error_type as ErrorMarkType;
      });
      setErrorMarks(marksMap);
    } catch (err) {
      console.error('获取报错标记失败:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchErrorMarks();
  }, [fetchErrorMarks]);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ErrorMarkEventDetail>;
      const { lineupId, type } = customEvent.detail;
      if (type) {
        setErrorMarks((prev) => ({ ...prev, [lineupId]: type }));
      } else {
        setErrorMarks((prev) => {
          const newMarks = { ...prev };
          delete newMarks[lineupId];
          return newMarks;
        });
      }
    };
    window.addEventListener('errorMarksLocalUpdate', handleUpdate);
    return () => window.removeEventListener('errorMarksLocalUpdate', handleUpdate);
  }, []);

  const markError = async (lineupId: string, type: ErrorMarkType) => {
    if (!userId) return false;

    // 乐观更新
    window.dispatchEvent(new CustomEvent('errorMarksLocalUpdate', { detail: { lineupId, type } }));

    try {
      const response = await fetch('/api/error-marks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, lineup_id: lineupId, error_type: type }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return true;
    } catch (err) {
      console.error('保存报错标记失败:', err);
      // 回滚乐观更新
      await fetchErrorMarks();
      return false;
    }
  };

  const resolveError = async (lineupId: string) => {
    if (!userId) return false;

    // 乐观更新
    window.dispatchEvent(new CustomEvent('errorMarksLocalUpdate', { detail: { lineupId, type: null } }));

    try {
      const response = await fetch(`/api/error-marks/${encodeURIComponent(lineupId)}?user_id=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return true;
    } catch (err) {
      console.error('清除报错标记失败:', err);
      // 回滚乐观更新
      await fetchErrorMarks();
      return false;
    }
  };

  return { errorMarks, loading, fetchErrorMarks, markError, resolveError };
}
