import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET() {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('activities')
      .select('id, name, activity_key, category, template_id, template_name, status, time_config, audience_groups, lottery_config, material_config, components, component_configs, created_at, updated_at')
      .order('id', { ascending: false });
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
    // 自动生成活动key: ACT_ + 年月日时分秒 + 4位随机数
    const now = new Date();
    const dateStr = now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0') +
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0');
    const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const activityKey = `ACT_${dateStr}${rand}`;
    const { data, error } = await client
      .from('activities')
      .insert({
        name: body.name,
        activity_key: activityKey,
        category: body.category,
        template_id: body.template_id,
        template_name: body.template_name,
        status: body.status || 'draft',
        time_config: body.time_config,
        audience_groups: body.audience_groups,
        lottery_config: body.lottery_config,
        material_config: body.material_config,
        components: body.components,
        component_configs: body.component_configs,
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
