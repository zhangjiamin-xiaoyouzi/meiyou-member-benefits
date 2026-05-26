'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Separator } from '@/components/ui/separator';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Puzzle,
  Users,
  Settings2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Plus,
  X,
  Image,
  FileText,
  Gift,
} from 'lucide-react';
import { TimeRangeField, SingleTimeField } from '@/components/activity/time-range-field';
import type { TemplateComponent, AudienceRule, ShelfItem, AudienceGroup, LotteryConfig, MaterialConfig, Activity } from '@/lib/types';
import { mockTemplates, mockPlans, mockPromoPatches, mockLotteryPools } from '@/lib/mock-data';

interface Step1Data {
  templateId: string;
  category: string;
  name: string;
  sceneKey: string;
  sellStartTime: string;
  sellEndTime: string;
  lotteryStartTime: string;
  lotteryEndTime: string;
  bufferEndTime: string;
  refundCutoffTime: string;
  components: TemplateComponent[];
}

interface Step2Data {
  audienceGroups: AudienceGroup[];
}

interface Step3Data {
  lotteryConfig: LotteryConfig;
  materialConfig: MaterialConfig;
}

const categoryColorMap: Record<string, string> = {
  '年度大促': 'bg-rose-50 text-rose-700 border-rose-200',
  '会员日': 'bg-amber-50 text-amber-700 border-amber-200',
  '固定节日': 'bg-blue-50 text-blue-700 border-blue-200',
};
const defaultCategoryColor = 'bg-slate-50 text-slate-700 border-slate-200';

const defaultCategories = ['会员日', '固定节日', '年度大促'];

const stepConfig = [
  { num: 1, label: '选择模板与基础信息', icon: Puzzle },
  { num: 2, label: '受众规则与货架配置', icon: Users },
  { num: 3, label: '挂载玩法组件', icon: Settings2 },
];

function getCategoryColor(category: string) {
  return categoryColorMap[category] || defaultCategoryColor;
}

// ==================== Step 1: 选择模板与基础信息 ====================
function StepBasicInfo({
  data,
  onChange,
  isEdit,
}: {
  data: Step1Data;
  onChange: (data: Step1Data) => void;
  isEdit: boolean;
}) {
  const selectedTemplate = mockTemplates.find((t) => t.id === data.templateId);
  const isMemberDay = selectedTemplate?.category === '会员日';

  const [compDragIndex, setCompDragIndex] = useState<number | null>(null);
  const [newCategoryMode, setNewCategoryMode] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [allCategories, setAllCategories] = useState(defaultCategories);

  const handleTemplateSelect = (templateId: string) => {
    const template = mockTemplates.find((t) => t.id === templateId);
    onChange({
      ...data,
      templateId,
      category: template?.category || '',
      components: template ? template.components.map((c) => ({ ...c })) : [],
    });
  };

  const handleCompDragStart = (index: number) => {
    setCompDragIndex(index);
  };

  const handleCompDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (compDragIndex === null || compDragIndex === index) return;
    const newComps = [...data.components];
    const item = newComps.splice(compDragIndex, 1)[0];
    newComps.splice(index, 0, item);
    onChange({ ...data, components: newComps });
    setCompDragIndex(index);
  };

  const handleCompDragEnd = () => {
    setCompDragIndex(null);
  };

  const handleToggleComponent = (compKey: string) => {
    onChange({
      ...data,
      components: data.components.map((c) =>
        c.key === compKey ? { ...c, enabled: !c.enabled } : c
      ),
    });
  };

  return (
    <div className="space-y-6">
      {/* 活动分类 */}
      <div>
        <Label className="text-sm font-medium text-slate-700">
          活动分类 <span className="text-rose-500">*</span>
        </Label>
        <div className="mt-1.5 flex items-center gap-2">
          {newCategoryMode ? (
            <div className="flex items-center gap-2 flex-1">
              <Input
                placeholder="输入新分类名称"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="max-w-[200px]"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (newCategoryName.trim()) {
                    setAllCategories((prev) =>
                      prev.includes(newCategoryName.trim()) ? prev : [...prev, newCategoryName.trim()]
                    );
                    onChange({ ...data, category: newCategoryName.trim() });
                    setNewCategoryMode(false);
                    setNewCategoryName('');
                  }
                }}
              >
                确定
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setNewCategoryMode(false);
                  setNewCategoryName('');
                }}
              >
                取消
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Select
                value={data.category}
                onValueChange={(val) => onChange({ ...data, category: val })}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                className="text-rose-500 border-rose-200 hover:bg-rose-50"
                onClick={() => setNewCategoryMode(true)}
              >
                <Plus className="h-3 w-3 mr-1" />
                新建分类
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 选择模板 */}
      <div>
        <Label className="text-sm font-medium text-slate-700">
          选择活动模板 <span className="text-rose-500">*</span>
        </Label>
        <p className="text-xs text-slate-400 mt-1 mb-3">
          {isEdit ? '切换模板将重置组件配置' : '选择模板后将自动加载模板预设组件'}
        </p>
        <div className="grid grid-cols-3 gap-4">
          {mockTemplates
            .slice()
            .sort((a, b) => {
              const order: Record<string, number> = { '会员日': 0, '固定节日': 1, '年度大促': 2 };
              return (order[a.category] ?? 3) - (order[b.category] ?? 3);
            })
            .map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all ${
                  data.templateId === template.id
                    ? 'ring-2 ring-rose-500 border-rose-300 shadow-md'
                    : 'hover:border-slate-400 hover:shadow-sm'
                }`}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">{template.name}</CardTitle>
                    <Badge className={getCategoryColor(template.category)}>
                      {template.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs">{template.description}</CardDescription>
                  <div className="mt-2 text-xs text-slate-400">
                    {template.components.length} 个组件
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* 基础信息 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-slate-700">
            活动名称 <span className="text-rose-500">*</span>
          </Label>
          <Input
            className="mt-1.5"
            placeholder="请输入活动名称"
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-slate-700">
            活动唯一路由 <span className="text-rose-500">*</span>
          </Label>
          <Input
            className="mt-1.5"
            placeholder="如：promo_618_2025"
            value={data.sceneKey}
            onChange={(e) => onChange({ ...data, sceneKey: e.target.value })}
          />
          <p className="text-xs text-slate-400 mt-1">
            全渠道投放唯一标识，创建后不可修改
          </p>
        </div>
      </div>

      {/* 活动时间配置 */}
      <div>
        <Label className="text-sm font-medium text-slate-700">活动时间配置</Label>
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-slate-500">
              {isMemberDay ? '预约时间' : '售卖时间'} <span className="text-rose-500">*</span>
            </Label>
            <TimeRangeField
              startValue={data.sellStartTime}
              endValue={data.sellEndTime}
              onStartChange={(val) => onChange({ ...data, sellStartTime: val })}
              onEndChange={(val) => onChange({ ...data, sellEndTime: val })}
            />
          </div>
          <div>
            <Label className="text-xs text-slate-500">
              {isMemberDay ? '领取时间' : '抽奖时间'} <span className="text-rose-500">*</span>
            </Label>
            <TimeRangeField
              startValue={data.lotteryStartTime}
              endValue={data.lotteryEndTime}
              onStartChange={(val) => onChange({ ...data, lotteryStartTime: val })}
              onEndChange={(val) => onChange({ ...data, lotteryEndTime: val })}
            />
          </div>
          <div>
            <Label className="text-xs text-slate-500">
              {isMemberDay ? '结束时间' : '缓冲截止时间'} <span className="text-rose-500">*</span>
            </Label>
            <SingleTimeField
              value={data.bufferEndTime}
              onChange={(val) => onChange({ ...data, bufferEndTime: val })}
            />
          </div>
          {!isMemberDay && (
            <div>
              <Label className="text-xs text-slate-500">退款熔断截单时间</Label>
              <SingleTimeField
                value={data.refundCutoffTime}
                onChange={(val) => onChange({ ...data, refundCutoffTime: val })}
              />
            </div>
          )}
        </div>
      </div>

      {/* 限时福利 */}
      {data.components.length > 0 && (
        <div>
          <Label className="text-sm font-medium text-slate-700">限时福利</Label>
          <p className="text-xs text-slate-400 mt-1 mb-3">
            控制模板内各组件的显隐，必选组件不可关闭
          </p>
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="w-8 px-2 py-2"></th>
                  <th className="text-left text-xs font-medium text-slate-500 px-3 py-2">组件名称</th>
                  <th className="text-left text-xs font-medium text-slate-500 px-3 py-2">说明</th>
                  <th className="text-center text-xs font-medium text-slate-500 px-3 py-2 w-20">状态</th>
                </tr>
              </thead>
              <tbody>
                {data.components.map((comp, index) => (
                  <tr
                    key={comp.id}
                    draggable
                    onDragStart={() => handleCompDragStart(index)}
                    onDragOver={(e) => handleCompDragOver(e, index)}
                    onDragEnd={handleCompDragEnd}
                    className={`border-b border-slate-100 last:border-b-0 transition-opacity ${
                      compDragIndex === index ? 'opacity-50' : 'opacity-100'
                    } ${compDragIndex !== null && compDragIndex !== index ? 'border-t-2 border-t-rose-300' : ''}`}
                  >
                    <td className="px-2 py-2 cursor-grab active:cursor-grabbing">
                      <GripVertical className="h-4 w-4 text-slate-300 hover:text-slate-500" />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-700">{comp.name}</span>
                        {comp.required && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0 bg-slate-50 text-slate-400 border-slate-200">
                            必选
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-400">{comp.description}</td>
                    <td className="px-3 py-2 text-center">
                      <Switch
                        checked={comp.enabled}
                        disabled={comp.required}
                        className="data-[state=checked]:bg-rose-500"
                        onCheckedChange={() => handleToggleComponent(comp.key)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== Step 2: 受众规则与货架配置 ====================
function StepAudienceShelf({
  data,
  onChange,
}: {
  data: Step2Data;
  onChange: (data: Step2Data) => void;
}) {
  const ruleFieldOptions = [
    { value: 'member_status', label: '会员状态' },
    { value: 'identity', label: '身份模式' },
    { value: 'subscribe_count', label: '订阅次数' },
    { value: 'register_days', label: '注册天数' },
  ];

  const ruleValueOptions: Record<string, { value: string; label: string }[]> = {
    member_status: [
      { value: 'non_member', label: '非会员' },
      { value: 'expired', label: '已过期' },
      { value: 'active', label: '活跃会员' },
    ],
    identity: [
      { value: 'pregnant', label: '怀孕' },
      { value: 'mother', label: '宝妈' },
      { value: 'tfc', label: '备孕' },
    ],
  };

  const addGroup = () => {
    const newGroup: AudienceGroup = {
      id: `group_${Date.now()}`,
      name: `客群${data.audienceGroups.length + 1}`,
      rules: [],
      shelves: [],
    };
    onChange({ ...data, audienceGroups: [...data.audienceGroups, newGroup] });
  };

  const removeGroup = (groupId: string) => {
    onChange({
      ...data,
      audienceGroups: data.audienceGroups.filter((g) => g.id !== groupId),
    });
  };

  const updateGroup = (groupId: string, updates: Partial<AudienceGroup>) => {
    onChange({
      ...data,
      audienceGroups: data.audienceGroups.map((g) =>
        g.id === groupId ? { ...g, ...updates } : g
      ),
    });
  };

  const addRule = (groupId: string) => {
    const group = data.audienceGroups.find((g) => g.id === groupId);
    if (!group) return;
    const newRule: AudienceRule = {
      id: `rule_${Date.now()}`,
      field: '',
      label: '',
      value: '',
      operator: 'equals',
    };
    updateGroup(groupId, { rules: [...group.rules, newRule] });
  };

  const removeRule = (groupId: string, ruleId: string) => {
    const group = data.audienceGroups.find((g) => g.id === groupId);
    if (!group) return;
    updateGroup(groupId, { rules: group.rules.filter((r) => r.id !== ruleId) });
  };

  const updateRule = (groupId: string, ruleId: string, updates: Partial<AudienceRule>) => {
    const group = data.audienceGroups.find((g) => g.id === groupId);
    if (!group) return;
    updateGroup(groupId, {
      rules: group.rules.map((r) => (r.id === ruleId ? { ...r, ...updates } : r)),
    });
  };

  const addShelf = (groupId: string) => {
    const group = data.audienceGroups.find((g) => g.id === groupId);
    if (!group) return;
    const newShelf: ShelfItem = {
      id: `shelf_${Date.now()}`,
      planId: '',
      planName: '',
      isMainPush: group.shelves.length === 0,
      sortOrder: group.shelves.length,
      patchIds: [],
    };
    updateGroup(groupId, { shelves: [...group.shelves, newShelf] });
  };

  const removeShelf = (groupId: string, shelfId: string) => {
    const group = data.audienceGroups.find((g) => g.id === groupId);
    if (!group) return;
    updateGroup(groupId, { shelves: group.shelves.filter((s) => s.id !== shelfId) });
  };

  const updateShelf = (groupId: string, shelfId: string, updates: Partial<ShelfItem>) => {
    const group = data.audienceGroups.find((g) => g.id === groupId);
    if (!group) return;
    updateGroup(groupId, {
      shelves: group.shelves.map((s) => (s.id === shelfId ? { ...s, ...updates } : s)),
    });
  };

  const moveShelf = (groupId: string, shelfId: string, direction: 'up' | 'down') => {
    const group = data.audienceGroups.find((g) => g.id === groupId);
    if (!group) return;
    const idx = group.shelves.findIndex((s) => s.id === shelfId);
    if (idx < 0) return;
    const newShelves = [...group.shelves];
    if (direction === 'up' && idx > 0) {
      [newShelves[idx - 1], newShelves[idx]] = [newShelves[idx], newShelves[idx - 1]];
    } else if (direction === 'down' && idx < newShelves.length - 1) {
      [newShelves[idx], newShelves[idx + 1]] = [newShelves[idx + 1], newShelves[idx]];
    }
    updateGroup(groupId, { shelves: newShelves });
  };

  const toggleMainPush = (groupId: string, shelfId: string) => {
    const group = data.audienceGroups.find((g) => g.id === groupId);
    if (!group) return;
    updateGroup(groupId, {
      shelves: group.shelves.map((s) => ({
        ...s,
        isMainPush: s.id === shelfId ? true : false,
      })),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-slate-700">客群与货架配置</Label>
        <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-white" onClick={addGroup}>
          <Plus className="h-3 w-3 mr-1" />
          添加客群
        </Button>
      </div>

      {data.audienceGroups.length === 0 && (
        <div className="text-center py-8 text-slate-400 text-sm border rounded-lg border-dashed border-slate-300">
          暂无客群，点击"添加客群"开始配置
        </div>
      )}

      {data.audienceGroups.map((group, gIdx) => (
        <Card key={group.id} className="border-slate-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Input
                  className="w-[160px] h-8 text-sm"
                  value={group.name}
                  onChange={(e) => updateGroup(group.id, { name: e.target.value })}
                />
                <Badge variant="outline" className="text-xs">
                  客群 {gIdx + 1}
                </Badge>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-400 hover:text-red-500"
                onClick={() => removeGroup(group.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 受众规则 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">受众规则</span>
                <Button size="sm" variant="outline" onClick={() => addRule(group.id)}>
                  <Plus className="h-3 w-3 mr-1" />
                  添加条件
                </Button>
              </div>
              {group.rules.length === 0 && (
                <p className="text-xs text-slate-400 py-2">未设置筛选条件，所有用户可见</p>
              )}
              <div className="space-y-2">
                {group.rules.map((rule) => (
                  <div key={rule.id} className="flex items-center gap-2">
                    <Select
                      value={rule.field}
                      onValueChange={(val) => {
                        const opt = ruleFieldOptions.find((o) => o.value === val);
                        updateRule(group.id, rule.id, {
                          field: val,
                          label: opt?.label || '',
                          value: '',
                        });
                      }}
                    >
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue placeholder="选择字段" />
                      </SelectTrigger>
                      <SelectContent>
                        {ruleFieldOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={rule.operator}
                      onValueChange={(val) =>
                        updateRule(group.id, rule.id, { operator: val as 'equals' | 'in' })
                      }
                    >
                      <SelectTrigger className="w-[80px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equals">等于</SelectItem>
                        <SelectItem value="in">包含</SelectItem>
                      </SelectContent>
                    </Select>
                    {ruleValueOptions[rule.field] ? (
                      <Select
                        value={Array.isArray(rule.value) ? rule.value[0] : rule.value}
                        onValueChange={(val) =>
                          updateRule(group.id, rule.id, {
                            value: rule.operator === 'in' ? [val] : val,
                          })
                        }
                      >
                        <SelectTrigger className="w-[130px] h-8 text-xs">
                          <SelectValue placeholder="选择值" />
                        </SelectTrigger>
                        <SelectContent>
                          {ruleValueOptions[rule.field]?.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        className="w-[130px] h-8 text-xs"
                        placeholder="输入值"
                        value={Array.isArray(rule.value) ? rule.value.join(',') : rule.value}
                        onChange={(e) =>
                          updateRule(group.id, rule.id, { value: e.target.value })
                        }
                      />
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-red-500 h-8 w-8 p-0"
                      onClick={() => removeRule(group.id, rule.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* 货架配置 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">套餐货架</span>
                <Button size="sm" variant="outline" onClick={() => addShelf(group.id)}>
                  <Plus className="h-3 w-3 mr-1" />
                  添加套餐
                </Button>
              </div>
              {group.shelves.length === 0 && (
                <p className="text-xs text-slate-400 py-2">暂无套餐，点击添加</p>
              )}
              <div className="space-y-2">
                {group.shelves.map((shelf) => {
                  const patch = mockPromoPatches.find(
                    (p) => shelf.patchIds.length > 0 && p.id === shelf.patchIds[0]
                  );
                  return (
                    <div
                      key={shelf.id}
                      className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50"
                    >
                      <div className="flex flex-col gap-0.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-4 w-4 p-0"
                          onClick={() => moveShelf(group.id, shelf.id, 'up')}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-4 w-4 p-0"
                          onClick={() => moveShelf(group.id, shelf.id, 'down')}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                      </div>
                      <Select
                        value={shelf.planId}
                        onValueChange={(val) => {
                          const plan = mockPlans.find((p) => p.id === val);
                          updateShelf(group.id, shelf.id, {
                            planId: val,
                            planName: plan?.name || '',
                          });
                        }}
                      >
                        <SelectTrigger className="w-[160px] h-8 text-xs">
                          <SelectValue placeholder="选择套餐" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockPlans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={shelf.patchIds[0] || ''}
                        onValueChange={(val) =>
                          updateShelf(group.id, shelf.id, {
                            patchIds: val ? [val] : [],
                          })
                        }
                      >
                        <SelectTrigger className="w-[160px] h-8 text-xs">
                          <SelectValue placeholder="选择策略补丁" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockPromoPatches.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        variant={shelf.isMainPush ? 'default' : 'outline'}
                        className={
                          shelf.isMainPush
                            ? 'bg-rose-500 hover:bg-rose-600 text-white h-8 text-xs'
                            : 'h-8 text-xs'
                        }
                        onClick={() => toggleMainPush(group.id, shelf.id)}
                      >
                        主推
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-slate-400 hover:text-red-500 h-8 w-8 p-0"
                        onClick={() => removeShelf(group.id, shelf.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ==================== Step 3: 挂载玩法组件 ====================
function StepComponents({
  data,
  onChange,
  components,
}: {
  data: Step3Data;
  onChange: (data: Step3Data) => void;
  components: TemplateComponent[];
}) {
  const hasLottery = components.some((c) => c.key === 'lottery_gacha' && c.enabled);

  return (
    <div className="space-y-6">
      {/* 抽奖挂载 */}
      {hasLottery && (
        <div>
          <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Gift className="h-4 w-4" />
            抽奖挂载
          </Label>
          <p className="text-xs text-slate-400 mt-1 mb-3">
            选择已配置好的奖池，场景码隔离概率
          </p>
          <div className="rounded-lg border border-slate-200 p-4 space-y-4">
            <div className="flex items-center gap-3">
              <Switch
                checked={data.lotteryConfig.enabled}
                className="data-[state=checked]:bg-rose-500"
                onCheckedChange={(checked) =>
                  onChange({
                    ...data,
                    lotteryConfig: { ...data.lotteryConfig, enabled: checked },
                  })
                }
              />
              <span className="text-sm text-slate-600">启用抽奖</span>
            </div>
            {data.lotteryConfig.enabled && (
              <div>
                <Label className="text-xs text-slate-500">奖池ID</Label>
                <Select
                  value={data.lotteryConfig.poolId}
                  onValueChange={(val) => {
                    const pool = mockLotteryPools.find((p) => p.id === val);
                    onChange({
                      ...data,
                      lotteryConfig: {
                        ...data.lotteryConfig,
                        poolId: val,
                        poolName: pool?.name || '',
                      },
                    });
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="选择奖池" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockLotteryPools.map((pool) => (
                      <SelectItem key={pool.id} value={pool.id}>
                        {pool.name}（{pool.id}）
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 素材替换 */}
      <div>
        <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <Image className="h-4 w-4" />
          素材替换
        </Label>
        <p className="text-xs text-slate-400 mt-1 mb-3">
          统一上传该模板预留的氛围头图、规则文案、弹窗背景等
        </p>

        <div className="space-y-4">
          {/* 头图上传 */}
          <div className="rounded-lg border border-slate-200 p-4">
            <Label className="text-sm font-medium text-slate-700">氛围头图</Label>
            <p className="text-xs text-slate-400 mt-1 mb-3">活动页面顶部氛围大图</p>
            <div className="flex items-center gap-3">
              <Input
                placeholder="输入头图URL或上传"
                value={data.materialConfig.headerBanner || ''}
                onChange={(e) =>
                  onChange({
                    ...data,
                    materialConfig: { ...data.materialConfig, headerBanner: e.target.value },
                  })
                }
              />
              <Button variant="outline" size="sm">
                <Image className="h-4 w-4 mr-1" />
                上传
              </Button>
            </div>
          </div>

          {/* 弹窗背景 */}
          <div className="rounded-lg border border-slate-200 p-4">
            <Label className="text-sm font-medium text-slate-700">弹窗背景</Label>
            <p className="text-xs text-slate-400 mt-1 mb-3">活动弹窗的背景图片</p>
            <div className="flex items-center gap-3">
              <Input
                placeholder="输入弹窗背景URL或上传"
                value={data.materialConfig.popupBg || ''}
                onChange={(e) =>
                  onChange({
                    ...data,
                    materialConfig: { ...data.materialConfig, popupBg: e.target.value },
                  })
                }
              />
              <Button variant="outline" size="sm">
                <Image className="h-4 w-4 mr-1" />
                上传
              </Button>
            </div>
          </div>

          {/* 规则文案 */}
          <div className="rounded-lg border border-slate-200 p-4">
            <Label className="text-sm font-medium text-slate-700">规则文案</Label>
            <p className="text-xs text-slate-400 mt-1 mb-3">
              活动规则说明弹窗中的文案内容
            </p>
            <Textarea
              placeholder="请输入活动规则文案..."
              rows={4}
              value={data.materialConfig.ruleText || ''}
              onChange={(e) =>
                onChange({
                  ...data,
                  materialConfig: { ...data.materialConfig, ruleText: e.target.value },
                })
              }
            />
          </div>

          {/* 跑马灯文案 */}
          {components.some((c) => c.key === 'winner_marquee' && c.enabled) && (
            <div className="rounded-lg border border-slate-200 p-4">
              <Label className="text-sm font-medium text-slate-700">跑马灯文案</Label>
              <p className="text-xs text-slate-400 mt-1 mb-3">
                中奖跑马灯滚动显示文案
              </p>
              <Input
                placeholder="如：恭喜用户***获得全棉时代礼包"
                value={data.materialConfig.marqueeText || ''}
                onChange={(e) =>
                  onChange({
                    ...data,
                    materialConfig: {
                      ...data.materialConfig,
                      marqueeText: e.target.value,
                    },
                  })
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== Main Wizard Component ====================
interface ActivityFormWizardProps {
  editId?: string;
  initialData?: Activity | null;
}

export default function ActivityFormWizard({ editId, initialData }: ActivityFormWizardProps) {
  const router = useRouter();
  const isEdit = !!editId;
  const [currentStep, setCurrentStep] = useState(1);

  const [step1Data, setStep1Data] = useState<Step1Data>(() => {
    if (initialData) {
      const raw = initialData as unknown as Record<string, unknown>;
      const rawTimeConfig = raw.time_config || raw.timeConfig || {};
      const timeConfig = (typeof rawTimeConfig === 'string' ? JSON.parse(rawTimeConfig) : rawTimeConfig) as Record<string, string>;
      const rawComponents = raw.components
        ? (typeof raw.components === 'string' ? JSON.parse(raw.components as string) : raw.components)
        : [];
      let components: TemplateComponent[] = [];
      if (Array.isArray(rawComponents)) {
        components = rawComponents.map((c: TemplateComponent) => ({ ...c }));
      } else if (typeof rawComponents === 'object') {
        // Activity stores components as {key: enabled} map
        // Need to find the template to get full component definitions
        const compMap = rawComponents as Record<string, boolean>;
        const tplId = (raw.template_id || raw.templateId || '') as string;
        const tpl = mockTemplates.find((t: { id: string }) => t.id === tplId);
        if (tpl && Array.isArray(tpl.components)) {
          components = tpl.components.map((c: TemplateComponent) => ({
            ...c,
            enabled: compMap[c.key] !== undefined ? compMap[c.key] : c.enabled,
          }));
        }
      }
      return {
        templateId: (raw.template_id || raw.templateId || '') as string,
        category: (raw.category || '') as string,
        name: initialData.name,
        sceneKey: (raw.scene_key || raw.sceneKey || '') as string,
        sellStartTime: timeConfig.sellStartTime || '',
        sellEndTime: timeConfig.sellEndTime || '',
        lotteryStartTime: timeConfig.lotteryStartTime || '',
        lotteryEndTime: timeConfig.lotteryEndTime || '',
        bufferEndTime: timeConfig.bufferEndTime || '',
        refundCutoffTime: timeConfig.refundCutoffTime || '',
        components,
      };
    }
    return {
      templateId: '',
      category: '',
      name: '',
      sceneKey: '',
      sellStartTime: '',
      sellEndTime: '',
      lotteryStartTime: '',
      lotteryEndTime: '',
      bufferEndTime: '',
      refundCutoffTime: '',
      components: [],
    };
  });

  const [step2Data, setStep2Data] = useState<Step2Data>(() => {
    if (initialData) {
      const raw = initialData as unknown as Record<string, unknown>;
      const rawGroups = raw.audience_groups || raw.audienceGroups || [];
      const groups = (typeof rawGroups === 'string' ? JSON.parse(rawGroups as string) : rawGroups) as AudienceGroup[];
      return { audienceGroups: groups.map((g: AudienceGroup) => ({ ...g })) };
    }
    return { audienceGroups: [] };
  });

  const [step3Data, setStep3Data] = useState<Step3Data>(() => {
    if (initialData) {
      const raw = initialData as unknown as Record<string, unknown>;
      const rawLottery = raw.lottery_config || raw.lotteryConfig || { enabled: false, poolId: '', poolName: '' };
      const lotteryConfig = (typeof rawLottery === 'string' ? JSON.parse(rawLottery as string) : rawLottery) as LotteryConfig;
      const rawMaterial = raw.material_config || raw.materialConfig || {};
      const materialConfig = (typeof rawMaterial === 'string' ? JSON.parse(rawMaterial as string) : rawMaterial) as MaterialConfig;
      return { lotteryConfig, materialConfig };
    }
    return {
      lotteryConfig: { enabled: false, poolId: '', poolName: '' },
      materialConfig: {},
    };
  });

  const canProceed = () => {
    if (currentStep === 1) {
      return (
        step1Data.templateId !== '' &&
        step1Data.name !== '' &&
        step1Data.category !== '' &&
        step1Data.sceneKey !== ''
      );
    }
    if (currentStep === 2) {
      return step2Data.audienceGroups.some((g) => g.shelves.length > 0);
    }
    return true;
  };

  const handlePublish = async () => {
    const payload = {
      name: step1Data.name,
      category: step1Data.category,
      scene_key: step1Data.sceneKey,
      template_id: step1Data.templateId,
      template_name: mockTemplates.find((t) => t.id === step1Data.templateId)?.name || '',
      status: 'active' as const,
      time_config: {
        sellStartTime: step1Data.sellStartTime,
        sellEndTime: step1Data.sellEndTime,
        lotteryStartTime: step1Data.lotteryStartTime,
        lotteryEndTime: step1Data.lotteryEndTime,
        bufferEndTime: step1Data.bufferEndTime,
        refundCutoffTime: step1Data.refundCutoffTime,
      },
      audience_groups: step2Data.audienceGroups,
      lottery_config: step3Data.lotteryConfig,
      material_config: step3Data.materialConfig,
      components: Object.fromEntries(
        step1Data.components.filter((c) => !c.required).map((c) => [c.key, c.enabled])
      ),
    };

    try {
      if (isEdit && editId) {
        await fetch(`/api/activities/${editId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        alert('活动已更新成功！');
      } else {
        await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: `act_${Date.now()}` }),
        });
        alert('活动已创建成功！');
      }
      router.push('/activities');
    } catch {
      alert('操作失败，请重试');
    }
  };

  const handleDelete = async () => {
    if (!editId) return;
    if (!confirm('确认删除此活动？删除后不可恢复。')) return;
    try {
      await fetch(`/api/activities/${editId}`, { method: 'DELETE' });
      alert('活动已删除');
      router.push('/activities');
    } catch {
      alert('删除失败，请重试');
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {isEdit ? '编辑活动' : '新建活动'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isEdit
              ? '修改活动配置信息'
              : '选定模板 → 配置受众与货架 → 挂载玩法组件，三步完成活动配置'}
          </p>
        </div>
        {isEdit && (
          <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={handleDelete}>
            删除活动
          </Button>
        )}
      </div>

      {/* 步骤条 */}
      <div className="flex items-center justify-center gap-0">
        {stepConfig.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = currentStep > step.num;
          const isCurrent = currentStep === step.num;
          return (
            <div key={step.num} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : step.num}
                </div>
                <div className="flex items-center gap-1.5">
                  <StepIcon className={`h-4 w-4 ${isCurrent ? 'text-rose-500' : isCompleted ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span className={`text-sm ${isCurrent ? 'text-slate-900 font-medium' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {step.label}
                  </span>
                </div>
              </div>
              {index < stepConfig.length - 1 && (
                <div className={`w-16 h-0.5 mx-3 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* 步骤内容 */}
      <Card>
        <CardContent className="pt-6">
          {currentStep === 1 && (
            <StepBasicInfo data={step1Data} onChange={setStep1Data} isEdit={isEdit} />
          )}
          {currentStep === 2 && (
            <StepAudienceShelf data={step2Data} onChange={setStep2Data} />
          )}
          {currentStep === 3 && (
            <StepComponents
              data={step3Data}
              onChange={setStep3Data}
              components={step1Data.components}
            />
          )}
        </CardContent>
      </Card>

      {/* 底部操作栏 */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          className="border-slate-300"
          onClick={() => {
            if (currentStep === 1) {
              router.push('/activities');
            } else {
              setCurrentStep((prev) => prev - 1);
            }
          }}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          {currentStep === 1 ? '返回列表' : '上一步'}
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-slate-300">
            保存草稿
          </Button>
          {currentStep < 3 ? (
            <Button
              className="bg-rose-500 hover:bg-rose-600 text-white"
              disabled={!canProceed()}
              onClick={() => setCurrentStep((prev) => prev + 1)}
            >
              下一步
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={handlePublish}
            >
              <Check className="mr-1 h-4 w-4" />
              {isEdit ? '保存修改' : '发布活动'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
