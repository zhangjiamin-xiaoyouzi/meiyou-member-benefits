'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ArrowLeft, Lock, Unlock, Settings2, GripVertical, Copy, Pencil } from 'lucide-react';
import type { Template, TemplateComponent } from '@/lib/types';


const categoryColorMap: Record<string, string> = {
  '年度大促': 'bg-pink-50 text-pink-700 border-pink-200',
  '会员日': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  '固定节日': 'bg-blue-50 text-blue-700 border-blue-200',
};
const defaultCategoryColor = 'bg-gray-50 text-gray-700 border-gray-200';

function getCategoryColor(category: string): string {
  return categoryColorMap[category] || defaultCategoryColor;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function TemplateEditPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;

  const [template, setTemplate] = useState<Template | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [components, setComponents] = useState<TemplateComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editingComp, setEditingComp] = useState<TemplateComponent | null>(null);
  const [editKey, setEditKey] = useState('');
  const [editDesc, setEditDesc] = useState('');

  useEffect(() => {
    fetch(`/api/templates?id=${templateId}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data) {
          const t = Array.isArray(result.data) ? result.data[0] : result.data;
          setTemplate(t);
          setName(t.name);
          setCategory(t.category);
          setDescription(t.description);
          setComponents(t.components);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [templateId]);

  const handleToggle = (compId: string) => {
    setComponents((prev) =>
      prev.map((c) =>
        c.id === compId && !c.required ? { ...c, enabled: !c.enabled } : c
      )
    );
  };

  const handleNameChange = (compId: string, newName: string) => {
    setComponents((prev) =>
      prev.map((c) =>
        c.id === compId ? { ...c, name: newName } : c
      )
    );
  };

  const handleCopyComponent = (comp: TemplateComponent) => {
    const newComp: TemplateComponent = {
      ...comp,
      id: `comp_${Date.now()}`,
      key: `${comp.key}_copy`,
      name: `${comp.name}（副本）`,
      required: false,
    };
    const index = components.findIndex((c) => c.id === comp.id);
    const updated = [...components];
    updated.splice(index + 1, 0, newComp);
    setComponents(updated);
  };

  const handleEditComponent = (comp: TemplateComponent) => {
    setEditingComp(comp);
    setEditKey(comp.key);
    setEditDesc(comp.description);
  };

  const handleSaveEdit = () => {
    if (!editingComp) return;
    setComponents(components.map((c) =>
      c.id === editingComp.id ? { ...c, key: editKey, description: editDesc } : c
    ));
    setEditingComp(null);
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (dragIndex !== null && dragOverIndex !== null && dragIndex !== dragOverIndex) {
      setComponents((prev) => {
        const updated = [...prev];
        const [moved] = updated.splice(dragIndex, 1);
        updated.splice(dragOverIndex, 0, moved);
        return updated;
      });
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/templates?id=${templateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          components,
        }),
      });
      const result = await res.json();
      if (result.success) {
        router.push('/templates');
      } else {
        alert('保存失败：' + (result.error || '未知错误'));
      }
    } catch {
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
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
        <div className="text-center py-12 text-gray-400">模板不存在或已删除</div>
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
          className="text-gray-500 hover:text-gray-700"
          onClick={() => router.push('/templates')}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          返回列表
        </Button>
      </div>

      <h1 className="text-2xl font-semibold text-gray-900">编辑模板</h1>

      {/* 基本信息 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            模板名称 <span className="text-meiyou">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="请输入模板名称"
            className="border-gray-200"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            模板分类
          </label>
          <div>
            <Badge variant="outline" className={getCategoryColor(category)}>
              {category}
            </Badge>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            模板说明
          </label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="请输入模板说明"
            className="border-gray-200"
          />
        </div>
      </div>

      <Separator />

      {/* 组件开关矩阵 */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <Settings2 className="h-4 w-4 text-gray-500" />
          <h4 className="text-sm font-medium text-gray-700">组件开关矩阵（Slot Controller）</h4>
          <span className="text-xs text-gray-400">控制模板内局部楼层的显隐</span>
        </div>
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="w-[40px]"></TableHead>
                <TableHead className="w-[200px]">组件名称</TableHead>
                <TableHead className="w-[100px]">标识 Key</TableHead>
                <TableHead>功能说明</TableHead>
                <TableHead className="w-[80px] text-center">状态</TableHead>
                <TableHead className="w-[80px] text-center">必选</TableHead>
                <TableHead className="w-[60px] text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {components.map((comp, index) => (
                <TableRow
                  key={comp.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={[
                    !comp.enabled ? 'bg-gray-50/50' : '',
                    dragIndex === index ? 'opacity-40' : '',
                    dragOverIndex === index && dragIndex !== index ? 'border-t-2 border-t-pink-400' : '',
                    'cursor-grab active:cursor-grabbing transition-opacity',
                  ].join(' ')}
                >
                  <TableCell className="w-[40px] px-2">
                    <GripVertical className="h-4 w-4 text-gray-300 hover:text-gray-500" />
                  </TableCell>
                  <TableCell className="font-medium text-gray-900 text-sm">
                    <Input
                      value={comp.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleNameChange(comp.id, e.target.value)}
                      className="h-7 text-sm border-transparent hover:border-gray-200 focus:border-gray-300 bg-transparent px-1 py-0"
                    />
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600 font-mono">
                      {comp.key}
                    </code>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">{comp.description}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={comp.enabled}
                      disabled={comp.required}
                      onCheckedChange={() => handleToggle(comp.id)}
                      className="data-[state=checked]:bg-meiyou"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    {comp.required ? (
                      <Lock className="h-4 w-4 text-gray-400 mx-auto" />
                    ) : (
                      <Unlock className="h-4 w-4 text-gray-300 mx-auto" />
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditComponent(comp)}
                        className="inline-flex items-center justify-center rounded p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                        title="编辑组件"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyComponent(comp)}
                        className="inline-flex items-center justify-center rounded p-1 text-gray-400 hover:text-meiyou hover:bg-pink-50 transition-colors"
                        title="复制组件"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center gap-4 pt-2 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3" /> 必选组件，不可关闭
          </span>
          <span className="flex items-center gap-1">
            <Unlock className="h-3 w-3" /> 可选组件，支持显隐控制
          </span>
        </div>
      </div>

      {/* 操作人信息 */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-400">创建人：</span>
          <span className="text-gray-700">{template.createdBy || '-'}</span>
        </div>
        <div>
          <span className="text-gray-400">创建时间：</span>
          <span className="text-gray-700">{formatDate(template.createdAt)}</span>
        </div>
        <div>
          <span className="text-gray-400">操作人：</span>
          <span className="text-gray-700">{template.updatedBy || '-'}</span>
        </div>
        <div>
          <span className="text-gray-400">操作时间：</span>
          <span className="text-gray-700">{formatDate(template.updatedAt)}</span>
        </div>
      </div>

      {/* 底部操作 */}
      <Separator />
      <div className="flex justify-end gap-3">
        <Button variant="outline" className="border-gray-300" onClick={() => router.push('/templates')}>
          取消
        </Button>
        <Button
          className="bg-meiyou hover:bg-meiyou text-white"
          onClick={handleSave}
          disabled={saving || !name.trim()}
        >
          {saving ? '保存中...' : '保存'}
        </Button>
      </div>

      {/* 编辑组件弹窗 */}
      <Dialog open={!!editingComp} onOpenChange={(open) => { if (!open) setEditingComp(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>编辑组件</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">组件名称</label>
              <Input value={editingComp?.name || ''} disabled className="bg-gray-50 text-gray-500" />
              <p className="text-xs text-gray-400 mt-1">组件名称请在列表中直接编辑</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">标识 Key</label>
              <Input
                value={editKey}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditKey(e.target.value)}
                className="font-mono"
                placeholder="输入组件 Key"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">功能说明</label>
              <Input
                value={editDesc}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditDesc(e.target.value)}
                placeholder="输入功能说明"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditingComp(null)}>取消</Button>
            <Button
              className="bg-meiyou hover:bg-meiyou text-white"
              onClick={handleSaveEdit}
              disabled={!editKey.trim()}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
