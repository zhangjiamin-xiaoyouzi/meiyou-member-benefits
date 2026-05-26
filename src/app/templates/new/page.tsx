'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import type { TemplateComponent } from '@/lib/types';
import { DEFAULT_CATEGORIES } from '@/lib/types';
import { templateCategories } from '@/lib/mock-data';

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

const defaultComponentsByCategory: Record<string, TemplateComponent[]> = {
  '年度大促': [
    { id: 'new_comp_1', name: '氛围头图', key: 'header_banner', description: '顶部活动氛围大图', enabled: true, required: true },
    { id: 'new_comp_2', name: '互动红包', key: 'interactive_redpacket', description: '点击拆红包互动组件', enabled: true, required: false },
    { id: 'new_comp_3', name: '大卡货架', key: 'main_shelf', description: '主推套餐大卡展示', enabled: true, required: true },
    { id: 'new_comp_4', name: '小卡货架', key: 'sub_shelf', description: '次推套餐小卡展示', enabled: true, required: false },
    { id: 'new_comp_5', name: '扭蛋机抽奖', key: 'lottery_gacha', description: '扭蛋机互动抽奖楼层', enabled: true, required: false },
    { id: 'new_comp_6', name: '中奖跑马灯', key: 'winner_marquee', description: '实时滚动中奖信息', enabled: true, required: false },
    { id: 'new_comp_7', name: '规则弹窗', key: 'rules_popup', description: '活动规则说明弹窗', enabled: true, required: true },
  ],
  '会员日': [
    { id: 'new_comp_1', name: '氛围头图', key: 'header_banner', description: '顶部活动氛围图', enabled: true, required: true },
    { id: 'new_comp_2', name: '限时福利', key: 'timeline_status', description: '预约/抢购/结束三阶段切换', enabled: true, required: true },
    { id: 'new_comp_3', name: '0元福利', key: 'free_benefit', description: '免费领券组件', enabled: true, required: false },
    { id: 'new_comp_4', name: '套餐货架', key: 'plan_shelf', description: '会员套餐展示', enabled: true, required: true },
    { id: 'new_comp_5', name: '规则弹窗', key: 'rules_popup', description: '活动规则说明弹窗', enabled: true, required: true },
  ],
  '固定节日': [
    { id: 'new_comp_1', name: '弹窗背景', key: 'popup_bg', description: '浮层背景图', enabled: true, required: true },
    { id: 'new_comp_2', name: '单品券发放', key: 'coupon_issue', description: '单张优惠券发放组件', enabled: true, required: false },
    { id: 'new_comp_3', name: '快捷开卡', key: 'quick_subscribe', description: '一键开通会员按钮', enabled: true, required: true },
    { id: 'new_comp_4', name: '关闭按钮', key: 'close_btn', description: '浮层关闭入口', enabled: true, required: true },
  ],
};

export default function NewTemplatePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [description, setDescription] = useState('');
  const [components, setComponents] = useState<TemplateComponent[]>([]);

  const handleCategoryChange = (val: string) => {
    if (val === '__custom__') {
      setIsCustomCategory(true);
      setCategory('');
      setComponents([]);
    } else {
      setIsCustomCategory(false);
      setCustomCategory('');
      setCategory(val);
      setComponents(defaultComponentsByCategory[val] || []);
    }
  };

  const effectiveCategory = isCustomCategory ? customCategory.trim() : category;

  const allCategories = [...DEFAULT_CATEGORIES, ...templateCategories.filter((c) => !DEFAULT_CATEGORIES.includes(c as typeof DEFAULT_CATEGORIES[number]))];

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
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">新建活动模板</h1>
        <p className="mt-1 text-sm text-slate-500">
          由PM、研发和UI共同定义，运营仅有引用权
        </p>
      </div>

      <Separator />

      {/* 表单 */}
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>模板名称 <span className="text-red-500">*</span></Label>
            <Input
              placeholder="如：大促抽奖模板"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>模板分类 <span className="text-red-500">*</span></Label>
            <Select value={isCustomCategory ? '__custom__' : category} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="选择或新建分类" />
              </SelectTrigger>
              <SelectContent>
                {allCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
                <SelectItem value="__custom__">+ 新建分类...</SelectItem>
              </SelectContent>
            </Select>
            {isCustomCategory && (
              <Input
                placeholder="输入新分类名称"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="mt-2"
              />
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label>模板说明</Label>
          <Textarea
            placeholder="描述该模板的适用场景与核心功能"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      {/* 组件开关矩阵 */}
      {components.length > 0 && (
        <>
          <Separator />
          <ComponentToggleMatrix components={components} onChange={setComponents} />
        </>
      )}

      {/* 底部操作 */}
      <Separator />
      <div className="flex justify-end gap-3">
        <Button variant="outline" className="border-slate-300" onClick={() => router.push('/templates')}>
          取消
        </Button>
        <Button
          className="bg-rose-500 hover:bg-rose-600 text-white"
          disabled={!effectiveCategory || !name.trim()}
        >
          创建模板
        </Button>
      </div>
    </div>
  );
}
