/**
 * shared - 共享库
 *
 * 职责：
 * - 封装共享库相关的接口调用。
 * - 处理参数整理、错误兜底与结果转换。
 * - 向上层提供稳定的服务 API。
 */

import { shareSupabase } from '../supabaseClient';
import { TABLE } from './tables';
import { normalizeLineup } from './normalize';
import { BaseLineup, SharedLineup } from '../types/lineup';

export async function fetchSharedById(id: string, mapNameZhToEn: Record<string, string>): Promise<SharedLineup | null> {
  const { data: sharedData, error: sharedError } = await shareSupabase
    .from(TABLE.shared)
    .select('*')
    .eq('id', id)
    .single();

  if (sharedError || !sharedData) {
    return null;
  }

  const normalized = normalizeLineup(sharedData, mapNameZhToEn);
  return { ...normalized, id: sharedData.id, sourceId: sharedData.source_id };
}

import { SupabaseClient } from '@supabase/supabase-js';

export async function fetchSharedList(mapNameZhToEn: Record<string, string>, client: SupabaseClient = shareSupabase): Promise<BaseLineup[]> {
  const { data, error } = await client.from(TABLE.shared).select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data.map((d) => normalizeLineup(d, mapNameZhToEn));
}

export async function upsertShared(payload: any) {
  const { error } = await shareSupabase.from(TABLE.shared).upsert(payload, { onConflict: 'id' });
  if (error) throw error;
}
