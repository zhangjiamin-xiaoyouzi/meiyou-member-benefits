import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { mockTemplates, mockPromoPatches, mockActivities } from '@/lib/mock-data';

export async function POST() {
  try {
    const client = getSupabaseClient();

    // Seed templates (upsert to handle existing data)
    const { error: tplError } = await client.from('templates').upsert(
      mockTemplates.map((t) => ({
        id: t.id,
        name: t.name,
        category: t.category,
        description: t.description,
        preview: t.preview,
        components: t.components,
        is_active: true,
      })),
      { onConflict: 'id' }
    );
    if (tplError) throw new Error(`模板写入失败: ${tplError.message}`);

    // Seed promo patches (upsert)
    const { error: patchError } = await client.from('promo_patches').upsert(
      mockPromoPatches.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        config: p.config,
        status: p.status,
      })),
      { onConflict: 'id' }
    );
    if (patchError) throw new Error(`策略写入失败: ${patchError.message}`);

    // Seed activities (upsert)
    const { error: actError } = await client.from('activities').upsert(
      mockActivities.map((a) => ({
        id: a.id,
        name: a.name,
        category: a.category,
        template_id: a.templateId,
        template_name: a.templateName,
        status: a.status,
        time_config: a.timeConfig,
        audience_groups: a.audienceGroups,
        lottery_config: a.lotteryConfig,
        material_config: a.materialConfig,
        components: a.components,
        component_configs: a.componentConfigs || {},
        created_by: a.createdBy || '系统管理员',
        updated_by: a.updatedBy || '系统管理员',
      })),
      { onConflict: 'id' }
    );
    if (actError) throw new Error(`活动写入失败: ${actError.message}`);

    return NextResponse.json({ success: true, message: '数据初始化完成' });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
