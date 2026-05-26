import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('id');

    let query = client
      .from('templates')
      .select('id, name, category, description, preview, components, is_active, created_at, updated_at, created_by, updated_by');

    if (templateId) {
      query = query.eq('id', templateId);
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw new Error(`查询模板失败: ${error.message}`);
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
      .from('templates')
      .insert({
        name: body.name,
        category: body.category,
        description: body.description,
        preview: body.preview,
        components: body.components,
        is_active: true,
      })
      .select()
      .single();
    if (error) throw new Error(`创建模板失败: ${error.message}`);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('id');
    if (!templateId) {
      return NextResponse.json({ success: false, error: '缺少模板ID' }, { status: 400 });
    }

    const body = await request.json();
    const updateFields: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.name !== undefined) updateFields.name = body.name;
    if (body.category !== undefined) updateFields.category = body.category;
    if (body.description !== undefined) updateFields.description = body.description;
    if (body.components !== undefined) updateFields.components = body.components;

    const { data, error } = await client
      .from('templates')
      .update(updateFields)
      .eq('id', templateId)
      .select()
      .single();
    if (error) throw new Error(`更新模板失败: ${error.message}`);
    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : '未知错误';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
