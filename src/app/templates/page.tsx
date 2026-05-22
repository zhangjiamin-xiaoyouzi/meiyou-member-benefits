'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Plus, Puzzle, Settings2, Eye, Lock, Unlock } from 'lucide-react';
import type { Template, TemplateComponent } from '@/lib/types';
import { mockTemplates } from '@/lib/mock-data';

const levelConfig: Record<string, { label: string; color: string; desc: string }> = {
  S: { label: 'S级 · 大促抽奖', color: 'bg-rose-50 text-rose-700 border-rose-200', desc: '618/双11等S级大促，完整互动链路' },
  A: { label: 'A级 · 周期会员日', color: 'bg-amber-50 text-amber-700 border-amber-200', desc: '每周/月会员日，时序状态切换' },
  B: { label: 'B级 · 轻量定向', color: 'bg-blue-50 text-blue-700 border-blue-200', desc: '半弹窗/浮层，单品券+快捷开卡' },
};

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

function TemplateDetailDialog({ template }: { template: Template }) {
  const [components, setComponents] = useState<TemplateComponent[]>(template.components);

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          <span>{template.name}</span>
          <Badge variant="outline" className={levelConfig[template.level].color}>
            {levelConfig[template.level].label}
          </Badge>
        </DialogTitle>
        <DialogDescription>{template.description}</DialogDescription>
      </DialogHeader>
      <Separator />
      <ComponentToggleMatrix components={components} onChange={setComponents} />
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" className="border-slate-300">
          取消
        </Button>
        <Button className="bg-rose-500 hover:bg-rose-600 text-white">
          保存配置
        </Button>
      </div>
    </DialogContent>
  );
}

function CreateTemplateDialog() {
  const [level, setLevel] = useState<string>('');

  const defaultComponents: Record<string, TemplateComponent[]> = {
    S: [
      { id: `comp_${Date.now()}_1`, name: '氛围头图', key: 'header_banner', description: '顶部活动氛围大图', enabled: true, required: true },
      { id: `comp_${Date.now()}_2`, name: '互动红包', key: 'interactive_redpacket', description: '点击拆红包互动组件', enabled: true, required: false },
      { id: `comp_${Date.now()}_3`, name: '大卡货架', key: 'main_shelf', description: '主推套餐大卡展示', enabled: true, required: true },
      { id: `comp_${Date.now()}_4`, name: '小卡货架', key: 'sub_shelf', description: '次推套餐小卡展示', enabled: true, required: false },
      { id: `comp_${Date.now()}_5`, name: '扭蛋机抽奖', key: 'lottery_gacha', description: '扭蛋机互动抽奖楼层', enabled: true, required: false },
      { id: `comp_${Date.now()}_6`, name: '中奖跑马灯', key: 'winner_marquee', description: '实时滚动中奖信息', enabled: true, required: false },
      { id: `comp_${Date.now()}_7`, name: '规则弹窗', key: 'rules_popup', description: '活动规则说明弹窗', enabled: true, required: true },
    ],
    A: [
      { id: `comp_${Date.now()}_1`, name: '氛围头图', key: 'header_banner', description: '顶部活动氛围图', enabled: true, required: true },
      { id: `comp_${Date.now()}_2`, name: '时序状态栏', key: 'timeline_status', description: '预约/抢购/结束三阶段切换', enabled: true, required: true },
      { id: `comp_${Date.now()}_3`, name: '0元福利', key: 'free_benefit', description: '免费领券组件', enabled: true, required: false },
      { id: `comp_${Date.now()}_4`, name: '套餐货架', key: 'plan_shelf', description: '会员套餐展示', enabled: true, required: true },
      { id: `comp_${Date.now()}_5`, name: '规则弹窗', key: 'rules_popup', description: '活动规则说明弹窗', enabled: true, required: true },
    ],
    B: [
      { id: `comp_${Date.now()}_1`, name: '弹窗背景', key: 'popup_bg', description: '浮层背景图', enabled: true, required: true },
      { id: `comp_${Date.now()}_2`, name: '单品券发放', key: 'coupon_issue', description: '单张优惠券发放组件', enabled: true, required: false },
      { id: `comp_${Date.now()}_3`, name: '快捷开卡', key: 'quick_subscribe', description: '一键开通会员按钮', enabled: true, required: true },
      { id: `comp_${Date.now()}_4`, name: '关闭按钮', key: 'close_btn', description: '浮层关闭入口', enabled: true, required: true },
    ],
  };

  const [components, setComponents] = useState<TemplateComponent[]>([]);

  const handleLevelChange = (val: string) => {
    setLevel(val);
    setComponents(defaultComponents[val] || []);
  };

  return (
    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>新建活动模板</DialogTitle>
        <DialogDescription>由PM、研发和UI共同定义，运营仅有引用权</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>模板名称</Label>
            <Input placeholder="如：大促抽奖模板" />
          </div>
          <div className="space-y-2">
            <Label>模板等级</Label>
            <Select value={level} onValueChange={handleLevelChange}>
              <SelectTrigger>
                <SelectValue placeholder="选择模板等级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="S">S级 · 大促抽奖模板</SelectItem>
                <SelectItem value="A">A级 · 周期会员日模板</SelectItem>
                <SelectItem value="B">B级 · 轻量定向模板</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>模板说明</Label>
          <Textarea placeholder="描述该模板的适用场景与核心功能" rows={3} />
        </div>
        {components.length > 0 && (
          <>
            <Separator />
            <ComponentToggleMatrix components={components} onChange={setComponents} />
          </>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" className="border-slate-300">
          取消
        </Button>
        <Button className="bg-rose-500 hover:bg-rose-600 text-white" disabled={!level}>
          创建模板
        </Button>
      </div>
    </DialogContent>
  );
}

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">模板管理</h1>
          <p className="mt-1 text-sm text-slate-500">
            研发与UI定义的皮肤/核心组件库，运营仅有引用权
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-rose-500 hover:bg-rose-600 text-white">
              <Plus className="mr-2 h-4 w-4" />
              新建模板
            </Button>
          </DialogTrigger>
          <CreateTemplateDialog />
        </Dialog>
      </div>

      {/* 模板等级说明 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Object.entries(levelConfig).map(([key, config]) => (
          <Card key={key} className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className={config.color}>
                  {config.label}
                </Badge>
              </div>
              <p className="text-xs text-slate-500">{config.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 模板列表 */}
      <div className="space-y-4">
        {mockTemplates.map((template) => (
          <Card key={template.id} className="border-slate-200 hover:shadow-sm transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    <Puzzle className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-slate-900">
                      {template.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-slate-500 mt-0.5">
                      {template.description}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={levelConfig[template.level].color}>
                    {levelConfig[template.level].label}
                  </Badge>
                  <div className="text-xs text-slate-400">
                    {template.components.length} 个组件
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="border-slate-300">
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        详情
                      </Button>
                    </DialogTrigger>
                    <TemplateDetailDialog template={template} />
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {template.components.map((comp) => (
                  <Badge
                    key={comp.id}
                    variant="outline"
                    className={`text-xs ${
                      comp.enabled
                        ? 'bg-white text-slate-700 border-slate-200'
                        : 'bg-slate-50 text-slate-400 border-slate-100 line-through'
                    }`}
                  >
                    {comp.required && <Lock className="mr-1 h-2.5 w-2.5" />}
                    {comp.name}
                    {!comp.enabled && ' (关闭)'}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
