'use client';

import { useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Puzzle,
  Users,
  Settings2,
  CalendarDays,
  Gift,
  ArrowUp,
  ArrowDown,
  Plus,
  X,
  Image,
  FileText,
  Wand2,
} from 'lucide-react';
import type { TemplateComponent, AudienceRule, ShelfItem, LotteryConfig, MaterialConfig } from '@/lib/types';
import { mockTemplates, mockPlans, mockPromoPatches, mockLotteryPools } from '@/lib/mock-data';

interface Step1Data {
  templateId: string;
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
  audienceRules: AudienceRule[];
  shelves: ShelfItem[];
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

const stepConfig = [
  { num: 1, label: '选择模板与基础信息', icon: Puzzle },
  { num: 2, label: '受众规则与货架配置', icon: Users },
  { num: 3, label: '挂载玩法组件', icon: Settings2 },
];

// ==================== Step 1: 选择模板与基础信息 ====================
function StepBasicInfo({
  data,
  onChange,
}: {
  data: Step1Data;
  onChange: (data: Step1Data) => void;
}) {
  const selectedTemplate = mockTemplates.find((t) => t.id === data.templateId);

  const handleTemplateSelect = (templateId: string) => {
    const template = mockTemplates.find((t) => t.id === templateId);
    onChange({
      ...data,
      templateId,
      components: template ? [...template.components] : [],
    });
  };

  return (
    <div className="space-y-6">
      {/* 选择模板 */}
      <div>
        <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
          <Puzzle className="h-4 w-4 text-slate-500" />
          选择活动模板 <span className="text-red-500">*</span>
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {mockTemplates.map((template) => {
            const isSelected = data.templateId === template.id;
            return (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all border-2 ${
                  isSelected
                    ? 'border-rose-500 bg-rose-50/30 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className={categoryColorMap[template.category] || defaultCategoryColor}>
                      {template.category}
                    </Badge>
                    {isSelected && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">{template.name}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{template.description}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {template.components.slice(0, 3).map((comp) => (
                      <span key={comp.id} className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                        {comp.name}
                      </span>
                    ))}
                    {template.components.length > 3 && (
                      <span className="text-xs text-slate-400">+{template.components.length - 3}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* 基础信息 */}
      <div>
        <h3 className="text-sm font-medium text-slate-700 mb-3">基础信息</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>活动名称 <span className="text-red-500">*</span></Label>
            <Input
              placeholder="如：618会员狂欢节"
              value={data.name}
              onChange={(e) => onChange({ ...data, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>活动唯一路由 (scene_key) <span className="text-red-500">*</span></Label>
            <Input
              placeholder="如：promo_618_2024"
              value={data.sceneKey}
              onChange={(e) => onChange({ ...data, sceneKey: e.target.value })}
            />
            <p className="text-xs text-slate-400">全渠道通用，用于运营位投放策略</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* 生命周期时序轴 */}
      <div>
        <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-slate-500" />
          生命周期时序轴
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>售卖开始时间 <span className="text-red-500">*</span></Label>
              <Input
                type="datetime-local"
                value={data.sellStartTime}
                onChange={(e) => onChange({ ...data, sellStartTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>售卖结束时间 <span className="text-red-500">*</span></Label>
              <Input
                type="datetime-local"
                value={data.sellEndTime}
                onChange={(e) => onChange({ ...data, sellEndTime: e.target.value })}
              />
            </div>
          </div>
          {selectedTemplate && (selectedTemplate.category === '年度大促' || selectedTemplate.category === '会员日') && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>抽奖开始时间</Label>
                <Input
                  type="datetime-local"
                  value={data.lotteryStartTime}
                  onChange={(e) => onChange({ ...data, lotteryStartTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>抽奖结束时间</Label>
                <Input
                  type="datetime-local"
                  value={data.lotteryEndTime}
                  onChange={(e) => onChange({ ...data, lotteryEndTime: e.target.value })}
                />
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>缓冲截止时间</Label>
              <Input
                type="datetime-local"
                value={data.bufferEndTime}
                onChange={(e) => onChange({ ...data, bufferEndTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>退款熔断截单时间</Label>
              <Input
                type="datetime-local"
                value={data.refundCutoffTime}
                onChange={(e) => onChange({ ...data, refundCutoffTime: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 组件开关矩阵 */}
      {data.components.length > 0 && (
        <>
          <Separator />
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-slate-500" />
                组件开关矩阵
              </h3>
              <span className="text-xs text-slate-400">对模板内局部楼层进行显隐控制</span>
            </div>
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left p-2.5 font-medium text-slate-600">组件</th>
                    <th className="text-left p-2.5 font-medium text-slate-600">说明</th>
                    <th className="text-center p-2.5 font-medium text-slate-600 w-20">显隐</th>
                  </tr>
                </thead>
                <tbody>
                  {data.components.map((comp) => (
                    <tr key={comp.id} className={`border-b border-slate-100 last:border-0 ${!comp.enabled ? 'bg-slate-50/50' : ''}`}>
                      <td className="p-2.5 font-medium text-slate-900">{comp.name}</td>
                      <td className="p-2.5 text-slate-500">{comp.description}</td>
                      <td className="p-2.5 text-center">
                        <Switch
                          checked={comp.enabled}
                          disabled={comp.required}
                          onCheckedChange={(checked) => {
                            const updated = data.components.map((c) =>
                              c.id === comp.id ? { ...c, enabled: checked } : c
                            );
                            onChange({ ...data, components: updated });
                          }}
                          className="data-[state=checked]:bg-rose-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ==================== Step 2: 受众规则与货架配置 ====================
function StepAudienceShelves({
  data,
  onChange,
}: {
  data: Step2Data;
  onChange: (data: Step2Data) => void;
}) {
  const audienceFields = [
    { value: 'member_status', label: '会员状态', options: ['已过期', '非会员', '活跃会员', '即将过期'] },
    { value: 'identity', label: '身份模式', options: ['备孕', '怀孕', '产后', '育儿', '经期'] },
    { value: 'platform', label: '平台', options: ['iOS', 'Android', '小程序'] },
    { value: 'is_new_user', label: '是否新用户', options: ['是', '否'] },
  ];

  const addRule = () => {
    const newRule: AudienceRule = {
      id: `rule_${Date.now()}`,
      field: '',
      label: '',
      operator: 'in',
      value: '',
    };
    onChange({ ...data, audienceRules: [...data.audienceRules, newRule] });
  };

  const removeRule = (ruleId: string) => {
    onChange({ ...data, audienceRules: data.audienceRules.filter((r) => r.id !== ruleId) });
  };

  const updateRule = (ruleId: string, updates: Partial<AudienceRule>) => {
    onChange({
      ...data,
      audienceRules: data.audienceRules.map((r) =>
        r.id === ruleId ? { ...r, ...updates } : r
      ),
    });
  };

  const addShelf = (planId: string) => {
    const plan = mockPlans.find((p) => p.id === planId);
    if (!plan) return;
    const newShelf: ShelfItem = {
      id: `shelf_${Date.now()}`,
      planId: plan.id,
      planName: plan.name,
      isMainPush: data.shelves.length === 0,
      sortOrder: data.shelves.length,
      patchIds: [],
    };
    onChange({ ...data, shelves: [...data.shelves, newShelf] });
  };

  const removeShelf = (shelfId: string) => {
    onChange({
      ...data,
      shelves: data.shelves.filter((s) => s.id !== shelfId),
    });
  };

  const moveShelf = (shelfId: string, direction: 'up' | 'down') => {
    const idx = data.shelves.findIndex((s) => s.id === shelfId);
    if (idx < 0) return;
    const newShelves = [...data.shelves];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= newShelves.length) return;
    [newShelves[idx], newShelves[swapIdx]] = [newShelves[swapIdx], newShelves[idx]];
    newShelves.forEach((s, i) => (s.sortOrder = i));
    onChange({ ...data, shelves: newShelves });
  };

  const toggleShelfPatch = (shelfId: string, patchId: string) => {
    onChange({
      ...data,
      shelves: data.shelves.map((s) => {
        if (s.id !== shelfId) return s;
        const patchIds = s.patchIds.includes(patchId)
          ? s.patchIds.filter((id) => id !== patchId)
          : [...s.patchIds, patchId];
        return { ...s, patchIds };
      }),
    });
  };

  const setMainPush = (shelfId: string) => {
    onChange({
      ...data,
      shelves: data.shelves.map((s) => ({
        ...s,
        isMainPush: s.id === shelfId,
      })),
    });
  };

  const availablePlans = mockPlans.filter(
    (p) => !data.shelves.some((s) => s.planId === p.id)
  );

  const activePatches = mockPromoPatches.filter((p) => p.status === 'active');

  return (
    <div className="space-y-6">
      {/* 客群分层 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-500" />
            客群分层勾选
          </h3>
          <Button variant="outline" size="sm" className="border-slate-300" onClick={addRule}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            添加条件
          </Button>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          支持复合筛选，如：身份模式 = 怀孕 且 会员状态 = 已过期
        </p>
        {data.audienceRules.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center">
            <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">暂无客群条件，点击"添加条件"开始配置</p>
            <p className="text-xs text-slate-400 mt-1">不配置则默认所有用户可见</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.audienceRules.map((rule, index) => (
              <div key={rule.id} className="flex items-end gap-3 rounded-lg border border-slate-200 p-3">
                <span className="text-xs text-slate-400 mb-2">条件 {index + 1}</span>
                <div className="space-y-1 flex-1">
                  <Label className="text-xs">筛选维度</Label>
                  <Select
                    value={rule.field}
                    onValueChange={(val) => {
                      const field = audienceFields.find((f) => f.value === val);
                      updateRule(rule.id, { field: val, label: field?.label || '' });
                    }}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="选择维度" />
                    </SelectTrigger>
                    <SelectContent>
                      {audienceFields.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 w-24">
                  <Label className="text-xs">运算符</Label>
                  <Select
                    value={rule.operator}
                    onValueChange={(val) => updateRule(rule.id, { operator: val })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">等于</SelectItem>
                      <SelectItem value="in">包含</SelectItem>
                      <SelectItem value="not_in">不包含</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 flex-1">
                  <Label className="text-xs">值</Label>
                  {rule.field ? (
                    <Select
                      value={typeof rule.value === 'string' ? rule.value : ''}
                      onValueChange={(val) => updateRule(rule.id, { value: val })}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="选择值" />
                      </SelectTrigger>
                      <SelectContent>
                        {audienceFields
                          .find((f) => f.value === rule.field)
                          ?.options.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input className="h-9" placeholder="先选择维度" disabled />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 text-slate-400 hover:text-red-500"
                  onClick={() => removeRule(rule.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* 货架配置 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Gift className="h-4 w-4 text-slate-500" />
            货架动态勾选
          </h3>
          {availablePlans.length > 0 && (
            <Select onValueChange={addShelf}>
              <SelectTrigger className="w-[180px] h-8 border-slate-300">
                <SelectValue placeholder="添加套餐到货架" />
              </SelectTrigger>
              <SelectContent>
                {availablePlans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} - ¥{plan.price}/{plan.duration}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        <p className="text-xs text-slate-400 mb-3">
          直接调用日常产品管理与价格管理数据，拖拽排序决定主推/次推
        </p>

        {data.shelves.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center">
            <Gift className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">暂未配置货架，从右侧下拉添加套餐</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.shelves.map((shelf, index) => {
              const plan = mockPlans.find((p) => p.id === shelf.planId);
              return (
                <div
                  key={shelf.id}
                  className={`rounded-lg border p-4 ${
                    shelf.isMainPush
                      ? 'border-rose-200 bg-rose-50/30'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* 排序按钮 */}
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        disabled={index === 0}
                        onClick={() => moveShelf(shelf.id, 'up')}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        disabled={index === data.shelves.length - 1}
                        onClick={() => moveShelf(shelf.id, 'down')}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* 套餐信息 */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{shelf.planName}</span>
                        {plan && (
                          <span className="text-xs text-slate-500">
                            ¥{plan.price}/{plan.duration}
                          </span>
                        )}
                        {shelf.isMainPush ? (
                          <Badge className="bg-rose-500 text-white text-xs">主推</Badge>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-5 text-xs border-slate-300"
                            onClick={() => setMainPush(shelf.id)}
                          >
                            设为主推
                          </Button>
                        )}
                      </div>

                      {/* 策略补丁 */}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {activePatches.map((patch) => {
                          const isSelected = shelf.patchIds.includes(patch.id);
                          const typeLabels: Record<string, string> = {
                            price_discount: '立减',
                            bonus_duration: '加赠',
                            gift: '赠礼',
                          };
                          const typeColors: Record<string, string> = {
                            price_discount: isSelected ? 'bg-rose-100 text-rose-700 border-rose-300' : 'bg-white text-slate-600 border-slate-200',
                            bonus_duration: isSelected ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-white text-slate-600 border-slate-200',
                            gift: isSelected ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-white text-slate-600 border-slate-200',
                          };
                          return (
                            <button
                              key={patch.id}
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs transition-colors ${
                                typeColors[patch.type]
                              }`}
                              onClick={() => toggleShelfPatch(shelf.id, patch.id)}
                            >
                              {isSelected && <Check className="mr-0.5 h-2.5 w-2.5" />}
                              {typeLabels[patch.type]} · {patch.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 删除 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-500"
                      onClick={() => removeShelf(shelf.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
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
  const hasLotteryComponent = components.some(
    (c) => c.key === 'lottery_gacha' && c.enabled
  );

  return (
    <div className="space-y-6">
      {/* 抽奖挂载 */}
      {hasLotteryComponent && (
        <div>
          <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-slate-500" />
            抽奖挂载
          </h3>
          <div className="rounded-lg border border-slate-200 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">启用抽奖组件</p>
                <p className="text-xs text-slate-500">开启后需绑定已配置的奖池</p>
              </div>
              <Switch
                checked={data.lotteryConfig.enabled}
                onCheckedChange={(checked) =>
                  onChange({
                    ...data,
                    lotteryConfig: { ...data.lotteryConfig, enabled: checked },
                  })
                }
                className="data-[state=checked]:bg-rose-500"
              />
            </div>
            {data.lotteryConfig.enabled && (
              <div className="space-y-2">
                <Label>选择奖池</Label>
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
                  <SelectTrigger>
                    <SelectValue placeholder="选择已配置的奖池ID" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockLotteryPools
                      .filter((p) => p.status === 'active')
                      .map((pool) => (
                        <SelectItem key={pool.id} value={pool.id}>
                          {pool.name} (场景码: {pool.sceneCode})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-400">场景码隔离概率，不同奖池互不影响</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 素材替换 */}
      <div>
        <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
          <Image className="h-4 w-4 text-slate-500" />
          素材替换
        </h3>
        <p className="text-xs text-slate-400 mb-3">
          统一上传该模板预留的氛围头图、规则文案、弹窗背景等素材
        </p>
        <div className="space-y-4">
          {/* 头图 */}
          <div className="rounded-lg border border-slate-200 p-4">
            <Label className="text-sm font-medium text-slate-700">氛围头图</Label>
            <p className="text-xs text-slate-400 mt-1 mb-3">
              活动页面顶部大图，建议尺寸 750x400
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-20 w-32 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
                <Image className="h-6 w-6 text-slate-300" />
              </div>
              <Button variant="outline" size="sm" className="border-slate-300">
                上传图片
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

          {/* 弹窗背景 */}
          <div className="rounded-lg border border-slate-200 p-4">
            <Label className="text-sm font-medium text-slate-700">弹窗背景</Label>
            <p className="text-xs text-slate-400 mt-1 mb-3">
              规则弹窗、中奖弹窗的背景图，建议尺寸 600x800
            </p>
            <div className="flex items-center gap-3">
              <div className="flex h-20 w-16 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
                <Image className="h-6 w-6 text-slate-300" />
              </div>
              <Button variant="outline" size="sm" className="border-slate-300">
                上传图片
              </Button>
            </div>
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

// ==================== Main Wizard Page ====================
export default function NewActivityPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const [step1Data, setStep1Data] = useState<Step1Data>({
    templateId: '',
    name: '',
    sceneKey: '',
    sellStartTime: '',
    sellEndTime: '',
    lotteryStartTime: '',
    lotteryEndTime: '',
    bufferEndTime: '',
    refundCutoffTime: '',
    components: [],
  });

  const [step2Data, setStep2Data] = useState<Step2Data>({
    audienceRules: [],
    shelves: [],
  });

  const [step3Data, setStep3Data] = useState<Step3Data>({
    lotteryConfig: {
      enabled: false,
      poolId: '',
      poolName: '',
    },
    materialConfig: {},
  });

  const canProceed = () => {
    if (currentStep === 1) {
      return step1Data.templateId !== '' && step1Data.name !== '' && step1Data.sceneKey !== '';
    }
    if (currentStep === 2) {
      return step2Data.shelves.length > 0;
    }
    return true;
  };

  const handlePublish = () => {
    // 这里可以接入API保存数据
    alert('活动已创建成功！即将跳转到活动列表');
    router.push('/activities');
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">新建活动</h1>
          <p className="mt-1 text-sm text-slate-500">
            选定模板 → 配置受众与货架 → 挂载玩法组件，三步完成活动配置
          </p>
        </div>
      </div>

      {/* 步骤条 */}
      <div className="flex items-center justify-center gap-0">
        {stepConfig.map((step, index) => {
          const StepIcon = step.icon;
          const isCompleted = currentStep > step.num;
          const isCurrent = currentStep === step.num;
          return (
            <div key={step.num} className="flex items-center">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isCurrent
                    ? 'bg-rose-50 text-rose-600'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-white text-slate-400'
                }`}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                    isCurrent
                      ? 'bg-rose-500 text-white'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : step.num}
                </div>
                <StepIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{step.label}</span>
              </div>
              {index < stepConfig.length - 1 && (
                <div
                  className={`w-12 h-0.5 mx-2 ${
                    currentStep > step.num ? 'bg-emerald-300' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* 步骤内容 */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          {currentStep === 1 && (
            <StepBasicInfo data={step1Data} onChange={setStep1Data} />
          )}
          {currentStep === 2 && (
            <StepAudienceShelves data={step2Data} onChange={setStep2Data} />
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
              发布活动
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
