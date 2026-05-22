import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET() {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('promo_patches')
      .select('id, name, type, config, status, created_at, updated_at')
      .order('created_at', { ascending: false });
    if (error) throw new Error(`查询策略失败: ${error.message}`);
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
      .from('promo_patches')
      .insert({
        name: body.name,
        type: body.type,
        config: body.config,
        status: body.status || 'active',
      })
      .select()
      .single();
    if (error) throw new Error(`创建策略失败: ${error.message}`);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
