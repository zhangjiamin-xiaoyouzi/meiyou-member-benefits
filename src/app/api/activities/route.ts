import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET() {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('activities')
      .select('id, name, category, scene_key, template_id, template_name, status, time_config, audience_groups, lottery_config, material_config, components, created_at, updated_at')
      .order('created_at', { ascending: false });
    if (error) throw new Error(`查询活动失败: ${error.message}`);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const body = await request.json();
    const { data, error } = await client
      .from('activities')
      .insert({
        name: body.name,
        category: body.category,
        scene_key: body.sceneKey,
        template_id: body.templateId,
        template_name: body.templateName,
        status: body.status || 'draft',
        time_config: body.timeConfig,
        audience_groups: body.audienceGroups,
        lottery_config: body.lotteryConfig,
        material_config: body.materialConfig,
        components: body.components,
      })
      .select()
      .single();
    if (error) throw new Error(`创建活动失败: ${error.message}`);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
