'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Lock, Unlock, Settings2 } from 'lucide-react';
import type { Template, TemplateComponent } from '@/lib/types';

const categoryColorMap: Record<string, string> = {
  '年度大促': 'bg-rose-50 text-rose-700 border-rose-200',
  '会员日': 'bg-amber-50 text-amber-700 border-amber-200',
  '固定节日': 'bg-blue-50 text-blue-700 border-blue-200',
};
const defaultCategoryColor = 'bg-slate-50 text-slate-700 border-slate-200';

function getCategoryColor(category: string): string {
  return categoryColorMap[category] || defaultCategoryColor;
}

function ComponentToggleMatrix({
  components,
  onChange,
}: {
  components: TemplateComponent[];
  onChange: (components: TemplateComponent[]) => void;
}) {
  const handleToggle = (compId: string) => {
    const updated = components.map((c) =>
      c.id === compId && !c.required ? { ...c, enabled: !c.enabled } : c
    );
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Settings2 className="h-4 w-4 text-slate-500" />
        <h4 className="text-sm font-medium text-slate-700">组件开关矩阵（Slot Controller）</h4>
        <span className="text-xs text-slate-400">控制模板内局部楼层的显隐</span>
      </div>
      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="w-[200px]">组件名称</TableHead>
              <TableHead className="w-[100px]">标识 Key</TableHead>
              <TableHead>功能说明</TableHead>
              <TableHead className="w-[80px] text-center">状态</TableHead>
              <TableHead className="w-[80px] text-center">必选</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {components.map((comp) => (
              <TableRow key={comp.id} className={!comp.enabled ? 'bg-slate-50/50' : ''}>
                <TableCell className="font-medium text-slate-900 text-sm">
                  {comp.name}
                </TableCell>
                <TableCell>
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 font-mono">
                    {comp.key}
                  </code>
                </TableCell>
                <TableCell className="text-sm text-slate-500">{comp.description}</TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={comp.enabled}
                    disabled={comp.required}
                    onCheckedChange={() => handleToggle(comp.id)}
                    className="data-[state=checked]:bg-rose-500"
                  />
                </TableCell>
                <TableCell className="text-center">
                  {comp.required ? (
                    <Lock className="h-4 w-4 text-slate-400 mx-auto" />
                  ) : (
                    <Unlock className="h-4 w-4 text-slate-300 mx-auto" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center gap-4 pt-2 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Lock className="h-3 w-3" /> 必选组件，不可关闭
        </span>
        <span className="flex items-center gap-1">
          <Unlock className="h-3 w-3" /> 可选组件，支持显隐控制
        </span>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function TemplateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;

  const [template, setTemplate] = useState<Template | null>(null);
  const [components, setComponents] = useState<TemplateComponent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/templates?id=${templateId}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data) {
          const t = Array.isArray(result.data) ? result.data[0] : result.data;
          setTemplate(t);
          setComponents(t.components);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [templateId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        加载中...
      </div>
    );
  }

  if (!template) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/templates')}>
          <ArrowLeft className="mr-1 h-4 w-4" /> 返回列表
        </Button>
        <div className="text-center py-12 text-slate-400">模板不存在或已删除</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* 返回 + 标题 */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-500 hover:text-slate-700"
          onClick={() => router.push('/templates')}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          返回列表
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">{template.name}</h1>
        <Badge variant="outline" className={getCategoryColor(template.category)}>
          {template.category}
        </Badge>
      </div>
      <p className="text-sm text-slate-500">{template.description}</p>

      {/* 基本信息 */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-slate-400">创建人：</span>
          <span className="text-slate-700">{template.createdBy || '-'}</span>
        </div>
        <div>
          <span className="text-slate-400">创建时间：</span>
          <span className="text-slate-700">{formatDate(template.createdAt)}</span>
        </div>
        <div>
          <span className="text-slate-400">操作人：</span>
          <span className="text-slate-700">{template.updatedBy || '-'}</span>
        </div>
        <div>
          <span className="text-slate-400">操作时间：</span>
          <span className="text-slate-700">{formatDate(template.updatedAt)}</span>
        </div>
      </div>

      <Separator />

      {/* 组件开关矩阵 */}
      <ComponentToggleMatrix components={components} onChange={setComponents} />

      {/* 底部操作 */}
      <Separator />
      <div className="flex justify-end gap-3">
        <Button variant="outline" className="border-slate-300" onClick={() => router.push('/templates')}>
          取消
        </Button>
        <Button className="bg-rose-500 hover:bg-rose-600 text-white">
          保存配置
        </Button>
      </div>
    </div>
  );
}
