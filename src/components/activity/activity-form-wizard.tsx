'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { GripVertical, Plus, ArrowUpToLine, ArrowDownToLine } from 'lucide-react';
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
  X,
  Image as ImageIcon,
  Upload,
  Trash2,
  Users,
  Tag,
  ChevronUp,
  ChevronDown,
  MousePointerClick,
  Search,
  Lock,
  Copy,
  Info,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TimeRangeField, SingleTimeField } from '@/components/activity/time-range-field';
import type {
  Template,
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
  CategoryPathItem,
  ActionButtonConfig,
  StatusButtonConfig,
  RulePopupConfig,
  ComponentAudienceRule,
} from '@/lib/types';
import { mapTemplateFromDb } from '@/lib/types';

// ==================== Step Data Types ====================

interface Step1Data {
  templateId: string;
  category: string;
  name: string;
  activityStartTime: string;
  activityEndTime: string;
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
  '促活': 'bg-pink-50/80 text-pink-700 border-pink-200/60',
  '转化': 'bg-amber-50/80 text-amber-700 border-amber-200/60',
  '拉新': 'bg-blue-50/80 text-blue-700 border-blue-200/60',
};
const defaultCategoryColor = 'bg-meiyou-bg text-[var(--color-meiyou-text-secondary)] border-[var(--color-meiyou-border)]';

const defaultCategories = ['促活', '转化', '拉新'];

const stepConfig = [
  { num: 1, label: '配置基础信息与活动组件', icon: Puzzle },
  { num: 2, label: '填充组件素材', icon: Settings2 },
];

function getCategoryColor(category: string) {
  return categoryColorMap[category] || defaultCategoryColor;
}

// 将 ISO 日期字符串转换为 datetime-local 输入框所需的格式 (YYYY-MM-DDTHH:mm)
function toDatetimeLocalValue(val: string | undefined | null): string {
  if (!val) return '';
  // 去掉秒和时区后缀，如 "2025-05-15T00:00:00Z" → "2025-05-15T00:00"
  const m = val.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  return m ? `${m[1]}T${m[2]}` : val.slice(0, 16);
}

// ==================== 用户条件字段选项 ====================

const ruleFieldOptions = [
  { value: 'member_status', label: '会员状态' },
  { value: 'identity', label: '身份模式' },
  { value: 'subscribe_count', label: '订阅次数' },
  { value: 'register_days', label: '注册天数' },
];

const ruleValueOptions: Record<string, { value: string; label: string }[]> = {
  member_status: [
    { value: 'non_member', label: '非会员' },
    { value: 'ended', label: '已结束' },
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
  nonMemberButton: { text: '立即开通', color: '#ff4d88', jumpLink: '' },
  memberButton: { text: '立即领取', color: '#ff4d88', jumpLink: '' },
  memberReservedButton: { text: '已预约，立即领取', color: '#ff4d88', jumpLink: '' },
  memberUnreservedButton: { text: '立即预约', color: '#ff4d88', jumpLink: '' },
  bookingPushText: '',
};

// ==================== 图片上传占位组件 ====================

function ImageUploadField({
  label,
  value,
  onChange,
  required = true,
  hint,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1">
        {required ? (
          <ReqLabel>{label}</ReqLabel>
        ) : (
          <Label className="text-xs text-[var(--color-meiyou-text-secondary)]">{label}</Label>
        )}
        {hint && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 text-[var(--color-meiyou-text-placeholder)] cursor-help shrink-0" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[280px] text-xs leading-relaxed">
              {hint}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
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

// ==================== 视频上传组件 ====================

function VideoUploadField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1">
        <Label className="text-sm text-[var(--color-meiyou-text-secondary)]">{label}</Label>
        {hint && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 text-[var(--color-meiyou-text-placeholder)] cursor-help shrink-0" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[280px] text-xs leading-relaxed">
              {hint}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      {value ? (
        <div className="relative group w-40 h-24 rounded border border-[var(--color-meiyou-border)] overflow-hidden bg-meiyou-bg">
          <video src={value} className="w-full h-full object-cover" muted />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              className="h-6 px-2 text-[10px]"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'video/mp4';
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
            input.accept = 'video/mp4';
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0];
              if (file) {
                const url = URL.createObjectURL(file);
                onChange(url);
              }
            };
            input.click();
          }}
          className="w-40 h-24 rounded border-2 border-dashed border-[var(--color-meiyou-border)] hover:border-meiyou/50 hover:bg-meiyou-light transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer"
        >
          <Upload className="h-4 w-4 text-[var(--color-meiyou-text-placeholder)]" />
          <span className="text-[10px] text-[var(--color-meiyou-text-placeholder)]">上传MP4视频</span>
        </button>
      )}
    </div>
  );
}

// ==================== 用户条件编辑组件 ====================

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
          用户条件
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
  hideComponentsSection,
  templates,
}: {
  data: Step1Data;
  onChange: (data: Step1Data) => void;
  isEdit: boolean;
  hideComponentsSection?: boolean;
  templates: Template[];
}) {
  const selectedTemplate = templates.find((t) => t.id === data.templateId);
  const isMemberDay = selectedTemplate?.category === '会员日';
  // 活动分类已改为 促活/转化/拉新，模板分类仍保留原值

  const [allCategories, setAllCategories] = useState<string[]>(defaultCategories);
  const [categoryInput, setCategoryInput] = useState(data.category);
  const [categoryOpen, setCategoryOpen] = useState(false);

  // 同步外部 category 变更（编辑模式初始化）
  useEffect(() => {
    if (data.category !== categoryInput && !categoryOpen) {
      setCategoryInput(data.category);
    }
  }, [data.category]);

  // 加载已有活动的分类到列表中
  useEffect(() => {
    if (data.category && !allCategories.includes(data.category) && !defaultCategories.includes(data.category)) {
      setAllCategories((prev) => [...prev, data.category]);
    }
  }, [data.category]);

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    onChange({
      ...data,
      templateId,
      category: template?.category || '',
      components: template ? template.components.map((c) => ({ ...c })) : [],
    });
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
      {/* 活动名称 */}
      <div>
        <ReqLabel className="text-sm font-medium text-[var(--color-meiyou-text-primary)]">活动名称</ReqLabel>
        <Input
          className="mt-1.5"
          placeholder="请输入活动名称"
          value={data.name}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
        />
      </div>
      {/* 活动分类 独占一行 */}
      <div>
          <ReqLabel className="text-sm font-medium text-[var(--color-meiyou-text-primary)]">活动分类</ReqLabel>
          <div className="mt-1.5 relative">
            <Input
              value={categoryInput}
              onChange={(e) => {
                const val = e.target.value;
                setCategoryInput(val);
                onChange({ ...data, category: val });
                setCategoryOpen(true);
              }}
              onFocus={() => setCategoryOpen(true)}
              onBlur={() => {
                // 延迟关闭以允许点击下拉选项
                setTimeout(() => setCategoryOpen(false), 200);
              }}
              placeholder="输入或选择分类"
              className="w-full h-9 rounded-lg bg-white border-[var(--color-meiyou-border)] text-sm pr-8"
            />
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-meiyou-text-placeholder)] pointer-events-none" />
            {categoryOpen && allCategories.filter((cat) =>
              !categoryInput || cat.includes(categoryInput)
            ).length > 0 && (
              <div className="absolute z-50 mt-1 w-full bg-white rounded-lg border border-[var(--color-meiyou-border)] shadow-md py-1 max-h-48 overflow-y-auto">
                {allCategories
                  .filter((cat) => !categoryInput || cat.includes(categoryInput))
                  .map((cat) => (
                    <div
                      key={cat}
                      className={`px-3 py-1.5 text-sm cursor-pointer hover:bg-meiyou-bg/60 flex items-center ${
                        data.category === cat ? 'text-meiyou font-medium bg-meiyou-bg/30' : 'text-[var(--color-meiyou-text-primary)]'
                      }`}
                      onMouseDown={(e) => {
                        e.preventDefault(); // 阻止 blur 触发
                        setCategoryInput(cat);
                        onChange({ ...data, category: cat });
                        setCategoryOpen(false);
                      }}
                    >
                      <Check className={`mr-2 h-3.5 w-3.5 ${data.category === cat ? 'opacity-100' : 'opacity-0'}`} />
                      {cat}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

      {/* 选择模板 */}
      <div>
        <ReqLabel className="text-sm font-medium text-[var(--color-meiyou-text-primary)]">
          选择活动模版
        </ReqLabel>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {templates
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
            <ReqLabel>活动时间</ReqLabel>
            <TimeRangeField
              startValue={data.activityStartTime}
              endValue={data.activityEndTime}
              onStartChange={(val) => onChange({ ...data, activityStartTime: val })}
              onEndChange={(val) => onChange({ ...data, activityEndTime: val })}
            />
          </div>
          {/* 活动预约时间（非必填） */}
          <div>
            <Label className="text-sm font-medium text-foreground/80">{isMemberDay ? '活动预约时间' : '售卖时间'}</Label>
            <TimeRangeField
              startValue={data.sellStartTime}
              endValue={data.sellEndTime}
              onStartChange={(val) => {
                if (val && data.activityStartTime && val < data.activityStartTime) return;
                onChange({ ...data, sellStartTime: val });
              }}
              onEndChange={(val) => {
                if (val && data.activityEndTime && val > data.activityEndTime) return;
                onChange({ ...data, sellEndTime: val });
              }}
            />
          </div>
          {/* 活动福利领取时间（必填）独占一行 */}
          <div>
              <ReqLabel>
                {isMemberDay ? '活动福利领取时间' : '抽奖时间'}
              </ReqLabel>
              <TimeRangeField
                startValue={data.lotteryStartTime}
                endValue={data.lotteryEndTime}
                onStartChange={(val) => {
                  if (val && data.sellStartTime && val < data.sellStartTime) return;
                  if (val && data.bufferEndTime && val > data.bufferEndTime) return;
                  onChange({ ...data, lotteryStartTime: val });
                }}
                onEndChange={(val) => {
                  if (val && data.bufferEndTime && val > data.bufferEndTime) return;
                  onChange({ ...data, lotteryEndTime: val });
                }}
              />
            </div>
          {!isMemberDay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <ReqLabel>退款熔断截单时间</ReqLabel>
                <SingleTimeField
                  value={data.refundCutoffTime}
                  onChange={(val) => onChange({ ...data, refundCutoffTime: val })}
                />
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  );
}

// ==================== 可拖拽排序组件项 ====================

function SortableComponentItem({
  id,
  sectionId,
  comp,
  children,
  onRemove,
  isCopied,
  onNameChange,
  collapsed,
  onToggleCollapsed,
}: {
  id: string;
  sectionId: string;
  comp: TemplateComponent;
  children: React.ReactNode;
  onRemove?: () => void;
  isCopied?: boolean;
  onNameChange?: (name: string) => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto' as never,
  };

  const isCollapsed = collapsed ?? false;

  return (
    <div ref={setNodeRef} style={style} id={sectionId} className="scroll-mt-4">
      <Card className="border-[var(--color-meiyou-border)]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* 拖拽手柄 */}
              {!comp.required ? (
                <button
                  type="button"
                  className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                  {...attributes}
                  {...listeners}
                >
                  <GripVertical className="h-4 w-4" />
                </button>
              ) : (
                <div className="p-0.5 text-gray-300">
                  <Lock className="h-4 w-4" />
                </div>
              )}
              <CardTitle className="text-sm flex items-center gap-2">
                {isCopied ? (
                  <input
                    type="text"
                    value={comp.name}
                    onChange={(e) => onNameChange?.(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-transparent border-b border-transparent hover:border-gray-300 focus:border-[var(--color-meiyou)] focus:outline-none text-sm text-[var(--color-meiyou-text-primary)] py-0 transition-colors"
                  />
                ) : (
                  comp.name
                )}
              </CardTitle>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                comp.required
                  ? 'bg-[var(--color-meiyou)]/10 text-[var(--color-meiyou)]'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {comp.required ? '必选' : '非必选'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {/* 折叠/展开 */}
              <button
                type="button"
                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                onClick={() => onToggleCollapsed?.()}
              >
                {isCollapsed
                  ? <ChevronDown className="h-4 w-4" />
                  : <ChevronUp className="h-4 w-4" />
                }
              </button>
              {/* 删除按钮（非必选组件才显示） */}
              {!comp.required && onRemove && (
                <button
                  type="button"
                  className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                  onClick={onRemove}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </CardHeader>
        {!isCollapsed && <CardContent>{children}</CardContent>}
      </Card>
    </div>
  );
}

// ==================== 组件配置区域（单页面，支持添加+拖拽排序） ====================

function StepComponentConfig({
  data,
  onChange,
  components,
  onComponentsChange,
  hasReservationTime = false,
}: {
  data: Step2Data;
  onChange: (data: Step2Data) => void;
  components: TemplateComponent[];
  onComponentsChange: (components: TemplateComponent[]) => void;
  hasReservationTime?: boolean;
}) {
  const configs = data.componentConfigs;
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [pendingAddKeys, setPendingAddKeys] = useState<Set<string>>(new Set());
  const [addMenuPosition, setAddMenuPosition] = useState({ x: 0, y: 0, left: 0 });
  const [collapsedKeys, setCollapsedKeys] = useState<Set<string>>(new Set());
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const updateConfig = (key: string, value: unknown) => {
    onChange({
      ...data,
      componentConfigs: { ...configs, [key]: value },
    });
  };

  // 已添加的组件（enabled 的）
  const enabledComponents = components.filter((c) => c.enabled);
  // 可添加的组件（非必选且未启用的）
  const availableComponents = components.filter((c) => !c.required && !c.enabled);

  // 添加组件（单个）
  const handleAddComponent = (comp: TemplateComponent) => {
    const updated = components.map((c) =>
      c.key === comp.key ? { ...c, enabled: true } : c
    );
    onComponentsChange(updated);
  };

  // 批量添加组件
  const handleBatchAddComponents = () => {
    if (pendingAddKeys.size === 0) return;
    const updated = components.map((c) =>
      pendingAddKeys.has(c.key) ? { ...c, enabled: true } : c
    );
    onComponentsChange(updated);
    setPendingAddKeys(new Set());
    setAddMenuOpen(false);
  };

  // 切换待添加选中态
  const togglePendingAdd = (key: string) => {
    setPendingAddKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // 移除组件
  const handleRemoveComponent = (compKey: string) => {
    const updated = components.map((c) =>
      c.key === compKey ? { ...c, enabled: false } : c
    );
    onComponentsChange(updated);
    // 同时清理该组件的配置
    const newConfigs = { ...configs };
    delete newConfigs[compKey];
    onChange({ ...data, componentConfigs: newConfigs });
  };

  // 支持复制的组件类型
  const COPYABLE_BASES = ['exclusive_gift', 'free_benefit'];
  const isCopyable = (key: string) => COPYABLE_BASES.some((base) => key === base || key.startsWith(base + '_'));
  const isCopiedComp = (key: string) => COPYABLE_BASES.some((base) => key.startsWith(base + '_'));
  const getBaseKey = (key: string) => {
    for (const base of COPYABLE_BASES) {
      if (key === base || key.startsWith(base + '_')) return base;
    }
    return key;
  };

  // 修改复制组件的名称
  const handleCompNameChange = (compKey: string, newName: string) => {
    const updated = components.map((c) =>
      c.key === compKey ? { ...c, name: newName } : c
    );
    onComponentsChange(updated);
  };

  // 复制组件（弹出命名输入）
  const [copyingCompKey, setCopyingCompKey] = useState<string | null>(null);
  const [copyCompName, setCopyCompName] = useState('');

  const handleStartCopy = (compKey: string) => {
    const baseKey = getBaseKey(compKey);
    const sourceName = components.find((c) => c.key === compKey)?.name || '';
    setCopyCompName(sourceName + '(副本)');
    setCopyingCompKey(compKey);
  };

  const handleConfirmCopy = () => {
    if (!copyingCompKey || !copyCompName.trim()) return;
    const baseKey = getBaseKey(copyingCompKey);
    // 找到一个不重复的新 key
    let idx = 1;
    let newKey = `${baseKey}_${idx}`;
    while (components.some((c) => c.key === newKey)) {
      idx++;
      newKey = `${baseKey}_${idx}`;
    }
    // 复制源组件的配置
    const sourceConfig = configs[copyingCompKey as keyof ComponentConfigs];
    const newComp: TemplateComponent = {
      id: `comp_${newKey}`,
      key: newKey,
      name: copyCompName.trim(),
      description: '',
      enabled: true,
      required: false,
    };
    // 在源组件后面插入新组件
    const sourceIdx = components.findIndex((c) => c.key === copyingCompKey);
    const updated = [...components];
    updated.splice(sourceIdx + 1, 0, newComp);
    onComponentsChange(updated);
    // 复制配置
    if (sourceConfig) {
      onChange({
        ...data,
        componentConfigs: { ...configs, [newKey]: JSON.parse(JSON.stringify(sourceConfig)) },
      });
    }
    setCopyingCompKey(null);
    setCopyCompName('');
  };

  const handleCancelCopy = () => {
    setCopyingCompKey(null);
    setCopyCompName('');
  };

  // 拖拽排序
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // 将排序后的 enabled 列表合并回完整的 components 数组（保留 disabled 组件的原始位置）
  const mergeReorderedEnabled = (newEnabled: TemplateComponent[]) => {
    const enabledSet = new Set(newEnabled.map((c) => c.key));
    let enabledIdx = 0;
    return components.map((c) => {
      if (enabledSet.has(c.key)) {
        return newEnabled[enabledIdx++];
      }
      return c;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = enabledComponents.findIndex((c) => c.key === active.id);
    const newIndex = enabledComponents.findIndex((c) => c.key === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    // 必选组件不允许拖拽排序
    if (enabledComponents[oldIndex].required) return;

    const newEnabled = arrayMove(enabledComponents, oldIndex, newIndex);
    onComponentsChange(mergeReorderedEnabled(newEnabled));
  };

  // 导航栏拖拽排序回调
  const handleNavReorder = (dragKey: string, overKey: string) => {
    const oldIndex = enabledComponents.findIndex((c) => c.key === dragKey);
    const newIndex = enabledComponents.findIndex((c) => c.key === overKey);
    if (oldIndex === -1 || newIndex === -1) return;
    // 必选组件不允许拖拽排序
    if (enabledComponents[oldIndex].required) return;
    const newEnabled = arrayMove(enabledComponents, oldIndex, newIndex);
    onComponentsChange(mergeReorderedEnabled(newEnabled));
  };

  // 渲染单个组件的配置内容
  const renderComponentContent = (compKey: string) => {
    // 处理复制组件（key 如 exclusive_gift_1, free_benefit_2 等）
    const baseKey = getBaseKey(compKey);
    if (baseKey !== compKey) {
      // 这是复制组件
      const cfg = (configs as Record<string, unknown>)[compKey] as BenefitConfig | undefined;
      if (baseKey === 'exclusive_gift') {
        const compName = components.find((c) => c.key === compKey)?.name || '会员专属礼';
        return (
          <BenefitConfigCard
            title={compName}
            compKey={compKey}
            config={cfg || { products: [], moduleBgImage: '' }}
            onChange={(val) => updateConfig(compKey, val)}
          />
        );
      }
      if (baseKey === 'free_benefit') {
        const compName = components.find((c) => c.key === compKey)?.name || '会员专属生活券包';
        return (
          <BenefitConfigCard
            title={compName}
            compKey={compKey}
            config={cfg || { products: [], moduleBgImage: '' }}
            onChange={(val) => updateConfig(compKey, val)}
          />
        );
      }
    }

    switch (compKey) {
      case 'global_config':
        return (
          <GlobalConfigCard
            config={configs.global_config || { ...defaultGlobalConfig }}
            onChange={(val) => updateConfig('global_config', val)}
            hasReservationTime={hasReservationTime}
          />
        );
      case 'header_banner':
        return (() => {
          const cfg = configs.header_banner || { imageUrl: '', videoUrl: '', coverImageUrl: '' };
          return (
            <div className="space-y-4">
              <ImageUploadField
                label="氛围头图"
                value={cfg.imageUrl}
                onChange={(val) => updateConfig('header_banner', { ...cfg, imageUrl: val })}
              />
              <VideoUploadField
                label="头图视频"
                value={cfg.videoUrl}
                onChange={(val) => updateConfig('header_banner', { ...cfg, videoUrl: val })}
              />
              <ImageUploadField
                label="首帧静态图"
                value={cfg.coverImageUrl || ''}
                onChange={(val) => updateConfig('header_banner', { ...cfg, coverImageUrl: val })}
                required={false}
              />
            </div>
          );
        })();
      case 'rule_popup':
        return (() => {
          const cfg: RulePopupConfig = configs.rule_popup || { iconImage: '', ruleRichText: '' };
          return (
            <div className="space-y-4">
              <ImageUploadField
                label="规则图片"
                required={false}
                value={cfg.iconImage}
                onChange={(val) => updateConfig('rule_popup', { ...cfg, iconImage: val })}
              />
              <div className="space-y-1.5">
                <ReqLabel>规则文案</ReqLabel>
                <RichTextEditor
                  value={cfg.ruleRichText}
                  onChange={(val) => updateConfig('rule_popup', { ...cfg, ruleRichText: val })}
                  placeholder="请输入活动规则文案，支持富文本编辑..."
                />
              </div>
            </div>
          );
        })();
      case 'flash_sale':
        return (
          <FlashSaleConfigCard
            config={configs.flash_sale || { moduleBgImage: '', obtainPopupBgImage: '', obtainPopupHaloEffect: '', obtainPopupTitleEffect: '', products: [] }}
            onChange={(val) => updateConfig('flash_sale', val)}
          />
        );
      case 'exclusive_gift':
        return (
          <BenefitConfigCard
            title="会员专属礼"
            compKey="exclusive_gift"
            config={configs.exclusive_gift || { products: [], moduleBgImage: '' }}
            onChange={(val) => updateConfig('exclusive_gift', val)}
          />
        );
      case 'free_purchase':
        return (
          <FreePurchaseConfigCard
            config={configs.free_purchase || { categories: [], moduleBgImage: '', stepImage: '' }}
            onChange={(val) => updateConfig('free_purchase', val)}
          />
        );
      case 'free_benefit':
        return (
          <BenefitConfigCard
            title="会员专属生活券包"
            compKey="free_benefit"
            config={configs.free_benefit || { products: [], moduleBgImage: '' }}
            onChange={(val) => updateConfig('free_benefit', val)}
          />
        );
      case 'cta_button':
        return (() => {
          const cfg: ActionButtonConfig = configs.cta_button || {
            nonMember: { buttonText: '', jumpLink: '' },
            memberNotBooked: { buttonText: '', jumpLink: '' },
          };
          const updateStatus = (status: 'nonMember' | 'memberNotBooked', field: keyof StatusButtonConfig, value: string) => {
            updateConfig('cta_button', {
              ...cfg,
              [status]: { ...cfg[status], [field]: value },
            });
          };
          const statuses: { key: 'nonMember' | 'memberNotBooked'; label: string; desc: string }[] = [
            { key: 'nonMember', label: '非会员', desc: '未开通会员的用户看到的按钮' },
            { key: 'memberNotBooked', label: '会员未预约', desc: '已开通会员但未预约的用户看到的按钮' },
          ];
          return (
            <div className="space-y-4">
              {statuses.map(({ key, label, desc }) => (
                <div key={key} className="border border-[var(--color-meiyou-divider)] rounded-lg p-3 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-[var(--color-meiyou-text-primary)]">{label}</p>
                    <p className="text-[10px] text-[var(--color-meiyou-text-placeholder)]">{desc}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <ReqLabel className="text-[11px] text-[var(--color-meiyou-text-secondary)]">按钮文案</ReqLabel>
                      <Input
                        placeholder={key === 'memberNotBooked' ? '如：立即预约' : '如：立即开通'}
                        value={cfg[key].buttonText}
                        onChange={(e) => updateStatus(key, 'buttonText', e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <ReqLabel className="text-[11px] text-[var(--color-meiyou-text-secondary)]">跳转地址</ReqLabel>
                      <Input
                        placeholder="请输入meiyou:///开头地址"
                        value={cfg[key].jumpLink}
                        onChange={(e) => updateStatus(key, 'jumpLink', e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                </div>
              ))}
            </div>
          );
        })();
      default:
        return <p className="text-xs text-gray-400">暂无配置项</p>;
    }
  };

  const handleToggleCollapse = (key: string) => {
    setCollapsedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleNavClick = (key: string) => {
    // 展开组件
    setCollapsedKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    setActiveKey(key);
    // 滚动到对应区域
    setTimeout(() => {
      const el = document.getElementById(`comp-section-${key}`);
      if (el) {
        const scrollContainer = el.closest('[style*="overflow"]') || document.querySelector('main[style*="overflow"]');
        if (scrollContainer) {
          const rect = el.getBoundingClientRect();
          const containerRect = scrollContainer.getBoundingClientRect();
          scrollContainer.scrollTo({
            top: scrollContainer.scrollTop + rect.top - containerRect.top - 8,
            behavior: 'smooth',
          });
        } else {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 80);
  };

  const handleCollapseAll = () => {
    setCollapsedKeys(new Set(enabledComponents.map((c) => c.key)));
  };

  const handleExpandAll = () => {
    setCollapsedKeys(new Set());
  };

  // 获取组件子项列表（用于目录树展示）
  const getComponentSubItems = (key: string): { id: string; label: string }[] => {
    const config = configs[key];
    if (!config) return [];
    if (key === 'flash_sale') {
      const cfg = config as FlashSaleConfig;
      return (cfg.products || []).map((p, i) => ({
        id: `${key}-product-${p.id}`,
        label: p.productName || (p.productId ? `福利 ${p.productId}` : `福利 ${i + 1}`),
      }));
    }
    if (key === 'exclusive_gift' || key === 'free_benefit') {
      const cfg = config as BenefitConfig;
      return (cfg.products || []).map((p, i) => ({
        id: `${key}-item-${p.id}`,
        label: p.productName || (p.productId ? `福利 ${p.productId}` : `图片 ${i + 1}`),
      }));
    }
    return [];
  };

  // 跳转到子项（展开父组件 + 滚动到子项）
  const handleSubItemClick = (parentKey: string, subId: string) => {
    setCollapsedKeys((prev) => {
      const next = new Set(prev);
      next.delete(parentKey);
      return next;
    });
    setActiveKey(parentKey);
    setTimeout(() => {
      const el = document.getElementById(subId);
      if (el) {
        const scrollContainer = el.closest('[style*="overflow"]') || document.querySelector('main[style*="overflow"]');
        if (scrollContainer) {
          const rect = el.getBoundingClientRect();
          const containerRect = scrollContainer.getBoundingClientRect();
          scrollContainer.scrollTo({
            top: scrollContainer.scrollTop + rect.top - containerRect.top - 8,
            behavior: 'smooth',
          });
        } else {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }, 80);
  };

  return (
    <div className="flex gap-4 items-start">
      {/* 左侧组件目录 - sticky 定位确保滚动时始终可见 */}
      <div className="w-52 shrink-0" style={{ position: 'sticky', top: 0, alignSelf: 'flex-start' }}>
        <div className="bg-white/95 backdrop-blur-sm border border-[var(--color-meiyou-border)] rounded-lg shadow-sm px-2 py-3" style={{ maxHeight: 'calc(100vh - 96px)', overflowY: 'auto' }}>
            <div className="flex items-center justify-between mb-2 px-1">
              <h4 className="text-[11px] font-semibold text-[var(--color-meiyou-text-secondary)]">组件目录</h4>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="text-[10px] text-gray-400 hover:text-[var(--color-meiyou)] transition-colors"
                  onClick={handleExpandAll}
                  title="全部展开"
                >
                  展开
                </button>
                <span className="text-[10px] text-gray-300">/</span>
                <button
                  type="button"
                  className="text-[10px] text-gray-400 hover:text-[var(--color-meiyou)] transition-colors"
                  onClick={handleCollapseAll}
                  title="全部折叠"
                >
                  折叠
                </button>
              </div>
            </div>
            <nav className="space-y-0.5">
              {enabledComponents.map((comp) => {
                const subItems = getComponentSubItems(comp.key);
                const isActive = activeKey === comp.key;
                return (
                  <div key={comp.key}>
                    <div
                      className={`flex items-center gap-1.5 w-full text-left px-2 py-1.5 rounded text-xs transition-colors truncate group cursor-pointer ${
                        isActive
                          ? 'bg-[rgba(255,77,136,0.08)] text-[var(--color-meiyou)] font-medium'
                          : 'text-[var(--color-meiyou-text-primary)] hover:bg-[var(--color-meiyou-bg-secondary)]'
                      }`}
                      onClick={() => handleNavClick(comp.key)}
                    >
                      {comp.required ? (
                        <Lock className="h-3 w-3 text-gray-300 shrink-0" />
                      ) : (
                        <GripVertical className="h-3 w-3 opacity-0 group-hover:opacity-60 text-gray-400 shrink-0 cursor-grab pointer-events-none" />
                      )}
                      <span className="flex-1 truncate">{comp.name}</span>
                      {/* 复制按钮 */}
                      {isCopyable(comp.key) && (
                        <button
                          type="button"
                          className="text-gray-300 hover:text-[var(--color-meiyou)] transition-colors shrink-0"
                          onClick={(e) => { e.stopPropagation(); handleStartCopy(comp.key); }}
                          title="复制组件"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      )}
                      {/* 拖拽放置区域 */}
                      {!comp.required && (
                        <span
                          className="absolute inset-0"
                          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          onDrop={(e) => {
                            e.preventDefault(); e.stopPropagation();
                            const dragKey = e.dataTransfer.getData('text/plain');
                            if (dragKey && dragKey !== comp.key) handleNavReorder(dragKey, comp.key);
                          }}
                        />
                      )}
                    </div>
                    {/* 子项列表 */}
                    {subItems.length > 0 && (
                      <div className="ml-4 border-l border-[var(--color-meiyou-divider)] pl-1.5 space-y-0.5 mt-0.5 mb-1">
                        {subItems.map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            className="w-full text-left px-2 py-1 rounded text-[11px] text-gray-400 hover:text-[var(--color-meiyou-text-primary)] hover:bg-[var(--color-meiyou-bg-secondary)] transition-colors truncate"
                            onClick={() => handleSubItemClick(comp.key, sub.id)}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
            {availableComponents.length > 0 && (
              <div className="mt-2 px-1 relative">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-1 h-7 border border-dashed border-[var(--color-meiyou-border)] rounded text-[11px] text-[var(--color-meiyou-text-secondary)] hover:border-[var(--color-meiyou)] hover:text-[var(--color-meiyou)] transition-colors"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setAddMenuPosition({ x: rect.right, y: rect.bottom, left: rect.left });
                    setAddMenuOpen(!addMenuOpen);
                  }}
                >
                  <Plus className="h-3 w-3" />
                  添加组件
                </button>
              </div>
            )}
          </div>
      </div>

      {/* 右侧组件配置区域 */}
      <div className="flex-1 min-w-0">
        {/* 复制组件命名弹窗 */}
        {copyingCompKey && (
          <>
            <div className="fixed inset-0 z-50 bg-black/20" onClick={handleCancelCopy} />
            <div className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl w-80">
              <div className="px-5 py-4 border-b border-[var(--color-meiyou-divider)]">
                <h3 className="text-sm font-semibold text-[var(--color-meiyou-text-primary)]">复制组件</h3>
              </div>
              <div className="px-5 py-4">
                <label className="block text-xs text-[var(--color-meiyou-text-secondary)] mb-1.5">组件名称</label>
                <input
                  type="text"
                  className="w-full h-9 px-3 text-sm border border-[var(--color-meiyou-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-meiyou)]/30"
                  value={copyCompName}
                  onChange={(e) => setCopyCompName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmCopy();
                    if (e.key === 'Escape') handleCancelCopy();
                  }}
                  autoFocus
                  placeholder="请输入组件名称"
                />
              </div>
              <div className="px-5 py-3 flex justify-end gap-2 border-t border-[var(--color-meiyou-divider)]">
                <button
                  type="button"
                  className="h-8 px-4 text-xs rounded-lg border border-[var(--color-meiyou-border)] text-[var(--color-meiyou-text-secondary)] hover:bg-gray-50 transition-colors"
                  onClick={handleCancelCopy}
                >
                  取消
                </button>
                <button
                  type="button"
                  className="h-8 px-4 text-xs rounded-lg bg-[var(--color-meiyou)] text-white hover:bg-[var(--color-meiyou-hover)] transition-colors disabled:opacity-50"
                  onClick={handleConfirmCopy}
                  disabled={!copyCompName.trim()}
                >
                  确认复制
                </button>
              </div>
            </div>
          </>
        )}

        {/* 组件列表（dnd-kit 拖拽排序） */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={enabledComponents.map((c) => c.key)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {enabledComponents.map((comp) => (
                  <SortableComponentItem
                    key={comp.key}
                    id={comp.key}
                    sectionId={`comp-section-${comp.key}`}
                    comp={comp}
                    onRemove={!comp.required ? () => handleRemoveComponent(comp.key) : undefined}
                    isCopied={isCopiedComp(comp.key)}
                    onNameChange={(name) => handleCompNameChange(comp.key, name)}
                    collapsed={collapsedKeys.has(comp.key)}
                    onToggleCollapsed={() => handleToggleCollapse(comp.key)}
                  >
                    {renderComponentContent(comp.key)}
                  </SortableComponentItem>
                ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* 添加组件下拉菜单 */}
      {addMenuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setAddMenuOpen(false); setPendingAddKeys(new Set()); }} />
          <div
            className="fixed z-50 bg-white border border-[var(--color-meiyou-border)] rounded-lg shadow-xl overflow-hidden"
            style={{
              top: addMenuPosition.y + 4,
              left: addMenuPosition.left + 208,
              width: 240,
            }}
          >
            <div className="px-3 py-2 border-b border-[var(--color-meiyou-divider)] bg-gray-50">
              <span className="text-xs font-medium text-[var(--color-meiyou-text-secondary)]">选择要添加的组件</span>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {availableComponents.map((comp) => {
                const checked = pendingAddKeys.has(comp.key);
                return (
                  <button
                    key={comp.key}
                    type="button"
                    className={`w-full px-3 py-2.5 text-left transition-colors border-b border-[var(--color-meiyou-divider)] last:border-b-0 ${checked ? 'bg-[rgba(255,77,136,0.08)]' : 'hover:bg-[rgba(255,77,136,0.04)]'}`}
                    onClick={() => togglePendingAdd(comp.key)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${checked ? 'bg-[var(--color-meiyou)] border-[var(--color-meiyou)]' : 'border-gray-300'}`}>
                        {checked && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <span className={`text-xs font-medium ${checked ? 'text-[var(--color-meiyou)]' : 'text-[var(--color-meiyou-text-primary)]'}`}>{comp.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            {pendingAddKeys.size > 0 && (
              <div className="px-3 py-2 border-t border-[var(--color-meiyou-divider)] bg-gray-50">
                <button
                  type="button"
                  className="w-full h-8 bg-[var(--color-meiyou)] hover:bg-[var(--color-meiyou-hover)] text-white text-xs font-medium rounded-md transition-colors"
                  onClick={handleBatchAddComponents}
                >
                  确认添加（{pendingAddKeys.size}）
                </button>
              </div>
            )}
          </div>
        </>
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
        ['jumpLink'],
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

/** 福利项下拉选择组件（支持关键词检索） */
interface WelfareItem {
  id: string;
  name: string;
  image?: string;
  stock?: number;
}

function WelfareSelect({
  value,
  onChange,
  onSelect,
}: {
  value: string;
  onChange: (val: string) => void;
  onSelect?: (item: WelfareItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [items, setItems] = useState<WelfareItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    const params = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';
    fetch(`/api/welfare-items${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.success) {
          setItems(data.data);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [open, keyword]);

  // 根据 value 查找当前选中项的展示文本
  const selectedItem = items.find((item) => item.id === value);

  return (
    <div className="relative mt-1">
      <div
        className="flex items-center h-8 w-full rounded-md border border-[var(--color-meiyou-border)] bg-white px-3 text-sm cursor-pointer hover:border-[var(--color-meiyou-primary)]"
        onClick={() => setOpen(!open)}
      >
        {selectedItem ? (
          <span className="flex-1 truncate">{selectedItem.id}-{selectedItem.name}</span>
        ) : value ? (
          <span className="flex-1 truncate">{value}</span>
        ) : (
          <span className="flex-1 text-[var(--color-meiyou-text-placeholder)]">选择福利</span>
        )}
        {value && (
            <button
              type="button"
              className="ml-1 shrink-0 rounded-sm opacity-50 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
                onSelect?.({ id: '', name: '', image: '', stock: 0 });
              }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </div>
      {open && (
        <>
          {/* 背景遮罩 */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 w-full min-w-[280px] rounded-md border border-[var(--color-meiyou-border)] bg-white shadow-lg">
            {/* 搜索框 */}
            <div className="p-2 border-b border-[var(--color-meiyou-border)]">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-meiyou-text-placeholder)]" />
                <Input
                  className="h-7 pl-7 text-sm"
                  placeholder="搜索福利名称..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            {/* 列表 */}
            <div className="max-h-48 overflow-y-auto">
              {loading ? (
                <div className="py-4 text-center text-xs text-[var(--color-meiyou-text-placeholder)]">加载中...</div>
              ) : items.length === 0 ? (
                <div className="py-4 text-center text-xs text-[var(--color-meiyou-text-placeholder)]">无匹配结果</div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-[rgba(255,77,136,0.06)] flex items-center gap-2 ${
                      value === item.id ? 'bg-[rgba(255,77,136,0.06)] text-[var(--color-meiyou-primary)]' : ''
                    }`}
                    onClick={() => {
                      onChange(item.id);
                      onSelect?.(item);
                      setOpen(false);
                      setKeyword('');
                    }}
                  >
                    <span className="flex-1 truncate">{item.id}-{item.name}</span>
                    {item.stock !== undefined && (
                      <span className={`text-xs font-mono shrink-0 ${item.stock === 0 ? 'text-[#ff4d4d]' : 'text-[rgba(0,0,0,0.35)]'}`}>
                        库存{item.stock.toLocaleString()}
                      </span>
                    )}
                    {value === item.id && <Check className="h-3.5 w-3.5 shrink-0 text-[var(--color-meiyou-primary)]" />}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
      {selectedItem && selectedItem.stock !== undefined && (
        <p className={`mt-1 text-xs font-mono ${selectedItem.stock === 0 ? 'text-[#ff4d4d]' : 'text-[rgba(0,0,0,0.45)]'}`}>
          可配库存: {selectedItem.stock.toLocaleString()} 件{selectedItem.stock === 0 ? '（该福利不可用）' : ''}
        </p>
      )}
    </div>
  );
}

// ==================== 吸底按钮配置字段 ====================

function ReqLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <Label className={className ?? "text-xs text-[var(--color-meiyou-text-secondary)]"}><span className="text-red-500 mr-0.5">*</span>{children}</Label>;
}

function GlobalConfigCard({
  config,
  onChange,
  hasReservationTime,
}: {
  config: GlobalConfig;
  onChange: (config: GlobalConfig) => void;
  hasReservationTime?: boolean;
}) {
  const cfg = { ...defaultGlobalConfig, ...config };

  const updateField = <K extends keyof GlobalConfig>(key: K, value: GlobalConfig[K]) => {
    onChange({ ...cfg, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {/* 背景类型选择 */}
        <div className="space-y-1.5">
          <ReqLabel>背景类型</ReqLabel>
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
            <ReqLabel>背景颜色</ReqLabel>
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
                <ReqLabel>起始颜色</ReqLabel>
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
                <ReqLabel>结束颜色</ReqLabel>
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
              <ReqLabel>渐变方向</ReqLabel>
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
              <ReqLabel>预设渐变</ReqLabel>
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

      </div>

      {/* 按钮样式配置 */}
      <div className="space-y-3">
        <ReqLabel>按钮</ReqLabel>

        {/* 按钮类型 */}
        <div className="space-y-1.5">
          <Label className="text-xs text-[rgba(0,0,0,0.6)]">按钮类型</Label>
          <div className="flex gap-2">
            {(['solid', 'outline'] as const).map((type) => (
              <button
                key={type}
                onClick={() => updateField('button', { ...cfg.button, styleType: type })}
                className={`px-3 py-1.5 rounded text-xs border transition-colors ${
                  cfg.button?.styleType === type
                    ? 'border-[#ff4d88] text-[#ff4d88] bg-[rgba(255,77,136,0.06)]'
                    : 'border-[var(--color-meiyou-border)] text-[rgba(0,0,0,0.6)] bg-white hover:border-[#ff4d88]/40'
                }`}
              >
                {type === 'solid' ? '实色按钮' : '线条按钮'}
              </button>
            ))}
          </div>
        </div>

        {/* 按钮背景方式 */}
        <div className="space-y-1.5">
          <Label className="text-xs text-[rgba(0,0,0,0.6)]">按钮背景</Label>
          <div className="flex gap-2">
            {(['solid', 'gradient', 'image'] as const).map((type) => (
              <button
                key={type}
                onClick={() => updateField('button', { ...cfg.button, backgroundType: type })}
                className={`px-3 py-1.5 rounded text-xs border transition-colors ${
                  cfg.button?.backgroundType === type
                    ? 'border-[#ff4d88] text-[#ff4d88] bg-[rgba(255,77,136,0.06)]'
                    : 'border-[var(--color-meiyou-border)] text-[rgba(0,0,0,0.6)] bg-white hover:border-[#ff4d88]/40'
                }`}
              >
                {type === 'solid' ? '纯色' : type === 'gradient' ? '渐变色' : '图片'}
              </button>
            ))}
          </div>
        </div>

        {/* 纯色配置 */}
        {cfg.button?.backgroundType === 'solid' && (
          <div className="space-y-1.5">
            <ReqLabel>按钮颜色</ReqLabel>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={cfg.button?.solidColor || '#ff4d88'}
                onChange={(e) => updateField('button', { ...cfg.button, solidColor: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border border-[var(--color-meiyou-border)] p-0.5"
              />
              <Input
                value={cfg.button?.solidColor || '#ff4d88'}
                onChange={(e) => updateField('button', { ...cfg.button, solidColor: e.target.value })}
                className="flex-1 h-8 text-xs"
              />
            </div>
          </div>
        )}

        {/* 渐变色配置 */}
        {cfg.button?.backgroundType === 'gradient' && (
          <div className="space-y-3">
            <div className="flex gap-4">
              <div className="space-y-1.5 flex-1">
                <ReqLabel>起始颜色</ReqLabel>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={cfg.button?.gradientStart || '#ff4d88'}
                    onChange={(e) => updateField('button', { ...cfg.button, gradientStart: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer border border-[var(--color-meiyou-border)] p-0.5"
                  />
                  <Input
                    value={cfg.button?.gradientStart || '#ff4d88'}
                    onChange={(e) => updateField('button', { ...cfg.button, gradientStart: e.target.value })}
                    className="flex-1 h-8 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1.5 flex-1">
                <ReqLabel>结束颜色</ReqLabel>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={cfg.button?.gradientEnd || '#ff8866'}
                    onChange={(e) => updateField('button', { ...cfg.button, gradientEnd: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer border border-[var(--color-meiyou-border)] p-0.5"
                  />
                  <Input
                    value={cfg.button?.gradientEnd || '#ff8866'}
                    onChange={(e) => updateField('button', { ...cfg.button, gradientEnd: e.target.value })}
                    className="flex-1 h-8 text-xs"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-[rgba(0,0,0,0.6)]">渐变方向</Label>
              <div className="flex gap-2">
                {[
                  { value: 'to right', label: '→' },
                  { value: 'to bottom', label: '↓' },
                  { value: 'to bottom right', label: '↘' },
                ].map((dir) => (
                  <button
                    key={dir.value}
                    onClick={() => updateField('button', { ...cfg.button, gradientDirection: dir.value })}
                    className={`w-8 h-8 rounded border text-sm transition-colors ${
                      cfg.button?.gradientDirection === dir.value
                        ? 'border-[#ff4d88] text-[#ff4d88] bg-[rgba(255,77,136,0.06)]'
                        : 'border-[var(--color-meiyou-border)] text-[rgba(0,0,0,0.6)] bg-white'
                    }`}
                  >
                    {dir.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 图片背景配置 */}
        {cfg.button?.backgroundType === 'image' && (
          <ImageUploadField
            label="按钮背景图片"
            value={cfg.button?.backgroundImage || ''}
            onChange={(val) => updateField('button', { ...cfg.button, backgroundImage: val })}
          />
        )}

        {/* 按钮字体颜色 */}
        <div className="space-y-1.5">
          <ReqLabel>字体颜色</ReqLabel>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={cfg.button?.fontColor || '#ffffff'}
              onChange={(e) => updateField('button', { ...cfg.button, fontColor: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border border-[var(--color-meiyou-border)] p-0.5"
            />
            <Input
              value={cfg.button?.fontColor || '#ffffff'}
              onChange={(e) => updateField('button', { ...cfg.button, fontColor: e.target.value })}
              className="flex-1 h-8 text-xs"
            />
          </div>
        </div>

        {/* 按钮预览 */}
        <div className="rounded-lg border border-[var(--color-meiyou-border)] p-3 flex items-center justify-center">
          {(() => {
            const btn = cfg.button;
            if (!btn) return <span className="text-xs text-[rgba(0,0,0,0.4)]">请配置按钮样式</span>;
            const isOutline = btn.styleType === 'outline';
            const bgStyle = btn.backgroundType === 'solid'
              ? btn.solidColor || '#ff4d88'
              : btn.backgroundType === 'gradient'
                ? `linear-gradient(${btn.gradientDirection || 'to right'}, ${btn.gradientStart || '#ff4d88'}, ${btn.gradientEnd || '#ff8866'})`
                : undefined;
            const imgStyle = btn.backgroundType === 'image' && btn.backgroundImage
              ? `url(${btn.backgroundImage})` : undefined;
            return (
              <button
                className="px-6 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  color: btn.fontColor || '#ffffff',
                  ...(isOutline
                    ? { border: `2px solid ${bgStyle || '#ff4d88'}`, background: 'transparent' }
                    : imgStyle
                      ? { backgroundImage: imgStyle, backgroundSize: 'cover', backgroundPosition: 'center', border: 'none' }
                      : { background: bgStyle, border: 'none' }
                  ),
                }}
              >
                按钮预览
              </button>
            );
          })()}
        </div>
        {/* 预约成功弹窗背景图 */}
        {hasReservationTime && (
          <div className="mt-4">
            <ImageUploadField
              label="预约成功弹窗背景图"
              value={cfg.bookingSuccessBgImage || ''}
              onChange={(url) => updateField('bookingSuccessBgImage', url)}
              required
            />
          </div>
        )}
        <div className="space-y-1.5">
          <ReqLabel>预约通知push文案</ReqLabel>
          <Input
            value={cfg.bookingPushText || ''}
            onChange={(e) => updateField('bookingPushText', e.target.value)}
            placeholder="请输入预约通知push文案"
          />
        </div>
      </div>
    </div>
  );
}

function FlashSaleConfigCard({
  config,
  onChange,
}: {
  config: FlashSaleConfig;
  onChange: (config: FlashSaleConfig) => void;
}) {
  const moveProduct = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= config.products.length) return;
    const updated = [...config.products];
    [updated[fromIdx], updated[toIdx]] = [updated[toIdx], updated[fromIdx]];
    onChange({ ...config, products: updated });
  };

  const addProduct = () => {
    const newProduct: FlashSaleProduct = {
      id: `fsp_${Date.now()}`,
      productId: '',
      productName: '',
      stock: '',
      productImage: '',
      obtainPopupProductImage: '',
      jumpLink: '',
      bookingPushText: '',
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
    <div className="space-y-4">
        {/* 模块图片 */}
        <div>
          <ImageUploadField
            label="模块背景图"
            value={config.moduleBgImage}
            onChange={(val) => onChange({ ...config, moduleBgImage: val })}
          />
        </div>

        {/* 获得弹窗配置 */}
        <div className="space-y-4">
          <ImageUploadField
            label="获得弹窗背景图"
            value={config.obtainPopupBgImage || ''}
            onChange={(val) => onChange({ ...config, obtainPopupBgImage: val })}
            required
            hint="建议尺寸：885*1314；格式：png/jpg/pag/webp；大小：不超过 2MB"
          />
          <ImageUploadField
            label="获得弹窗背景光圈动效"
            value={config.obtainPopupHaloEffect || ''}
            onChange={(val) => onChange({ ...config, obtainPopupHaloEffect: val })}
            required={false}
            hint="建议尺寸：1125*2436；格式：pag/webp；大小：不超过 2MB"
          />
          <ImageUploadField
            label="获得弹窗标题背景动效"
            value={config.obtainPopupTitleEffect || ''}
            onChange={(val) => onChange({ ...config, obtainPopupTitleEffect: val })}
            required={false}
            hint="建议尺寸：1125*1125；格式：pag/webp；大小：不超过 2MB"
          />
        </div>

        <Separator />

        {/* 福利列表 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[var(--color-meiyou-text-primary)]">
              福利列表
              <span className="text-xs text-[var(--color-meiyou-text-placeholder)] ml-1">({config.products.length}个)</span>
            </span>
            <Button size="sm" className="bg-meiyou hover:bg-meiyou-hover text-white" onClick={addProduct}>
              <Plus className="h-3 w-3 mr-1" />
              添加福利
            </Button>
          </div>

          {config.products.length === 0 && (
            <div className="text-center py-6 text-[var(--color-meiyou-text-placeholder)] text-sm border rounded-lg border-dashed border-[var(--color-meiyou-divider)]">
              暂无福利，点击"添加福利"开始配置
            </div>
          )}

          <div className="space-y-4">
            {config.products.map((product, idx) => (
              <Card key={product.id} id={`flash_sale-product-${product.id}`} className="border-[var(--color-meiyou-border)] bg-meiyou-bg/50 scroll-mt-4">
                <CardHeader className="py-3 px-4 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--color-meiyou-text-primary)]">{product.productName || `福利 ${idx + 1}`}</span>
                    <div className="flex items-center gap-0.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-[var(--color-meiyou-text-placeholder)] hover:text-meiyou disabled:opacity-30"
                        disabled={idx === 0}
                        title="置顶"
                        onClick={() => {
                          const updated = [...config.products];
                          const [item] = updated.splice(idx, 1);
                          updated.unshift(item);
                          onChange({ ...config, products: updated });
                        }}
                      >
                        <ArrowUpToLine className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-[var(--color-meiyou-text-placeholder)] hover:text-meiyou disabled:opacity-30"
                        disabled={idx === 0}
                        title="上移"
                        onClick={() => moveProduct(idx, idx - 1)}
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-[var(--color-meiyou-text-placeholder)] hover:text-meiyou disabled:opacity-30"
                        disabled={idx === config.products.length - 1}
                        title="下移"
                        onClick={() => moveProduct(idx, idx + 1)}
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-[var(--color-meiyou-text-placeholder)] hover:text-meiyou disabled:opacity-30"
                        disabled={idx === config.products.length - 1}
                        title="置底"
                        onClick={() => {
                          const updated = [...config.products];
                          const [item] = updated.splice(idx, 1);
                          updated.push(item);
                          onChange({ ...config, products: updated });
                        }}
                      >
                        <ArrowDownToLine className="h-3.5 w-3.5" />
                      </Button>
                      <div className="w-px h-4 bg-[var(--color-meiyou-divider)] mx-1" />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-[var(--color-meiyou-text-placeholder)] hover:text-red-500 h-6 w-6 p-0"
                        onClick={() => removeProduct(product.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-4">
                  {/* 福利基础信息 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <ReqLabel>福利ID</ReqLabel>
                      <WelfareSelect
                        value={product.productId}
                        onChange={(val) => updateProduct(product.id, { productId: val, productName: val ? product.productName : '' })}
                        onSelect={(item) => {
                          // 活动弹窗福利图：根据选择的福利id自动填充福利图片
                          if (item.image) {
                            updateProduct(product.id, { productId: item.id, productName: item.name, obtainPopupProductImage: item.image });
                          } else {
                            updateProduct(product.id, { productId: item.id, productName: item.name });
                          }
                        }}
                      />
                    </div>
                    <div>
                      <ReqLabel>库存</ReqLabel>
                      <Input
                        className="mt-1 h-8 text-sm"
                        placeholder="输入库存数量"
                        value={product.stock}
                        onChange={(e) => updateProduct(product.id, { stock: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* 福利图片 */}
                  <div className="grid grid-cols-2 gap-3">
                    <ImageUploadField
                      label="福利图"
                      value={product.productImage}
                      onChange={(val) => updateProduct(product.id, { productImage: val })}
                      hint="根据选择的福利自动填充，支持修改"
                    />
                    <ImageUploadField
                      label="获得弹窗福利图"
                      value={product.obtainPopupProductImage || ''}
                      onChange={(val) => updateProduct(product.id, { obtainPopupProductImage: val })}
                      hint="建议尺寸：885*1314；格式：png/jpg/pag/webp；大小：不超过 2MB"
                    />
                  </div>

                  {/* 福利名称 */}
                  <div>
                    <ReqLabel>福利名称</ReqLabel>
                    <Input
                      className="mt-1 h-8 text-sm"
                      placeholder="请输入福利名称"
                      value={product.productName}
                      onChange={(e) => updateProduct(product.id, { productName: e.target.value })}
                    />
                  </div>

                  {/* 链接与文案 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <ReqLabel>跳转地址</ReqLabel>
                      <Input
                        className="mt-1 h-8 text-sm"
                        placeholder="请输入meiyou:///开头地址"
                        value={product.jumpLink}
                        onChange={(e) => updateProduct(product.id, { jumpLink: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* 场次配置 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <ReqLabel>场次配置</ReqLabel>
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
                            <Label className="text-sm font-medium text-foreground/80">预约时间</Label>
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
                            <ReqLabel>抢购时间</ReqLabel>
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

                  {/* 预约通知push文案 - 仅配置了预约时间时展示 */}
                  {product.timeSessions.some((s) => s.bookingStartTime || s.bookingEndTime) && (
                    <div>
                      <ReqLabel>预约通知push文案</ReqLabel>
                      <Input
                        className="mt-1 h-8 text-sm"
                        placeholder="请输入预约通知push文案"
                        value={product.bookingPushText}
                        onChange={(e) => updateProduct(product.id, { bookingPushText: e.target.value })}
                      />
                    </div>
                  )}

                  {/* 用户条件 */}
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
      </div>
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
  // 兼容旧数据：categoryIds → categories
  const categories: CategoryPathItem[] = config.categories && config.categories.length > 0
    ? config.categories
    : (config.categoryIds || []).map((id) => ({ path: id, isDefault: false }));

  const addCategory = () => {
    onChange({ ...config, categories: [...categories, { path: '', isDefault: false }] });
  };

  const updateCategory = (index: number, field: keyof CategoryPathItem, value: string | boolean) => {
    const newCats = [...categories];
    newCats[index] = { ...newCats[index], [field]: value };
    onChange({ ...config, categories: newCats });
  };

  const removeCategory = (index: number) => {
    onChange({ ...config, categories: categories.filter((_, i) => i !== index) });
  };

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    const newCats = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newCats.length) return;
    [newCats[index], newCats[targetIndex]] = [newCats[targetIndex], newCats[index]];
    onChange({ ...config, categories: newCats });
  };

  return (
    <div className="space-y-4">
      <div>
          <ImageUploadField
              label="模块背景图"
              value={config.moduleBgImage}
              onChange={(v) => onChange({ ...config, moduleBgImage: v })}
            />
        </div>
        <div>
          <ImageUploadField
              label="步骤图"
              value={config.stepImage || ''}
              onChange={(v) => onChange({ ...config, stepImage: v })}
              required
              hint="建议尺寸：900*240；格式：png/jpg/pag/webp；大小：不超过 2MB"
            />
        </div>
        <div className="flex items-center justify-between">
          <ReqLabel>类目路径</ReqLabel>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={addCategory}>
            <Plus className="h-3 w-3 mr-1" />
            添加类目
          </Button>
        </div>
        {categories.length === 0 ? (
          <div className="text-center py-6 text-[var(--color-meiyou-text-placeholder)] text-xs">暂无类目路径，请点击添加</div>
        ) : (
          <div className="space-y-2">
            {categories.map((cat, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-xs text-[var(--color-meiyou-text-placeholder)] w-6 text-right shrink-0">{index + 1}.</span>
                <Input
                  className="h-8 text-sm flex-1"
                  placeholder="请输类目路径，如 644,746,771"
                  value={cat.path}
                  onChange={(e) => updateCategory(index, 'path', e.target.value)}
                />
                <label className="flex items-center gap-1 shrink-0 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={cat.isDefault}
                    onChange={(e) => updateCategory(index, 'isDefault', e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-gray-300 accent-[#ff4d88]"
                  />
                  <span className="text-xs text-[rgba(0,0,0,0.6)] whitespace-nowrap">默认展示</span>
                </label>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={index === 0}
                    onClick={() => moveCategory(index, 'up')}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    disabled={index === categories.length - 1}
                    onClick={() => moveCategory(index, 'down')}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-meiyou hover:text-meiyou-hover"
                    onClick={() => removeCategory(index)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );
}

function BenefitConfigCard({
  title: _title,
  compKey,
  config,
  onChange,
}: {
  title: string;
  compKey: string;
  config: BenefitConfig;
  onChange: (config: BenefitConfig) => void;
}) {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const toggleCollapse = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const addItem = () => {
    const newItem: BenefitProduct = {
      id: `bp_${Date.now()}`,
      productId: '',
      productName: '',
      benefitImage: '',
      displayMode: 'horizontal',
      jumpLink: '',
      sortOrder: config.products.length + 1,
      audienceRules: [],
    };
    onChange({ ...config, products: [...config.products, newItem] });
  };

  const removeItem = (itemId: string) => {
    const updated = config.products.filter((p) => p.id !== itemId);
    onChange({ ...config, products: updated.map((p, i) => ({ ...p, sortOrder: i + 1 })) });
  };

  const updateItem = (itemId: string, updates: Partial<BenefitProduct>) => {
    onChange({
      ...config,
      products: config.products.map((p) => (p.id === itemId ? { ...p, ...updates } : p)),
    });
  };

  const moveItem = (itemId: string, direction: 'up' | 'down') => {
    const idx = config.products.findIndex((p) => p.id === itemId);
    if (idx < 0) return;
    const newProducts = [...config.products];
    if (direction === 'up' && idx > 0) {
      [newProducts[idx - 1], newProducts[idx]] = [newProducts[idx], newProducts[idx - 1]];
    } else if (direction === 'down' && idx < newProducts.length - 1) {
      [newProducts[idx], newProducts[idx + 1]] = [newProducts[idx + 1], newProducts[idx]];
    }
    onChange({ ...config, products: newProducts.map((p, i) => ({ ...p, sortOrder: i + 1 })) });
  };

  return (
    <div className="space-y-4">
      <div>
        <ImageUploadField
          label="模块背景图"
          value={config.moduleBgImage}
          onChange={(v) => onChange({ ...config, moduleBgImage: v })}
        />
      </div>

      <Separator />

      {/* 统一列表 */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-[var(--color-meiyou-text-primary)]">
            列表项
            <span className="text-xs text-[var(--color-meiyou-text-placeholder)] ml-1">({config.products.length}个)</span>
          </span>
          <Button size="sm" className="bg-meiyou hover:bg-meiyou-hover text-white" onClick={addItem}>
            <Plus className="h-3 w-3 mr-1" />
            添加项目
          </Button>
        </div>

        {config.products.length === 0 && (
          <div className="text-center py-6 text-[var(--color-meiyou-text-placeholder)] text-sm border rounded-lg border-dashed border-[var(--color-meiyou-divider)]">
            暂无项目，点击"添加项目"开始配置
          </div>
        )}

        <div className="space-y-3">
          {config.products.map((product, idx) => {
            const isProductItem = !!product.productId;
            const isCollapsed = collapsedIds.has(product.id);
            const displayModeText = product.displayMode === 'horizontal' ? '单排' : product.displayMode === 'double-column' ? '双排' : '三排';
            return (
              <div
                key={product.id}
                id={`${compKey}-item-${product.id}`}
                className="rounded-lg border border-[var(--color-meiyou-border)] bg-white overflow-hidden scroll-mt-4"
              >
                {/* 标题行：缩略图 + 摘要信息 + 折叠按钮（始终可见） */}
                <div className="flex items-center gap-3 p-3">
                  {/* 排序控制 */}
                  <div className="flex flex-col gap-0.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-5 w-5 p-0"
                      disabled={idx === 0}
                      onClick={() => moveItem(product.id, 'up')}
                    >
                      <ChevronLeft className="h-3 w-3 rotate-90" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-5 w-5 p-0"
                      disabled={idx === config.products.length - 1}
                      onClick={() => moveItem(product.id, 'down')}
                    >
                      <ChevronLeft className="h-3 w-3 -rotate-90" />
                    </Button>
                  </div>

                  {/* 缩略图 */}
                  <div className="h-9 w-9 shrink-0 rounded-md border border-[var(--color-meiyou-border)] bg-gray-50 overflow-hidden flex items-center justify-center">
                    {product.benefitImage ? (
                      <img src={product.benefitImage} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ImageIcon className="h-4 w-4 text-gray-300" />
                    )}
                  </div>

                  {/* 摘要信息 */}
                  <div
                    className="flex-1 flex items-center gap-2 cursor-pointer min-w-0"
                    onClick={() => toggleCollapse(product.id)}
                  >
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5 shrink-0">
                      {isProductItem ? '福利' : '图片'}
                    </Badge>
                    <span className="text-sm font-medium text-[var(--color-meiyou-text-primary)] shrink-0 truncate">
                      {product.productName || (isProductItem ? product.productId : '图片')}
                    </span>
                    <span className="text-xs text-[var(--color-meiyou-text-placeholder)] shrink-0">
                      · {displayModeText}
                    </span>
                    <span className="text-xs text-[var(--color-meiyou-text-placeholder)] shrink-0">
                      · 排序{product.sortOrder}
                    </span>
                  </div>

                  {/* 折叠按钮 */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 shrink-0"
                    onClick={() => toggleCollapse(product.id)}
                  >
                    <ChevronDown className={`h-4 w-4 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
                  </Button>

                  {/* 删除按钮 */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-[var(--color-meiyou-text-placeholder)] hover:text-red-500 h-7 w-7 p-0 shrink-0"
                    onClick={() => removeItem(product.id)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>

                {/* 可折叠内容区域 */}
                {!isCollapsed && (
                  <div className="px-3 pb-3 pt-1 border-t border-[var(--color-meiyou-border)]">
                    <div className="space-y-3 pt-3">
                      {/* 展示方式 + 排序 + 福利ID */}
                      <div className="grid grid-cols-3 gap-3">
                        {/* 展示方式 - 可视化布局选择器 */}
                        <div>
                          <ReqLabel>展示方式</ReqLabel>
                          <div className="mt-1 flex gap-2">
                            {([
                              { value: 'horizontal' as const, label: '单排', cols: 1 },
                              { value: 'double-column' as const, label: '双排', cols: 2 },
                              { value: 'triple-column' as const, label: '三排', cols: 3 },
                            ]).map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => updateItem(product.id, { displayMode: opt.value })}
                                className={`flex flex-1 flex-col items-center gap-1 rounded-lg border-2 px-2 py-2 transition-all ${
                                  product.displayMode === opt.value
                                    ? 'border-[#ff4d88] bg-[rgba(255,77,136,0.06)]'
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                              >
                                {/* 布局缩略图 */}
                                <div className="flex gap-[3px]" style={{ width: 40 }}>
                                  {Array.from({ length: opt.cols }).map((_, i) => (
                                    <div
                                      key={i}
                                      className={`rounded-sm ${
                                        product.displayMode === opt.value
                                          ? 'bg-[#ff4d88]/30'
                                          : 'bg-gray-200'
                                      }`}
                                      style={{
                                        width: opt.cols === 1 ? 40 : opt.cols === 2 ? 18 : 11,
                                        height: 24,
                                      }}
                                    />
                                  ))}
                                </div>
                                <span className={`text-[11px] leading-tight ${
                                  product.displayMode === opt.value
                                    ? 'text-[#ff4d88] font-medium'
                                    : 'text-gray-500'
                                }`}>
                                  {opt.label}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                        {/* 排序 */}
                        <div>
                          <ReqLabel>排序</ReqLabel>
                          <Input
                            className="mt-1 h-8 text-sm"
                            type="number"
                            value={product.sortOrder}
                            onChange={(e) => updateItem(product.id, { sortOrder: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        {/* 福利ID */}
                        <div>
                          <Label className="text-xs text-[var(--color-meiyou-text-secondary)]">福利ID</Label>
                          <WelfareSelect
                            value={product.productId}
                            onChange={(val) => updateItem(product.id, { productId: val, productName: val ? product.productName : '' })}
                            onSelect={(item) => {
                              if (item.image && !product.benefitImage) {
                                updateItem(product.id, { productId: item.id, productName: item.name, benefitImage: item.image });
                              } else {
                                updateItem(product.id, { productId: item.id, productName: item.name });
                              }
                            }}
                          />
                        </div>
                      </div>

                      {/* 福利图片 */}
                      <ImageUploadField
                        label="福利图片"
                        value={product.benefitImage}
                        onChange={(val) => updateItem(product.id, { benefitImage: val })}
                      />

                      {/* 福利名称 */}
                      <div>
                        <ReqLabel>福利名称</ReqLabel>
                        <Input
                          className="mt-1 h-8 text-sm"
                          value={product.productName || ''}
                          onChange={(e) => updateItem(product.id, { productName: e.target.value })}
                          placeholder="请输入福利名称"
                        />
                      </div>

                      {/* 跳转地址：福利ID为空时必填，有福利ID时选填 */}
                      <div>
                        {isProductItem ? (
                          <Label className="text-xs text-[var(--color-meiyou-text-secondary)]">跳转地址</Label>
                        ) : (
                          <ReqLabel>跳转地址</ReqLabel>
                        )}
                        <Input
                          className="mt-1 h-8 text-sm"
                          value={product.jumpLink || ''}
                          onChange={(e) => updateItem(product.id, { jumpLink: e.target.value })}
                          placeholder="请输入meiyou:///开头地址"
                        />
                      </div>

                      {/* 用户条件 */}
                      <AudienceRuleEditor
                        rules={product.audienceRules}
                        onRulesChange={(rules) => updateItem(product.id, { audienceRules: rules })}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // 从 API 获取模板列表
  const [templates, setTemplates] = useState<Template[]>([]);
  useEffect(() => {
    fetch('/api/templates')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setTemplates(json.data.map(mapTemplateFromDb));
        }
      })
      .catch(console.error);
  }, []);

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
      // 如果 components 是对象（键值对），需要模板数据来还原，延迟到 templates 加载后处理
      }
      return {
        templateId: (raw.template_id || raw.templateId || '') as string,
        category: (raw.category || '') as string,
        name: initialData.name,
        activityStartTime: toDatetimeLocalValue(timeConfig.activityStartTime),
        activityEndTime: toDatetimeLocalValue(timeConfig.activityEndTime),
        sellStartTime: toDatetimeLocalValue(timeConfig.sellStartTime),
        sellEndTime: toDatetimeLocalValue(timeConfig.sellEndTime),
        lotteryStartTime: toDatetimeLocalValue(timeConfig.lotteryStartTime),
        lotteryEndTime: toDatetimeLocalValue(timeConfig.lotteryEndTime),
        bufferEndTime: toDatetimeLocalValue(timeConfig.bufferEndTime),
        refundCutoffTime: toDatetimeLocalValue(timeConfig.refundCutoffTime),
        components,
      };
    }
    const defaultTemplate = templates.find((t) => t.id === 'tpl_002');
    return {
      templateId: 'tpl_002',
      category: '',
      name: '',
      components: [],
      activityStartTime: '',
      activityEndTime: '',
      sellStartTime: '',
      sellEndTime: '',
      lotteryStartTime: '',
      lotteryEndTime: '',
      bufferEndTime: '',
      refundCutoffTime: '',
    };
  });


  // 模板加载完成后，初始化组件（新建模式）或还原组件（编辑模式的键值对格式）
  useEffect(() => {
    if (templates.length === 0) return;

    if (!initialData) {
      // 新建模式：用默认模板的组件初始化
      const defaultTemplate = templates.find((t) => t.id === 'tpl_002');
      if (defaultTemplate && step1Data.components.length === 0) {
        setStep1Data(prev => ({
          ...prev,
          components: defaultTemplate.components.map((c: TemplateComponent) => ({ ...c })),
        }));
      }
    } else {
      // 编辑模式：如果 components 是键值对格式，需要从模板还原
      const raw = initialData as unknown as Record<string, unknown>;
      const rawComponents = raw.components
        ? (typeof raw.components === 'string' ? JSON.parse(raw.components as string) : raw.components)
        : null;
      if (rawComponents && !Array.isArray(rawComponents) && typeof rawComponents === 'object') {
        const compMap = rawComponents as Record<string, boolean>;
        const tplId = (raw.template_id || raw.templateId || '') as string;
        const tpl = templates.find((t) => t.id === tplId);
        if (tpl && Array.isArray(tpl.components)) {
          const components = tpl.components.map((c: TemplateComponent) => ({
            ...c,
            enabled: compMap[c.key] !== undefined ? compMap[c.key] : c.enabled,
          }));
          setStep1Data(prev => ({ ...prev, components }));
        }
      }
    }
  }, [templates]);

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
      // 确保 global_config 存在
      if (!componentConfigs.global_config) {
        componentConfigs.global_config = { ...defaultGlobalConfig };
      }
      return { componentConfigs };
    }
    return { componentConfigs: { global_config: { ...defaultGlobalConfig } } };
  });

  const isFormValid = () => {
    return (
      step1Data.templateId !== '' &&
      step1Data.name !== '' &&
      step1Data.category !== '' &&
      step1Data.activityStartTime !== '' &&
      step1Data.activityEndTime !== ''
    );
  };

  const enabledComponents = step1Data.components.filter((c) => c.enabled);

  const addComponent = (comp: TemplateComponent) => {
    setStep1Data((prev) => ({
      ...prev,
      components: [...prev.components, { ...comp, enabled: true }],
    }));
  };

  const removeComponent = (compKey: string) => {
    setStep1Data((prev) => ({
      ...prev,
      components: prev.components.filter((c) => c.key !== compKey),
    }));
  };

  const moveComponent = (oldIndex: number, newIndex: number) => {
    setStep1Data((prev) => {
      const newComps = [...prev.components];
      const [moved] = newComps.splice(oldIndex, 1);
      newComps.splice(newIndex, 0, moved);
      return { ...prev, components: newComps };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = enabledComponents.findIndex((c) => c.key === active.id);
      const newIndex = enabledComponents.findIndex((c) => c.key === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        // 必选组件不允许拖拽排序
        if (enabledComponents[oldIndex].required) return;
        // Map enabled index back to full components array
        const fullOldIndex = step1Data.components.findIndex((c) => c.key === enabledComponents[oldIndex].key);
        const fullNewIndex = step1Data.components.findIndex((c) => c.key === enabledComponents[newIndex].key);
        moveComponent(fullOldIndex, fullNewIndex);
      }
    }
  };

  const handlePublish = async () => {
    if (!step1Data.lotteryStartTime || !step1Data.lotteryEndTime) {
      alert('请填写活动福利领取时间');
      return;
    }
    const payload = {
      name: step1Data.name,
      category: step1Data.category,
      template_id: step1Data.templateId,
      template_name: templates.find((t) => t.id === step1Data.templateId)?.name || '',
      status: 'active' as const,
      time_config: {
        activityStartTime: step1Data.activityStartTime,
        activityEndTime: step1Data.activityEndTime,
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

  const handleSaveDraft = async () => {
    const payload = {
      name: step1Data.name,
      category: step1Data.category,
      template_id: step1Data.templateId,
      template_name: templates.find((t) => t.id === step1Data.templateId)?.name || '',
      status: 'draft' as const,
      time_config: {
        activityStartTime: step1Data.activityStartTime,
        activityEndTime: step1Data.activityEndTime,
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
        alert('草稿已保存！');
      } else {
        await fetch('/api/activities', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: `act_${Date.now()}` }),
        });
        alert('草稿已保存！');
      }
      router.push('/activities');
    } catch {
      alert('保存失败，请重试');
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
        </div>

      </div>

      {/* 单页配置：基础信息 + 活动组件 */}
      <Card className="">
        <CardContent className="pt-6 space-y-6">
          {/* 基础信息 */}
          <div>
            <h3 className="text-base font-semibold text-[var(--color-meiyou-text-primary)] mb-4 pb-2 border-b border-[var(--color-meiyou-divider)]">基础信息</h3>
            <StepBasicInfo data={step1Data} onChange={setStep1Data} isEdit={isEdit} hideComponentsSection templates={templates} />
          </div>

          {/* 活动组件 */}
          <div>
            <h3 className="text-base font-semibold text-[var(--color-meiyou-text-primary)] mb-4 pb-2 border-b border-[var(--color-meiyou-divider)]">活动组件</h3>
            <StepComponentConfig
              data={step2Data}
              onChange={setStep2Data}
              components={step1Data.components}
              onComponentsChange={(comps) => setStep1Data((prev) => ({ ...prev, components: comps }))}
              hasReservationTime={!!(step1Data.sellStartTime || step1Data.sellEndTime)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 固定底部操作栏 */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[var(--color-meiyou-divider)] shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
        <div className="px-6 py-3">
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" className="border-[var(--color-meiyou-divider)] h-9 px-6" onClick={() => window.close()}>
              取消
            </Button>
            <Button
              variant="outline"
              className="border-[var(--color-meiyou-divider)] h-9 px-6"
              onClick={handleSaveDraft}
            >
              保存草稿
            </Button>
            <Button
              className="bg-meiyou hover:bg-meiyou-hover text-white h-9 px-8 rounded-lg"
              onClick={handlePublish}
            >
              提交
            </Button>
          </div>
        </div>
      </div>
      {/* 底部占位，防止固定栏遮挡内容 */}
      <div className="h-36" />
    </div>
  );
}
