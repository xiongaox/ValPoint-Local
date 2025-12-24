import { shareSupabase, supabase } from '../supabaseClient';
import { TABLE } from './tables';
import { normalizeLineup } from './normalize';
import { BaseLineup, SharedLineup } from '../types/lineup';

export async function fetchSharedById(id: string, mapNameZhToEn: Record<string, string>): Promise<SharedLineup | null> {
  const { data: sharedData, error: sharedError } = await shareSupabase
    .from(TABLE.shared)
    .select('*')
    .eq('id', id)
    .single();
  if (!sharedError && sharedData) {
    const normalized = normalizeLineup(sharedData, mapNameZhToEn);
    return { ...normalized, id: sharedData.id, sourceId: sharedData.source_id };
  }
  // 兼容旧逻辑：如果 id 查不到，尝试查旧表 (migration phase fallback)
  const { data: legacyData, error: legacyError } = await supabase.from(TABLE.lineups).select('*').eq('id', id).single();
  if (!legacyError && legacyData) {
    const normalized = normalizeLineup(legacyData, mapNameZhToEn);
    return { ...normalized, id: legacyData.id };
  }
  return null;
}

export async function fetchSharedList(mapNameZhToEn: Record<string, string>): Promise<BaseLineup[]> {
  const { data, error } = await shareSupabase.from(TABLE.shared).select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data.map((d) => normalizeLineup(d, mapNameZhToEn));
}

export async function upsertShared(payload: any) {
  // 使用 id 作为冲突检测键
  const { error } = await shareSupabase.from(TABLE.shared).upsert(payload, { onConflict: 'id' });
  if (error) throw error;
}
