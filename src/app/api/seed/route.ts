import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { mockTemplates, mockPromoPatches, mockActivities } from '@/lib/mock-data';

export async function POST() {
  try {
    const client = getSupabaseClient();

    // Seed templates
    const { error: tplError } = await client.from('templates').insert(
      mockTemplates.map((t) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        description: t.description,
        preview: t.preview,
        components: t.components,
        is_active: true,
      }))
    );
    if (tplError) throw new Error(`模板插入失败: ${tplError.message}`);

    // Seed promo patches
    const { error: patchError } = await client.from('promo_patches').insert(
      mockPromoPatches.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        config: p.config,
        status: p.status,
      }))
    );
    if (patchError) throw new Error(`策略插入失败: ${patchError.message}`);

    // Seed activities
    const { error: actError } = await client.from('activities').insert(
      mockActivities.map((a) => ({
        id: a.id,
        name: a.name,
        category: a.category,
        scene_key: a.sceneKey,
        template_id: a.templateId,
        template_name: a.templateName,
        status: a.status,
        time_config: a.timeConfig,
        audience_groups: a.audienceGroups,
        lottery_config: a.lotteryConfig,
        material_config: a.materialConfig,
        components: a.components,
      }))
    );
    if (actError) throw new Error(`活动插入失败: ${actError.message}`);

    return NextResponse.json({ success: true, message: '数据初始化完成' });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
