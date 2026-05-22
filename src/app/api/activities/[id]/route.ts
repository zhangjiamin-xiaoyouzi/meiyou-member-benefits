import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('activities')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(`查询活动失败: ${error.message}`);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = getSupabaseClient();
    const body = await request.json();

    const updateFields: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.name !== undefined) updateFields.name = body.name;
    if (body.status !== undefined) updateFields.status = body.status;
    if (body.timeConfig !== undefined) updateFields.time_config = body.timeConfig;
    if (body.audienceRules !== undefined) updateFields.audience_rules = body.audienceRules;
    if (body.shelves !== undefined) updateFields.shelves = body.shelves;
    if (body.lotteryConfig !== undefined) updateFields.lottery_config = body.lotteryConfig;
    if (body.materialConfig !== undefined) updateFields.material_config = body.materialConfig;
    if (body.components !== undefined) updateFields.components = body.components;

    const { data, error } = await client
      .from('activities')
      .update(updateFields)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw new Error(`更新活动失败: ${error.message}`);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = getSupabaseClient();
    const { error } = await client.from('activities').delete().eq('id', id);
    if (error) throw new Error(`删除活动失败: ${error.message}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
