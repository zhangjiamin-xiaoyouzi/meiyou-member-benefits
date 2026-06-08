'use client';

import { useState, useMemo } from 'react';
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
  Settings2,
  GripVertical,
  Plus,
  X,
  Image,
  Upload,
  Trash2,
  Users,
  Tag,
  ChevronUp,
  ChevronDown,
  MousePointerClick,
} from 'lucide-react';
import { TimeRangeField, SingleTimeField } from '@/components/activity/time-range-field';
import type {
  TemplateComponent,
  AudienceRule,
  Activity,
  ComponentConfigs,
  GlobalConfig,
  HeaderBannerConfig,
  FlashSaleConfig,
  FlashSaleProduct,
  BenefitConfig,
  BenefitProduct,
  FreePurchaseConfig,
  ActionButtonConfig,
  RulePopupConfig,
  ComponentAudienceRule,
} from '@/lib/types';
import { mockTemplates } from '@/lib/mock-data';

// ==================== Step Data Types ====================

interface Step1Data {
  templateId: string;
  category: string;
  name: string;
  sellStartTime: string;
  sellEndTime: string;
  lotteryStartTime: string;
  lotteryEndTime: string;
  bufferEndTime: string;
  refundCutoffTime: string;
  components: TemplateComponent[];
}

interface Step2Data {
  componentConfigs: ComponentConfigs;
}

// ==================== Constants ====================

const categoryColorMap: Record<string, string> = {
  '促活': 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60',
  '转化': 'bg-amber-50/80 text-amber-700 border-amber-200/60',
  '拉新': 'bg-blue-50/80 text-blue-700 border-blue-200/60',
};
const defaultCategoryColor = 'bg-meiyou-bg text-[var(--color-meiyou-text-secondary)] border-[var(--color-meiyou-border)]';

const defaultCategories = ['促活', '转化', '拉新'];

const stepConfig = [
  { num: 1, label: '选择模板与基础信息', icon: Puzzle },
  { num: 2, label: '填充组件素材', icon: Settings2 },
];

function getCategoryColor(category: string) {
  return categoryColorMap[category] || defaultCategoryColor;
}

// ==================== 受众规则字段选项 ====================

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

// ==================== 全局配置默认值 ====================

const defaultGlobalConfig: GlobalConfig = {
  backgroundType: 'solid',
  solidColor: '#f2f2f5',
  gradientStart: '#ff4d88',
  gradientEnd: '#ff8fab',
  gradientDirection: 'to bottom',
  backgroundImage: '',
};

// ==================== 图片上传占位组件 ====================

function ImageUploadField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-[var(--color-meiyou-text-secondary)]">{label}</Label>
      {value ? (
        <div className="relative group w-24 h-16 rounded border border-[var(--color-meiyou-border)] overflow-hidden bg-meiyou-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              className="h-6 px-2 text-[10px]"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    onChange(url);
                  }
                };
                input.click();
              }}
            >
              <Upload className="h-3 w-3 mr-0.5" />
              更换
            </Button>
            <Button
              variant="secondary"
              size="sm"
              type="button"
              className="h-6 px-2 text-[10px]"
              onClick={() => onChange('')}
            >
              删除
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                const url = URL.createObjectURL(file);
                onChange(url);
              }
            };
            input.click();
          }}
          className="w-24 h-16 rounded border-2 border-dashed border-[var(--color-meiyou-border)] hover:border-meiyou/50 hover:bg-meiyou-light transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer"
        >
          <Upload className="h-4 w-4 text-[var(--color-meiyou-text-placeholder)]" />
          <span className="text-[10px] text-[var(--color-meiyou-text-placeholder)]">上传图片</span>
        </button>
      )}
    </div>
  );
}

// ==================== 受众规则编辑组件 ====================

function AudienceRuleEditor({
  rules,
  onRulesChange,
}: {
  rules: ComponentAudienceRule[];
  onRulesChange: (rules: ComponentAudienceRule[]) => void;
}) {
  const addRule = () => {
    const newRule: ComponentAudienceRule = {
      id: `rule_${Date.now()}`,
      field: '',
      label: '',
      operator: 'equals',
      value: '',
    };
    onRulesChange([...rules, newRule]);
  };

  const removeRule = (ruleId: string) => {
    onRulesChange(rules.filter((r) => r.id !== ruleId));
  };

  const updateRule = (ruleId: string, updates: Partial<ComponentAudienceRule>) => {
    onRulesChange(rules.map((r) => (r.id === ruleId ? { ...r, ...updates } : r)));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--color-meiyou-text-secondary)] flex items-center gap-1">
          <Users className="h-3 w-3" />
          受众规则
        </span>
        <Button size="sm" variant="outline" className="h-6 text-xs" onClick={addRule}>
          <Plus className="h-3 w-3 mr-1" />
          添加条件
        </Button>
      </div>
      {rules.length === 0 && (
        <p className="text-xs text-[var(--color-meiyou-text-placeholder)] py-1">未设置筛选条件，所有用户可见</p>
      )}
      <div className="space-y-2">
        {rules.map((rule) => (
          <div key={rule.id} className="flex items-center gap-2">
            <Select
              value={rule.field}
              onValueChange={(val) => {
                const opt = ruleFieldOptions.find((o) => o.value === val);
                updateRule(rule.id, { field: val, label: opt?.label || '', value: '' });
              }}
            >
              <SelectTrigger className="w-[120px] h-7 text-xs">
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
                updateRule(rule.id, { operator: val as 'equals' | 'in' })
              }
            >
              <SelectTrigger className="w-[70px] h-7 text-xs">
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
                  updateRule(rule.id, { value: rule.operator === 'in' ? [val] : val })
                }
              >
                <SelectTrigger className="w-[120px] h-7 text-xs">
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
                className="w-[120px] h-7 text-xs"
                placeholder="输入值"
                value={Array.isArray(rule.value) ? rule.value.join(',') : rule.value}
                onChange={(e) => updateRule(rule.id, { value: e.target.value })}
              />
            )}
            <Button
              size="sm"
              variant="ghost"
              className="text-[var(--color-meiyou-text-placeholder)] hover:text-red-500 h-7 w-7 p-0"
              onClick={() => removeRule(rule.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
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
  // 活动分类已改为 促活/转化/拉新，模板分类仍保留原值

  const [compDragIndex, setCompDragIndex] = useState<number | null>(null);
  const [allCategories] = useState(defaultCategories);

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
      {/* 活动名称 + 活动分类 同行 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-[var(--color-meiyou-text-primary)]">
            活动名称 <span className="text-meiyou">*</span>
          </Label>
          <Input
            className="mt-1.5"
            placeholder="请输入活动名称"
            value={data.name}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
          />
        </div>
        <div>
          <Label className="text-sm font-medium text-[var(--color-meiyou-text-primary)]">
            活动分类 <span className="text-meiyou">*</span>
          </Label>
          <div className="mt-1.5">
            <Select
              value={data.category}
              onValueChange={(val) => onChange({ ...data, category: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                {allCategories.map((cat) => (
                  <SelectItem
                    key={cat}
                    value={cat}
                  >
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* 选择模板 */}
      <div>
        <Label className="text-sm font-medium text-[var(--color-meiyou-text-primary)]">
          选择活动模板 <span className="text-meiyou">*</span>
        </Label>
        <p className="text-xs text-[var(--color-meiyou-text-placeholder)] mt-1 mb-3">
          {isEdit ? '切换模板将重置组件配置' : '选择模板后将自动加载模板预设组件'}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {mockTemplates
            .slice()
            .sort((a, b) => {
              const order: Record<string, number> = { '会员日': 0, '固定节日': 1, '年度大促': 2 };
              return (order[a.category] ?? 3) - (order[b.category] ?? 3);
            })
            .map((template) => {
              const isDisabled = template.category !== '会员日';
              return (
                <Card
                  key={template.id}
                  className={`transition-all py-0 ${
                    isDisabled
                      ? 'opacity-50 cursor-not-allowed bg-meiyou-bg'
                      : data.templateId === template.id
                        ? 'ring-2 ring-meiyou border-meiyou/40 shadow-md cursor-pointer'
                        : 'hover:border-[var(--color-meiyou-border)] hover:shadow-sm cursor-pointer'
                  }`}
                  onClick={() => {
                    if (!isDisabled) handleTemplateSelect(template.id);
                  }}
                >
                  <CardHeader className="py-1.5 px-2.5 pb-0.5">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-[11px] font-medium">{template.name}</CardTitle>
                      <div className="flex items-center gap-1">
                        {isDisabled && (
                          <Badge className="bg-meiyou-bg text-[var(--color-meiyou-text-placeholder)] border-[var(--color-meiyou-border)] text-[9px] px-1 py-0">
                            本期不做
                          </Badge>
                        )}
                        <Badge className={`${getCategoryColor(template.category)} text-[9px] px-1 py-0`}>
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="py-0.5 px-2.5 pb-1.5">
                    <CardDescription className="text-[10px] line-clamp-1">{template.description}</CardDescription>
                    <div className="mt-1 text-[11px] text-[var(--color-meiyou-text-placeholder)]">
                      {template.components.length} 个组件
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      </div>


      {/* 活动时间配置 */}
      <div>
        <Label className="text-sm font-medium text-[var(--color-meiyou-text-primary)]">活动时间配置</Label>
        <div className="mt-3 space-y-4">
          {/* 活动时间（必填） */}
          <div>
            <Label className="text-xs text-[var(--color-meiyou-text-secondary)]">
              活动时间 <span className="text-meiyou">*</span>
            </Label>
            <TimeRangeField
              startValue={data.sellStartTime}
              endValue={data.bufferEndTime}
              onStartChange={(val) => onChange({ ...data, sellStartTime: val })}
              onEndChange={(val) => onChange({ ...data, bufferEndTime: val })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* 活动预约时间（非必填） */}
            <div>
              <Label className="text-xs text-[var(--color-meiyou-text-secondary)]">
                {isMemberDay ? '活动预约时间' : '售卖时间'}
              </Label>
              <TimeRangeField
                startValue={data.sellStartTime}
                endValue={data.sellEndTime}
                onStartChange={(val) => {
                  if (data.sellStartTime && val < data.sellStartTime) return;
                  if (data.bufferEndTime && val > data.bufferEndTime) return;
                  onChange({ ...data, sellStartTime: val });
                }}
                onEndChange={(val) => {
                  if (data.bufferEndTime && val > data.bufferEndTime) return;
                  onChange({ ...data, sellEndTime: val });
                }}
              />
            </div>
            {/* 活动福利领取时间（非必填） */}
            <div>
              <Label className="text-xs text-[var(--color-meiyou-text-secondary)]">
                {isMemberDay ? '活动福利领取时间' : '抽奖时间'}
              </Label>
              <TimeRangeField
                startValue={data.lotteryStartTime}
                endValue={data.lotteryEndTime}
                onStartChange={(val) => {
                  if (data.sellStartTime && val < data.sellStartTime) return;
                  if (data.bufferEndTime && val > data.bufferEndTime) return;
                  onChange({ ...data, lotteryStartTime: val });
                }}
                onEndChange={(val) => {
                  if (data.bufferEndTime && val > data.bufferEndTime) return;
                  onChange({ ...data, lotteryEndTime: val });
                }}
              />
            </div>
          </div>
          {!isMemberDay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-[var(--color-meiyou-text-secondary)]">退款熔断截单时间</Label>
                <SingleTimeField
                  value={data.refundCutoffTime}
                  onChange={(val) => onChange({ ...data, refundCutoffTime: val })}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 限时福利（组件开关） */}
      {data.components.length > 0 && (
        <div>
          <Label className="text-sm font-medium text-[var(--color-meiyou-text-primary)]">限时福利</Label>
          <p className="text-xs text-[var(--color-meiyou-text-placeholder)] mt-1 mb-3">
            控制模板内各组件的显隐，必选组件不可关闭
          </p>
          <div className="rounded-lg border border-[var(--color-meiyou-border)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-meiyou-bg border-b border-[var(--color-meiyou-border)]">
                  <th className="w-8 px-2 py-2"></th>
                  <th className="text-left text-xs font-medium text-[var(--color-meiyou-text-secondary)] px-3 py-2">组件名称</th>
                  <th className="text-left text-xs font-medium text-[var(--color-meiyou-text-secondary)] px-3 py-2">说明</th>
                  <th className="text-center text-xs font-medium text-[var(--color-meiyou-text-secondary)] px-3 py-2 w-20">状态</th>
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
                    className={`border-b border-[var(--color-meiyou-divider)] last:border-b-0 transition-opacity ${
                      compDragIndex === index ? 'opacity-50' : 'opacity-100'
                    } ${compDragIndex !== null && compDragIndex !== index ? 'border-t-2 border-t-meiyou/40' : ''}`}
                  >
                    <td className="px-2 py-2 cursor-grab active:cursor-grabbing">
                      <GripVertical className="h-4 w-4 text-[var(--color-meiyou-border)] hover:text-[var(--color-meiyou-text-secondary)]" />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[var(--color-meiyou-text-primary)]">{comp.name}</span>
                        {comp.required && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0 bg-meiyou-bg text-[var(--color-meiyou-text-placeholder)] border-[var(--color-meiyou-border)]">
                            必选
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-xs text-[var(--color-meiyou-text-placeholder)]">{comp.description}</td>
                    <td className="px-3 py-2 text-center">
                      <Switch
                        checked={comp.enabled}
                        disabled={comp.required}
                        className="data-[state=checked]:bg-meiyou data-[state=unchecked]:bg-gray-200"
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

// ==================== Step 2: 组件配置 ====================

function StepComponentConfig({
  data,
  onChange,
  components,
}: {
  data: Step2Data;
  onChange: (data: Step2Data) => void;
  components: TemplateComponent[];
}) {
  const configs = data.componentConfigs;

  const updateConfig = (key: keyof ComponentConfigs, value: ComponentConfigs[keyof ComponentConfigs]) => {
    onChange({
      ...data,
      componentConfigs: { ...configs, [key]: value },
    });
  };

  // 判断组件是否启用
  const isComponentEnabled = (key: string) => components.some((c) => c.key === key && c.enabled);

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--color-meiyou-text-secondary)]">
        对已启用的组件进行详细配置，关闭的组件无需配置
      </p>

      {/* 全局配置 */}
      <GlobalConfigCard
        config={configs.global_config || { ...defaultGlobalConfig }}
        onChange={(val) => updateConfig('global_config', val)}
      />

      {/* 氛围头图 */}
      {isComponentEnabled('header_banner') && (
        <Card className="border-[var(--color-meiyou-border)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Image className="h-4 w-4 text-[var(--color-meiyou-text-secondary)]" />
              氛围头图
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const cfg = configs.header_banner || { imageUrl: '' };
              return (
                <ImageUploadField
                  label="氛围头图"
                  value={cfg.imageUrl}
                  onChange={(val) => updateConfig('header_banner', { ...cfg, imageUrl: val })}
                />
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* 规则弹窗 */}
      {isComponentEnabled('rule_popup') && (
        <Card className="border-[var(--color-meiyou-border)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Image className="h-4 w-4 text-[var(--color-meiyou-text-secondary)]" />
              规则弹窗
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              const cfg: RulePopupConfig = configs.rule_popup || { iconImage: '', ruleRichText: '' };
              return (
                <>
                  <ImageUploadField
                    label="规则Icon图片"
                    value={cfg.iconImage}
                    onChange={(val) => updateConfig('rule_popup', { ...cfg, iconImage: val })}
                  />
                  <div className="space-y-1.5">
                    <Label className="text-xs text-[var(--color-meiyou-text-secondary)]">规则文案</Label>
                    <RichTextEditor
                      value={cfg.ruleRichText}
                      onChange={(val) => updateConfig('rule_popup', { ...cfg, ruleRichText: val })}
                      placeholder="请输入活动规则文案，支持富文本编辑..."
                    />
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* 会员限时福利 */}
      {isComponentEnabled('flash_sale') && (
        <FlashSaleConfigCard
          config={configs.flash_sale || { moduleHeaderImage: '', moduleBgImage: '', products: [] }}
          onChange={(val) => updateConfig('flash_sale', val)}
        />
      )}

      {/* 会员专属礼 */}
      {isComponentEnabled('exclusive_gift') && (
        <BenefitConfigCard
          title="会员专属礼"
          config={configs.exclusive_gift || { products: [], moduleHeaderImage: '', moduleBgImage: '' }}
          onChange={(val) => updateConfig('exclusive_gift', val)}
        />
      )}

      {/* 会员专属0元购 */}
      {isComponentEnabled('free_purchase') && (
        <FreePurchaseConfigCard
          config={configs.free_purchase || { categoryIds: [], moduleHeaderImage: '', moduleBgImage: '' }}
          onChange={(val) => updateConfig('free_purchase', val)}
        />
      )}

      {/* 会员专属生活券包 */}
      {isComponentEnabled('free_benefit') && (
        <BenefitConfigCard
          title="会员专属生活券包"
          config={configs.free_benefit || { products: [], moduleHeaderImage: '', moduleBgImage: '' }}
          onChange={(val) => updateConfig('free_benefit', val)}
        />
      )}

      {/* 吸底按钮 */}
      {isComponentEnabled('cta_button') && (
        <Card className="border-[var(--color-meiyou-border)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <MousePointerClick className="h-4 w-4 text-[var(--color-meiyou-text-secondary)]" />
              吸底按钮
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              const cfg: ActionButtonConfig = configs.cta_button || {
                bookingPeriod: { buttonText: '', buttonColor: '', jumpLink: '' },
                claimPeriod: { buttonText: '', buttonColor: '', jumpLink: '' },
                endPeriod: { buttonText: '', buttonColor: '', jumpLink: '' },
              };
              const updatePeriod = (period: 'bookingPeriod' | 'claimPeriod' | 'endPeriod', field: keyof ActionButtonConfig['bookingPeriod'], value: string) => {
                updateConfig('cta_button', {
                  ...cfg,
                  [period]: { ...cfg[period], [field]: value },
                });
              };
              const periods: { key: 'bookingPeriod' | 'claimPeriod' | 'endPeriod'; label: string; desc: string }[] = [
                { key: 'bookingPeriod', label: '活动预约期', desc: '用户可预约时的按钮配置' },
                { key: 'claimPeriod', label: '活动领取期', desc: '用户可领取福利时的按钮配置' },
                { key: 'endPeriod', label: '活动结束期', desc: '活动结束后的按钮配置' },
              ];
              return (
                <div className="space-y-4">
                  {periods.map(({ key, label, desc }) => (
                    <div key={key} className="border border-[var(--color-meiyou-divider)] rounded-lg p-3 space-y-3">
                      <div>
                        <p className="text-xs font-medium text-[var(--color-meiyou-text-primary)]">{label}</p>
                        <p className="text-[10px] text-[var(--color-meiyou-text-placeholder)]">{desc}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-[11px] text-[var(--color-meiyou-text-secondary)]">按钮文案</Label>
                          <Input
                            placeholder="如：立即预约"
                            value={cfg[key].buttonText}
                            onChange={(e) => updatePeriod(key, 'buttonText', e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px] text-[var(--color-meiyou-text-secondary)]">按钮颜色</Label>
                          <div className="flex gap-2 items-center">
                            <input
                              type="color"
                              value={cfg[key].buttonColor || '#ff4d88'}
                              onChange={(e) => updatePeriod(key, 'buttonColor', e.target.value)}
                              className="h-8 w-8 rounded border border-[var(--color-meiyou-border)] cursor-pointer"
                            />
                            <Input
                              value={cfg[key].buttonColor || '#ff4d88'}
                              onChange={(e) => updatePeriod(key, 'buttonColor', e.target.value)}
                              className="h-8 text-xs flex-1"
                              placeholder="#ff4d88"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px] text-[var(--color-meiyou-text-secondary)]">跳转链接</Label>
                          <Input
                            placeholder="https://"
                            value={cfg[key].jumpLink}
                            onChange={(e) => updatePeriod(key, 'jumpLink', e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ==================== 全局配置卡片 ====================

const BACKGROUND_TYPE_OPTIONS = [
  { value: 'solid' as const, label: '纯色' },
  { value: 'gradient' as const, label: '渐变色' },
  { value: 'image' as const, label: '图片' },
];

const GRADIENT_DIRECTION_OPTIONS = [
  { value: 'to right', label: '从左到右 →' },
  { value: 'to bottom', label: '从上到下 ↓' },
  { value: 'to bottom right', label: '左上到右下 ↘' },
  { value: 'to bottom left', label: '右上到左下 ↙' },
];

/** 富文本编辑器组件（基于 react-quill） */
function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const Quill = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ReactQuill = require('react-quill-new');
    return ReactQuill.default || ReactQuill;
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link'],
        ['clean'],
      ],
    }),
    []
  );

  return (
    <div className="rich-text-editor-wrapper border border-[var(--color-meiyou-border)] rounded-lg overflow-hidden">
      <Quill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder}
      />
    </div>
  );
}

function GlobalConfigCard({
  config,
  onChange,
}: {
  config: GlobalConfig;
  onChange: (config: GlobalConfig) => void;
}) {
  const cfg = { ...defaultGlobalConfig, ...config };

  const updateField = <K extends keyof GlobalConfig>(key: K, value: GlobalConfig[K]) => {
    onChange({ ...cfg, [key]: value });
  };

  return (
    <Card className="border-[var(--color-meiyou-border)] shadow-meiyou-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-meiyou/10 flex items-center justify-center">
            <Settings2 className="h-4 w-4 text-meiyou" />
          </div>
          <CardTitle className="text-base font-medium">全局配置</CardTitle>
        </div>
        <CardDescription className="text-xs text-[var(--color-meiyou-text-secondary)]">
          配置活动页面的全局背景样式
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 背景类型选择 */}
        <div className="space-y-1.5">
          <Label className="text-xs text-[var(--color-meiyou-text-secondary)]">背景类型</Label>
          <div className="flex gap-2">
            {BACKGROUND_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateField('backgroundType', opt.value)}
                className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                  cfg.backgroundType === opt.value
                    ? 'bg-meiyou text-white border-meiyou'
                    : 'bg-white text-[var(--color-meiyou-text-secondary)] border-[var(--color-meiyou-border)] hover:border-meiyou/40'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 纯色配置 */}
        {cfg.backgroundType === 'solid' && (
          <div className="space-y-1.5">
            <Label className="text-xs text-[var(--color-meiyou-text-secondary)]">背景颜色</Label>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="color"
                  value={cfg.solidColor}
                  onChange={(e) => updateField('solidColor', e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border border-[var(--color-meiyou-border)] p-0.5"
                />
              </div>
              <Input
                value={cfg.solidColor}
                onChange={(e) => updateField('solidColor', e.target.value)}
                placeholder="#f2f2f5"
                className="w-32 h-8 text-xs"
              />
              {/* 预设颜色 */}
              <div className="flex gap-1.5 ml-2">
                {['#f2f2f5', '#fff5f7', '#fff0f5', '#ffffff', '#1a1a2e'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => updateField('solidColor', color)}
                    className={`w-7 h-7 rounded border-2 transition-transform hover:scale-110 ${
                      cfg.solidColor === color ? 'border-meiyou scale-110' : 'border-[var(--color-meiyou-border)]'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
            {/* 预览 */}
            <div className="mt-2 rounded-lg border border-[var(--color-meiyou-border)] overflow-hidden">
              <div className="h-16 flex items-center justify-center text-xs text-[var(--color-meiyou-text-placeholder)]" style={{ backgroundColor: cfg.solidColor }}>
                纯色背景预览
              </div>
            </div>
          </div>
        )}

        {/* 渐变色配置 */}
        {cfg.backgroundType === 'gradient' && (
          <div className="space-y-3">
            <div className="flex gap-4">
              {/* 起始颜色 */}
              <div className="space-y-1.5">
                <Label className="text-xs text-[var(--color-meiyou-text-secondary)]">起始颜色</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={cfg.gradientStart}
                    onChange={(e) => updateField('gradientStart', e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border border-[var(--color-meiyou-border)] p-0.5"
                  />
                  <Input
                    value={cfg.gradientStart}
                    onChange={(e) => updateField('gradientStart', e.target.value)}
                    className="w-24 h-7 text-xs"
                  />
                </div>
              </div>
              {/* 结束颜色 */}
              <div className="space-y-1.5">
                <Label className="text-xs text-[var(--color-meiyou-text-secondary)]">结束颜色</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={cfg.gradientEnd}
                    onChange={(e) => updateField('gradientEnd', e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border border-[var(--color-meiyou-border)] p-0.5"
                  />
                  <Input
                    value={cfg.gradientEnd}
                    onChange={(e) => updateField('gradientEnd', e.target.value)}
                    className="w-24 h-7 text-xs"
                  />
                </div>
              </div>
            </div>
            {/* 渐变方向 */}
            <div className="space-y-1.5">
              <Label className="text-xs text-[var(--color-meiyou-text-secondary)]">渐变方向</Label>
              <div className="flex gap-2">
                {GRADIENT_DIRECTION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateField('gradientDirection', opt.value)}
                    className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                      cfg.gradientDirection === opt.value
                        ? 'bg-meiyou text-white border-meiyou'
                        : 'bg-white text-[var(--color-meiyou-text-secondary)] border-[var(--color-meiyou-border)] hover:border-meiyou/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {/* 预设渐变 */}
            <div className="space-y-1.5">
              <Label className="text-xs text-[var(--color-meiyou-text-secondary)]">预设渐变</Label>
              <div className="flex gap-2">
                {[
                  { start: '#ff4d88', end: '#ff8fab', label: '品牌粉' },
                  { start: '#ff6b6b', end: '#ffa502', label: '暖橙' },
                  { start: '#a18cd1', end: '#fbc2eb', label: '淡紫' },
                  { start: '#667eea', end: '#764ba2', label: '深蓝紫' },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      updateField('gradientStart', preset.start);
                      updateField('gradientEnd', preset.end);
                    }}
                    className="w-16 h-8 rounded border border-[var(--color-meiyou-border)] transition-transform hover:scale-105"
                    style={{ background: `linear-gradient(to right, ${preset.start}, ${preset.end})` }}
                    title={preset.label}
                  />
                ))}
              </div>
            </div>
            {/* 预览 */}
            <div className="mt-1 rounded-lg border border-[var(--color-meiyou-border)] overflow-hidden">
              <div
                className="h-16 flex items-center justify-center text-xs text-white/80"
                style={{ background: `linear-gradient(${cfg.gradientDirection}, ${cfg.gradientStart}, ${cfg.gradientEnd})` }}
              >
                渐变背景预览
              </div>
            </div>
          </div>
        )}

        {/* 图片背景配置 */}
        {cfg.backgroundType === 'image' && (
          <div className="space-y-3">
            <ImageUploadField
              label="背景图片"
              value={cfg.backgroundImage}
              onChange={(val) => updateField('backgroundImage', val)}
            />
            {cfg.backgroundImage && (
              <div className="rounded-lg border border-[var(--color-meiyou-border)] overflow-hidden">
                <div
                  className="h-20 flex items-center justify-center text-xs text-white/80 bg-cover bg-center"
                  style={{ backgroundImage: `url(${cfg.backgroundImage})` }}
                >
                  图片背景预览
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ==================== 会员限时福利配置卡片 ====================

function FlashSaleConfigCard({
  config,
  onChange,
}: {
  config: FlashSaleConfig;
  onChange: (config: FlashSaleConfig) => void;
}) {
  const addProduct = () => {
    const newProduct: FlashSaleProduct = {
      id: `fsp_${Date.now()}`,
      productId: '',
      stock: '',
      rushImage: '',
      benefitImage: '',
      popupImage: '',
      jumpLink: '',
      pushText: '',
      timeSessions: [{ id: `ts_${Date.now()}`, bookingStartTime: '', bookingEndTime: '', rushStartTime: '', rushEndTime: '' }],
      audienceRules: [],
    };
    onChange({ ...config, products: [...config.products, newProduct] });
  };

  const removeProduct = (productId: string) => {
    onChange({ ...config, products: config.products.filter((p) => p.id !== productId) });
  };

  const updateProduct = (productId: string, updates: Partial<FlashSaleProduct>) => {
    onChange({
      ...config,
      products: config.products.map((p) => (p.id === productId ? { ...p, ...updates } : p)),
    });
  };

  return (
    <Card className="border-[var(--color-meiyou-border)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Image className="h-4 w-4 text-[var(--color-meiyou-text-secondary)]" />
          会员限时福利
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 模块图片 */}
        <div className="grid grid-cols-2 gap-4">
          <ImageUploadField
            label="模块头图"
            value={config.moduleHeaderImage}
            onChange={(val) => onChange({ ...config, moduleHeaderImage: val })}
          />
          <ImageUploadField
            label="模块背景图"
            value={config.moduleBgImage}
            onChange={(val) => onChange({ ...config, moduleBgImage: val })}
          />
        </div>

        <Separator />

        {/* 福利商品列表 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[var(--color-meiyou-text-primary)]">
              福利商品
              <span className="text-xs text-[var(--color-meiyou-text-placeholder)] ml-1">({config.products.length}个)</span>
            </span>
            <Button size="sm" className="bg-meiyou hover:bg-meiyou-hover text-white" onClick={addProduct}>
              <Plus className="h-3 w-3 mr-1" />
              添加商品
            </Button>
          </div>

          {config.products.length === 0 && (
            <div className="text-center py-6 text-[var(--color-meiyou-text-placeholder)] text-sm border rounded-lg border-dashed border-[var(--color-meiyou-divider)]">
              暂无商品，点击"添加商品"开始配置
            </div>
          )}

          <div className="space-y-4">
            {config.products.map((product, idx) => (
              <Card key={product.id} className="border-[var(--color-meiyou-border)] bg-meiyou-bg/50">
                <CardHeader className="py-3 px-4 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--color-meiyou-text-primary)]">商品 {idx + 1}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-[var(--color-meiyou-text-placeholder)] hover:text-red-500 h-7 w-7 p-0"
                      onClick={() => removeProduct(product.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-4">
                  {/* 商品基础信息 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-[var(--color-meiyou-text-secondary)]">商品ID <span className="text-meiyou">*</span></Label>
                      <Input
                        className="mt-1 h-8 text-sm"
                        placeholder="输入商品ID"
                        value={product.productId}
                        onChange={(e) => updateProduct(product.id, { productId: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-[var(--color-meiyou-text-secondary)]">库存 <span className="text-meiyou">*</span></Label>
                      <Input
                        className="mt-1 h-8 text-sm"
                        placeholder="输入库存数量"
                        value={product.stock}
                        onChange={(e) => updateProduct(product.id, { stock: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* 商品图片 */}
                  <div className="grid grid-cols-3 gap-3">
                    <ImageUploadField
                      label="抢购图片"
                      value={product.rushImage}
                      onChange={(val) => updateProduct(product.id, { rushImage: val })}
                    />
                    <ImageUploadField
                      label="权益图片"
                      value={product.benefitImage}
                      onChange={(val) => updateProduct(product.id, { benefitImage: val })}
                    />
                    <ImageUploadField
                      label="弹窗图片"
                      value={product.popupImage}
                      onChange={(val) => updateProduct(product.id, { popupImage: val })}
                    />
                  </div>

                  {/* 链接与文案 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-[var(--color-meiyou-text-secondary)]">跳转链接</Label>
                      <Input
                        className="mt-1 h-8 text-sm"
                        placeholder="输入跳转链接URL"
                        value={product.jumpLink}
                        onChange={(e) => updateProduct(product.id, { jumpLink: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-[var(--color-meiyou-text-secondary)]">推送文案</Label>
                      <Input
                        className="mt-1 h-8 text-sm"
                        placeholder="输入推送文案"
                        value={product.pushText}
                        onChange={(e) => updateProduct(product.id, { pushText: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* 场次配置 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-[var(--color-meiyou-text-secondary)]">场次配置</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => {
                          const newSession = { id: `ts_${Date.now()}`, bookingStartTime: '', bookingEndTime: '', rushStartTime: '', rushEndTime: '' };
                          updateProduct(product.id, { timeSessions: [...product.timeSessions, newSession] });
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" /> 添加场次
                      </Button>
                    </div>
                    {(product.timeSessions || []).map((session, sessionIdx) => (
                      <div key={session.id} className="bg-meiyou-bg/80 rounded-lg p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-[var(--color-meiyou-text-placeholder)]">第 {sessionIdx + 1} 场</span>
                          {(product.timeSessions || []).length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-5 text-xs text-meiyou hover:text-meiyou-hover"
                              onClick={() => {
                                updateProduct(product.id, { timeSessions: product.timeSessions.filter((s) => s.id !== session.id) });
                              }}
                            >
                              <Trash2 className="h-3 w-3 mr-1" /> 删除场次
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs text-[var(--color-meiyou-text-secondary)]">预约时间</Label>
                            <TimeRangeField
                              startValue={session.bookingStartTime}
                              endValue={session.bookingEndTime}
                              onStartChange={(val) => {
                                const updated = product.timeSessions.map((s) => s.id === session.id ? { ...s, bookingStartTime: val } : s);
                                updateProduct(product.id, { timeSessions: updated });
                              }}
                              onEndChange={(val) => {
                                const updated = product.timeSessions.map((s) => s.id === session.id ? { ...s, bookingEndTime: val } : s);
                                updateProduct(product.id, { timeSessions: updated });
                              }}
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-[var(--color-meiyou-text-secondary)]">抢购时间</Label>
                            <TimeRangeField
                              startValue={session.rushStartTime}
                              endValue={session.rushEndTime}
                              onStartChange={(val) => {
                                const updated = product.timeSessions.map((s) => s.id === session.id ? { ...s, rushStartTime: val } : s);
                                updateProduct(product.id, { timeSessions: updated });
                              }}
                              onEndChange={(val) => {
                                const updated = product.timeSessions.map((s) => s.id === session.id ? { ...s, rushEndTime: val } : s);
                                updateProduct(product.id, { timeSessions: updated });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 受众规则 */}
                  <Separator />
                  <AudienceRuleEditor
                    rules={product.audienceRules}
                    onRulesChange={(rules) => updateProduct(product.id, { audienceRules: rules })}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== 会员专属生活券包/会员专属礼配置卡片 ====================

function FreePurchaseConfigCard({
  config,
  onChange,
}: {
  config: FreePurchaseConfig;
  onChange: (config: FreePurchaseConfig) => void;
}) {
  const addCategoryId = () => {
    onChange({ ...config, categoryIds: [...config.categoryIds, ''] });
  };

  const updateCategoryId = (index: number, value: string) => {
    const newIds = [...config.categoryIds];
    newIds[index] = value;
    onChange({ ...config, categoryIds: newIds });
  };

  const removeCategoryId = (index: number) => {
    onChange({ ...config, categoryIds: config.categoryIds.filter((_, i) => i !== index) });
  };

  const moveCategoryId = (index: number, direction: 'up' | 'down') => {
    const newIds = [...config.categoryIds];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newIds.length) return;
    [newIds[index], newIds[targetIndex]] = [newIds[targetIndex], newIds[index]];
    onChange({ ...config, categoryIds: newIds });
  };

  return (
    <Card className="border-[var(--color-meiyou-border)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Tag className="h-4 w-4 text-[var(--color-meiyou-text-secondary)]" />
          会员专属0元购
          <span className="text-xs text-[var(--color-meiyou-text-placeholder)] font-normal">下单全额返现金</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <ImageUploadField
              label="模块头图"
              value={config.moduleHeaderImage}
              onChange={(v) => onChange({ ...config, moduleHeaderImage: v })}
            />
          <ImageUploadField
              label="模块背景图"
              value={config.moduleBgImage}
              onChange={(v) => onChange({ ...config, moduleBgImage: v })}
            />
        </div>
        <div className="flex items-center justify-between">
          <Label className="text-xs text-[var(--color-meiyou-text-secondary)]">返现类目ID</Label>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={addCategoryId}>
            <Plus className="h-3 w-3 mr-1" />
            添加类目
          </Button>
        </div>
        {config.categoryIds.length === 0 ? (
          <div className="text-center py-6 text-[var(--color-meiyou-text-placeholder)] text-xs">暂无类目ID，请点击添加</div>
        ) : (
          <div className="space-y-2">
            {config.categoryIds.map((catId, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-xs text-[var(--color-meiyou-text-placeholder)] w-6 text-right shrink-0">{index + 1}.</span>
                <Input
                  className="h-8 text-sm flex-1"
                  placeholder="输入类目ID"
                  value={catId}
                  onChange={(e) => updateCategoryId(index, e.target.value)}
                />
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={index === 0}
                    onClick={() => moveCategoryId(index, 'up')}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={index === config.categoryIds.length - 1}
                    onClick={() => moveCategoryId(index, 'down')}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-meiyou hover:text-meiyou-hover"
                    onClick={() => removeCategoryId(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BenefitConfigCard({
  title,
  config,
  onChange,
}: {
  title: string;
  config: BenefitConfig;
  onChange: (config: BenefitConfig) => void;
}) {
  const addProduct = () => {
    const newProduct: BenefitProduct = {
      id: `bp_${Date.now()}`,
      productId: '',
      benefitImage: '',
      displayMode: 'horizontal',
      sortOrder: config.products.length + 1,
      audienceRules: [],
    };
    onChange({ ...config, products: [...config.products, newProduct] });
  };

  const removeProduct = (productId: string) => {
    onChange({ ...config, products: config.products.filter((p) => p.id !== productId) });
  };

  const updateProduct = (productId: string, updates: Partial<BenefitProduct>) => {
    onChange({
      ...config,
      products: config.products.map((p) => (p.id === productId ? { ...p, ...updates } : p)),
    });
  };

  const moveProduct = (productId: string, direction: 'up' | 'down') => {
    const idx = config.products.findIndex((p) => p.id === productId);
    if (idx < 0) return;
    const newProducts = [...config.products];
    if (direction === 'up' && idx > 0) {
      [newProducts[idx - 1], newProducts[idx]] = [newProducts[idx], newProducts[idx - 1]];
    } else if (direction === 'down' && idx < newProducts.length - 1) {
      [newProducts[idx], newProducts[idx + 1]] = [newProducts[idx + 1], newProducts[idx]];
    }
    // 更新排序号
    onChange({
      ...config,
      products: newProducts.map((p, i) => ({ ...p, sortOrder: i + 1 })),
    });
  };

  return (
    <Card className="border-[var(--color-meiyou-border)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Image className="h-4 w-4 text-[var(--color-meiyou-text-secondary)]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <ImageUploadField
              label="模块头图"
              value={config.moduleHeaderImage}
              onChange={(v) => onChange({ ...config, moduleHeaderImage: v })}
            />
          <ImageUploadField
              label="模块背景图"
              value={config.moduleBgImage}
              onChange={(v) => onChange({ ...config, moduleBgImage: v })}
            />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--color-meiyou-text-secondary)]">
            商品列表
            <span className="text-xs text-[var(--color-meiyou-text-placeholder)] ml-1">({config.products.length}个)</span>
          </span>
          <Button size="sm" className="bg-meiyou hover:bg-meiyou-hover text-white" onClick={addProduct}>
            <Plus className="h-3 w-3 mr-1" />
            添加商品
          </Button>
        </div>

        {config.products.length === 0 && (
          <div className="text-center py-6 text-[var(--color-meiyou-text-placeholder)] text-sm border rounded-lg border-dashed border-[var(--color-meiyou-divider)]">
            暂无商品，点击"添加商品"开始配置
          </div>
        )}

        <div className="space-y-3">
          {config.products.map((product, idx) => (
            <div
              key={product.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-[var(--color-meiyou-border)] bg-white"
            >
              {/* 排序控制 */}
              <div className="flex flex-col gap-0.5 pt-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-5 w-5 p-0"
                  disabled={idx === 0}
                  onClick={() => moveProduct(product.id, 'up')}
                >
                  <ChevronLeft className="h-3 w-3 rotate-90" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-5 w-5 p-0"
                  disabled={idx === config.products.length - 1}
                  onClick={() => moveProduct(product.id, 'down')}
                >
                  <ChevronLeft className="h-3 w-3 -rotate-90" />
                </Button>
              </div>

              {/* 商品字段 */}
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs text-[var(--color-meiyou-text-secondary)]">商品ID <span className="text-meiyou">*</span></Label>
                    <Input
                      className="mt-1 h-8 text-sm"
                      placeholder="输入商品ID"
                      value={product.productId}
                      onChange={(e) => updateProduct(product.id, { productId: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-[var(--color-meiyou-text-secondary)]">福利图片</Label>
                    <Input
                      className="mt-1 h-8 text-sm"
                      placeholder="输入图片URL"
                      value={product.benefitImage}
                      onChange={(e) => updateProduct(product.id, { benefitImage: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-[var(--color-meiyou-text-secondary)]">展示方式</Label>
                    <Select
                      value={product.displayMode}
                      onValueChange={(val) =>
                        updateProduct(product.id, { displayMode: val as 'horizontal' | 'double-column' })
                      }
                    >
                      <SelectTrigger className="mt-1 h-8 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="horizontal">横图</SelectItem>
                        <SelectItem value="double-column">双列</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-[var(--color-meiyou-text-secondary)]">排序</Label>
                    <Input
                      className="mt-1 h-8 text-sm"
                      type="number"
                      value={product.sortOrder}
                      onChange={(e) => updateProduct(product.id, { sortOrder: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                {/* 受众规则 */}
                <div className="pl-0">
                  <AudienceRuleEditor
                    rules={product.audienceRules}
                    onRulesChange={(rules) => updateProduct(product.id, { audienceRules: rules })}
                  />
                </div>
              </div>

              {/* 删除按钮 */}
              <Button
                size="sm"
                variant="ghost"
                className="text-[var(--color-meiyou-text-placeholder)] hover:text-red-500 h-7 w-7 p-0 mt-1"
                onClick={() => removeProduct(product.id)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
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
      const timeConfig = (typeof rawTimeConfig === 'string' ? JSON.parse(rawTimeConfig as string) : rawTimeConfig) as Record<string, string>;
      const rawComponents = raw.components
        ? (typeof raw.components === 'string' ? JSON.parse(raw.components as string) : raw.components)
        : [];
      let components: TemplateComponent[] = [];
      if (Array.isArray(rawComponents)) {
        components = rawComponents.map((c: TemplateComponent) => ({ ...c }));
      } else if (typeof rawComponents === 'object') {
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

        sellStartTime: timeConfig.sellStartTime || '',
        sellEndTime: timeConfig.sellEndTime || '',
        lotteryStartTime: timeConfig.lotteryStartTime || '',
        lotteryEndTime: timeConfig.lotteryEndTime || '',
        bufferEndTime: timeConfig.bufferEndTime || '',
        refundCutoffTime: timeConfig.refundCutoffTime || '',
        components,
      };
    }
    const defaultTemplate = mockTemplates.find((t) => t.id === 'tpl_002');
    return {
      templateId: 'tpl_002',
      category: '',
      name: '',
      components: defaultTemplate ? defaultTemplate.components.map((c) => ({ ...c })) : [],

      sellStartTime: '',
      sellEndTime: '',
      lotteryStartTime: '',
      lotteryEndTime: '',
      bufferEndTime: '',
      refundCutoffTime: '',
    };
  });

  const [step2Data, setStep2Data] = useState<Step2Data>(() => {
    if (initialData) {
      const raw = initialData as unknown as Record<string, unknown>;
      const rawConfigs = raw.component_configs || raw.componentConfigs || {};
      const parsed = (typeof rawConfigs === 'string' ? JSON.parse(rawConfigs as string) : rawConfigs) as ComponentConfigs;
      // Deep clone to avoid mutating props, and migrate old flash_sale products
      const componentConfigs: ComponentConfigs = JSON.parse(JSON.stringify(parsed));
      const fsConfig = componentConfigs.flash_sale;
      if (fsConfig && Array.isArray(fsConfig.products)) {
        fsConfig.products = fsConfig.products.map((p: FlashSaleProduct) => {
          if (!p.timeSessions || p.timeSessions.length === 0) {
            return {
              ...p,
              timeSessions: [{
                id: `ts_${Date.now()}_${String(p.id).slice(-4)}`,
                bookingStartTime: (p as unknown as Record<string, string>).bookingStartTime || '',
                bookingEndTime: (p as unknown as Record<string, string>).bookingEndTime || '',
                rushStartTime: (p as unknown as Record<string, string>).rushStartTime || '',
                rushEndTime: (p as unknown as Record<string, string>).rushEndTime || '',
              }],
            };
          }
          return p;
        });
      }
      return { componentConfigs };
    }
    return { componentConfigs: {} };
  });

  const canProceed = () => {
    if (currentStep === 1) {
      return (
        step1Data.templateId !== '' &&
        step1Data.name !== '' &&
        step1Data.category !== '' &&
        step1Data.sellStartTime !== '' &&
        step1Data.bufferEndTime !== ''
      );
    }
    return true;
  };

  const handlePublish = async () => {
    const payload = {
      name: step1Data.name,
      category: step1Data.category,
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
      audience_groups: [],
      lottery_config: { enabled: false, poolId: '', poolName: '' },
      material_config: {},
      components: Object.fromEntries(
        step1Data.components.filter((c) => !c.required).map((c) => [c.key, c.enabled])
      ),
      component_configs: step2Data.componentConfigs,
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
          <h1 className="text-2xl font-semibold text-[var(--color-meiyou-text-primary)]">
            {isEdit ? '编辑活动' : '新建活动'}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-meiyou-text-secondary)]">
            {isEdit
              ? '修改活动配置信息'
              : '选定模板与基础信息 → 填充组件素材，两步完成活动配置'}
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
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                        ? 'bg-meiyou text-white'
                        : 'bg-meiyou-bg text-[var(--color-meiyou-text-secondary)]'
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : step.num}
                </div>
                <div className="flex items-center gap-1.5">
                  <StepIcon className={`h-4 w-4 ${isCurrent ? 'text-meiyou' : isCompleted ? 'text-emerald-500' : 'text-[var(--color-meiyou-text-placeholder)]'}`} />
                  <span className={`text-sm ${isCurrent ? 'text-[var(--color-meiyou-text-primary)] font-medium' : isCompleted ? 'text-emerald-600' : 'text-[var(--color-meiyou-text-placeholder)]'}`}>
                    {step.label}
                  </span>
                </div>
              </div>
              {index < stepConfig.length - 1 && (
                <div className={`w-16 h-0.5 mx-3 ${isCompleted ? 'bg-emerald-500' : 'bg-meiyou-bg'}`} />
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
            <StepComponentConfig
              data={step2Data}
              onChange={setStep2Data}
              components={step1Data.components}
            />
          )}
        </CardContent>
      </Card>

      {/* 底部操作栏 */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          className="border-[var(--color-meiyou-divider)]"
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
          <Button variant="outline" className="border-[var(--color-meiyou-divider)]">
            保存草稿
          </Button>
          {currentStep < 2 ? (
            <Button
              className="bg-meiyou hover:bg-meiyou-hover text-white"
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
