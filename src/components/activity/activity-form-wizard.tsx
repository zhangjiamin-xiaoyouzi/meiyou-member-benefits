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
import { GripVertical, Plus } from 'lucide-react';
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
  Image,
  Upload,
  Trash2,
  Users,
  Tag,
  ChevronUp,
  ChevronDown,
  MousePointerClick,
  Search,
} from 'lucide-react';
import { TimeRangeField, SingleTimeField } from '@/components/activity/time-range-field';
import type {
  TemplateComponent,
  AudienceRule,
  Activity,
  ComponentConfigs,
  GlobalConfig,
  HeaderBannerConfig,
  WelfareProductConfig,
  WelfareProductItem,
  FreePurchaseConfig,
  FlashSaleConfig,
  FlashSaleProduct,
  TimeSession,
  ActionButtonConfig,
  StatusButtonConfig,
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
  hideComponentsSection,
}: {
  data: Step1Data;
  onChange: (data: Step1Data) => void;
  isEdit: boolean;
  hideComponentsSection?: boolean;
}) {
  const selectedTemplate = mockTemplates.find((t) => t.id === data.templateId);
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
    const template = mockTemplates.find((t) => t.id === templateId);
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
      {/* 活动分类 独占一行 */}
      <div>
          <Label className="text-sm font-medium text-[var(--color-meiyou-text-primary)]">
            活动分类 <span className="text-meiyou">*</span>
          </Label>
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
        <Label className="text-sm font-medium text-[var(--color-meiyou-text-primary)]">
          选择活动模版 <span className="text-meiyou">*</span>
        </Label>
        <div className="mt-2 grid grid-cols-3 gap-2">
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
          {/* 活动福利领取时间（必填）独占一行 */}
          <div>
              <Label className="text-xs text-[var(--color-meiyou-text-secondary)]">
                {isMemberDay ? '活动福利领取时间' : '抽奖时间'}<span className="text-[#ff4d88] ml-0.5">*</span>
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
}: {
  id: string;
  sectionId: string;
  comp: TemplateComponent;
  children: React.ReactNode;
  onRemove?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const [collapsed, setCollapsed] = useState(false);

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto' as never,
  };

  return (
    <div ref={setNodeRef} style={style} id={sectionId}>
      <Card className="border-[var(--color-meiyou-border)]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* 拖拽手柄 */}
              <button
                type="button"
                className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <CardTitle className="text-sm flex items-center gap-2">
                {comp.name}
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
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed
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
        {!collapsed && <CardContent>{children}</CardContent>}
      </Card>
    </div>
  );
}

// ==================== 可拖拽导航项（HTML5 Drag） ====================

function DraggableNavItem({
  comp,
  onReorder,
}: {
  comp: TemplateComponent;
  onReorder: (dragKey: string, overKey: string) => void;
}) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      className={`flex items-center gap-1.5 w-full text-left px-2 py-1.5 rounded text-xs transition-colors truncate group ${
        isDragOver
          ? 'border-t-2 border-[var(--color-meiyou)] bg-[rgba(255,77,136,0.06)]'
          : 'text-[var(--color-meiyou-text-primary)] hover:bg-[var(--color-meiyou-bg-secondary)]'
      }`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', comp.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const dragId = e.dataTransfer.getData('text/plain');
        if (dragId && dragId !== comp.id) {
          onReorder(dragId, comp.id);
        }
      }}
    >
      {/* 拖拽手柄 */}
      <GripVertical className="h-3 w-3 opacity-0 group-hover:opacity-60 text-gray-400 shrink-0 cursor-grab" />
      {/* 点击滚动到对应区域 */}
      <button
        type="button"
        className="flex-1 text-left truncate"
        onClick={() => {
          const el = document.getElementById(`comp-section-${comp.id}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
      >
        {comp.name}
      </button>
    </div>
  );
}

// ==================== 组件配置区域（单页面，支持添加+拖拽排序） ====================

function StepComponentConfig({
  data,
  onChange,
  components,
  onComponentsChange,
}: {
  data: Step2Data;
  onChange: (data: Step2Data) => void;
  components: TemplateComponent[];
  onComponentsChange: (components: TemplateComponent[]) => void;
}) {
  const configs = data.componentConfigs;
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [pendingAddKeys, setPendingAddKeys] = useState<Set<string>>(new Set());
  const [addMenuPosition, setAddMenuPosition] = useState({ x: 0, y: 0, left: 0 });

  const updateConfig = (key: string, value: unknown) => {
    onChange({
      ...data,
      componentConfigs: { ...configs, [key]: value },
    });
  };

  // 已添加的组件（enabled 的）
  const enabledComponents = components.filter((c) => c.enabled);
  // 可添加的组件（非必选且未启用的，welfare_product 去重只显示一个）
  const availableComponents = (() => {
    const seen = new Set<string>();
    return components.filter((c) => {
      if (c.required || c.enabled) return false;
      if (c.key === 'welfare_product') {
        // 检查是否已达上限
        const wpCount = components.filter((x) => x.key === 'welfare_product' && x.enabled).length;
        const maxCount = c.maxCount || 5;
        if (wpCount >= maxCount) return false;
        if (seen.has('welfare_product')) return false;
        seen.add('welfare_product');
      }
      return true;
    });
  })();

  // 添加组件
  const handleAddComponent = (comp: TemplateComponent) => {
    if (comp.key === 'welfare_product') {
      const wpCount = components.filter((x) => x.key === 'welfare_product' && x.enabled).length;
      const maxCount = comp.maxCount || 5;
      if (wpCount >= maxCount) return;
      const newId = `comp_wp_${Date.now()}`;
      const defaultName = wpCount === 0 ? '会员专属礼' : wpCount === 1 ? '会员专属生活券包' : `福利分组${wpCount + 1}`;
      const newComp: TemplateComponent = { ...comp, id: newId, name: defaultName, enabled: true };
      const updated = [...components, newComp];
      onComponentsChange(updated);
      updateConfig(newId, {
        instanceName: defaultName,
        products: [],
        displayMode: 'single',
        buttonTheme: 'pink',
      });
    } else {
      const updated = components.map((c) =>
        c.key === comp.key ? { ...c, enabled: true } : c
      );
      onComponentsChange(updated);
    }
  };

  // 批量添加组件
  const handleBatchAddComponents = () => {
    if (pendingAddKeys.size === 0) return;
    let updated = [...components];
    const newConfigs: Record<string, unknown> = {};
    for (const key of pendingAddKeys) {
      if (key === 'welfare_product') {
        const wpCount = updated.filter((x) => x.key === 'welfare_product' && x.enabled).length;
        const maxCount = 5;
        if (wpCount < maxCount) {
          const comp = components.find((c) => c.key === 'welfare_product');
          if (comp) {
            const newId = `comp_wp_${Date.now()}_${wpCount}`;
            const defaultName = wpCount === 0 ? '会员专属礼' : wpCount === 1 ? '会员专属生活券包' : `福利分组${wpCount + 1}`;
            const newComp: TemplateComponent = { ...comp, id: newId, name: defaultName, enabled: true };
            updated = [...updated, newComp];
            newConfigs[newId] = { instanceName: defaultName, products: [], displayMode: 'single', buttonTheme: 'pink' };
          }
        }
      } else {
        updated = updated.map((c) =>
          c.key === key ? { ...c, enabled: true } : c
        );
      }
    }
    onComponentsChange(updated);
    if (Object.keys(newConfigs).length > 0) {
      onChange({ ...data, componentConfigs: { ...configs, ...newConfigs } });
    }
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
  const handleRemoveComponent = (compId: string) => {
    const comp = components.find((c) => c.id === compId);
    if (!comp) return;
    if (comp.key === 'welfare_product') {
      // 删除整个 welfare_product 实例
      const updated = components.filter((c) => c.id !== compId);
      onComponentsChange(updated);
    } else {
      const updated = components.map((c) =>
        c.id === compId ? { ...c, enabled: false } : c
      );
      onComponentsChange(updated);
    }
  };

  // 拖拽排序
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // 将排序后的 enabled 列表合并回完整的 components 数组（保留 disabled 组件的原始位置）
  const mergeReorderedEnabled = (newEnabled: TemplateComponent[]) => {
    const enabledIdSet = new Set(newEnabled.map((c) => c.id));
    let enabledIdx = 0;
    return components.map((c) => {
      if (enabledIdSet.has(c.id)) {
        return newEnabled[enabledIdx++];
      }
      return c;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = enabledComponents.findIndex((c) => c.id === active.id);
    const newIndex = enabledComponents.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newEnabled = arrayMove(enabledComponents, oldIndex, newIndex);
    onComponentsChange(mergeReorderedEnabled(newEnabled));
  };

  // 导航栏拖拽排序回调
  const handleNavReorder = (dragId: string, overId: string) => {
    const oldIndex = enabledComponents.findIndex((c) => c.id === dragId);
    const newIndex = enabledComponents.findIndex((c) => c.id === overId);
    if (oldIndex === -1 || newIndex === -1) return;
    const newEnabled = arrayMove(enabledComponents, oldIndex, newIndex);
    onComponentsChange(mergeReorderedEnabled(newEnabled));
  };

  // 渲染单个组件的配置内容
  const renderComponentContent = (comp: { id: string; key: string; name: string; enabled: boolean; required: boolean; description?: string; maxCount?: number }) => {
    const compKey = comp.key;
    // For welfare_product, use component id as config key
    const configKey = compKey === 'welfare_product' ? comp.id : compKey;
    switch (compKey) {
      case 'global_config':
        return (
          <GlobalConfigCard
            config={configs.global_config || { ...defaultGlobalConfig }}
            onChange={(val) => updateConfig('global_config', val)}
          />
        );
      case 'header_banner':
        return (() => {
          const cfg = configs.header_banner || { imageUrl: '' };
          return (
            <ImageUploadField
              label="氛围头图"
              value={cfg.imageUrl}
              onChange={(val) => updateConfig('header_banner', { ...cfg, imageUrl: val })}
            />
          );
        })();
      case 'rule_popup':
        return (() => {
          const cfg: RulePopupConfig = configs.rule_popup || { iconImage: '', ruleRichText: '' };
          return (
            <div className="space-y-4">
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
            </div>
          );
        })();
      case 'welfare_product':
        return (
          <WelfareProductCard
            componentName={comp.name}
            onNameChange={(newName) => {
              const updatedComps = enabledComponents.map(c =>
                c.id === comp.id ? { ...c, name: newName } : c
              );
              onComponentsChange(updatedComps);
            }}
            config={(configs as Record<string, WelfareProductConfig>)[configKey] || { products: [] }}
            onChange={(val) => updateConfig(configKey, val)}
          />
        );
      case 'flash_sale':
        return (
          <FlashSaleConfigCard
            config={configs.flash_sale || { moduleBgImage: '', products: [] }}
            onConfigChange={(val) => updateConfig('flash_sale', val)}
          />
        );
      case 'free_purchase':
        return (
          <FreePurchaseConfigCard
            config={configs.free_purchase || { categoryIds: [], moduleBgImage: '' }}
            onChange={(val) => updateConfig('free_purchase', val)}
          />
        );
      case 'cta_button':
        return (() => {
          const cfg: ActionButtonConfig = configs.cta_button || {
            nonMember: { buttonText: '', buttonColor: '', jumpLink: '' },
            memberBooked: { buttonText: '', buttonColor: '', jumpLink: '' },
            memberNotBooked: { buttonText: '', buttonColor: '', jumpLink: '' },
          };
          const updateStatus = (status: 'nonMember' | 'memberBooked' | 'memberNotBooked', field: keyof StatusButtonConfig, value: string) => {
            updateConfig('cta_button', {
              ...cfg,
              [status]: { ...cfg[status], [field]: value },
            });
          };
          const statuses: { key: 'nonMember' | 'memberBooked' | 'memberNotBooked'; label: string; desc: string }[] = [
            { key: 'nonMember', label: '非会员', desc: '未开通会员的用户看到的按钮' },
            { key: 'memberNotBooked', label: '会员未预约', desc: '已开通会员但未预约的用户看到的按钮' },
            { key: 'memberBooked', label: '会员已预约', desc: '已预约成功的会员看到的按钮' },
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
                      <Label className="text-[11px] text-[var(--color-meiyou-text-secondary)]">按钮文案</Label>
                      <Input
                        placeholder="如：立即开通"
                        value={cfg[key].buttonText}
                        onChange={(e) => updateStatus(key, 'buttonText', e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] text-[var(--color-meiyou-text-secondary)]">按钮颜色</Label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={cfg[key].buttonColor || '#ff4d88'}
                          onChange={(e) => updateStatus(key, 'buttonColor', e.target.value)}
                          className="h-8 w-8 rounded border border-[var(--color-meiyou-border)] cursor-pointer"
                        />
                        <Input
                          value={cfg[key].buttonColor || '#ff4d88'}
                          onChange={(e) => updateStatus(key, 'buttonColor', e.target.value)}
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

  return (
    <div className="relative">
      {/* 右侧悬浮组件目录 */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-30 w-44">
        <div className="bg-white/95 backdrop-blur-sm border border-[var(--color-meiyou-border)] rounded-lg shadow-lg px-2 py-3">
          <h4 className="text-[11px] font-semibold text-[var(--color-meiyou-text-secondary)] mb-2 px-1">组件目录</h4>
          <nav className="space-y-0.5">
            {enabledComponents.map((comp) => (
              <DraggableNavItem
                key={comp.id}
                comp={comp}
                onReorder={handleNavReorder}
              />
            ))}
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

      {/* 组件列表（dnd-kit 拖拽排序） */}
      <div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={enabledComponents.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {enabledComponents.map((comp) => (
                  <SortableComponentItem
                    key={comp.id}
                    id={comp.id}
                    sectionId={`comp-section-${comp.id}`}
                    comp={comp}
                    onRemove={!comp.required ? () => handleRemoveComponent(comp.id) : undefined}
                  >
                    {renderComponentContent(comp)}
                  </SortableComponentItem>
                ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* 添加组件下拉菜单（在悬浮目录左侧弹出） */}
      {addMenuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setAddMenuOpen(false); setPendingAddKeys(new Set()); }} />
          <div
            className="fixed z-50 bg-white border border-[var(--color-meiyou-border)] rounded-lg shadow-xl overflow-hidden"
            style={{
              top: addMenuPosition.y + 4,
              left: addMenuPosition.left - 248,
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

/** 福利项下拉选择组件（支持关键词检索） */
interface WelfareItem {
  id: string;
  name: string;
}

function WelfareSelect({
  value,
  onChange,
  placeholder = '选择福利',
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
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
          <span className="flex-1 text-[var(--color-meiyou-text-placeholder)]">{placeholder}</span>
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
                      setOpen(false);
                      setKeyword('');
                    }}
                  >
                    <span className="flex-1 truncate">{item.id}-{item.name}</span>
                    {value === item.id && <Check className="h-3.5 w-3.5 shrink-0 text-[var(--color-meiyou-primary)]" />}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
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
    <div className="space-y-4">
      <div className="space-y-4">
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
      </div>
    </div>
  );
}

// ==================== 通用福利商品配置卡片 ====================

const MAX_WELFARE_INSTANCES = 5;

function WelfareProductCard({
  componentName,
  onNameChange,
  config,
  onChange,
}: {
  componentName: string;
  onNameChange: (name: string) => void;
  config: WelfareProductConfig;
  onChange: (config: WelfareProductConfig) => void;
}) {
  const products = config.products || [];

  const addProduct = () => {
    const newProduct: WelfareProductItem = {
      id: `wp_${Date.now()}`,
      productId: '',
      benefitImage: '',
      displayMode: 'horizontal',
      sortOrder: 0,
      audienceRules: [],
    };
    onChange({ ...config, products: [...products, newProduct] });
  };

  const removeProduct = (productId: string) => {
    onChange({ ...config, products: products.filter((p) => p.id !== productId) });
  };

  const updateProduct = (productId: string, updates: Partial<WelfareProductItem>) => {
    onChange({
      ...config,
      products: products.map((p) => (p.id === productId ? { ...p, ...updates } : p)),
    });
  };

  const moveProduct = (productId: string, direction: 'up' | 'down') => {
    const idx = products.findIndex((p) => p.id === productId);
    if (idx < 0) return;
    const newProducts = [...products];
    if (direction === 'up' && idx > 0) {
      [newProducts[idx - 1], newProducts[idx]] = [newProducts[idx], newProducts[idx - 1]];
    } else if (direction === 'down' && idx < newProducts.length - 1) {
      [newProducts[idx], newProducts[idx + 1]] = [newProducts[idx + 1], newProducts[idx]];
    }
    onChange({ ...config, products: newProducts.map((p, i) => ({ ...p, sortOrder: i + 1 })) });
  };

  return (
    <div className="space-y-4">
      {/* 组件名称 */}
      <div>
        <Label className="text-sm text-[var(--color-meiyou-text-secondary)]">组件名称</Label>
        <Input
          value={componentName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="输入组件名称"
          className="mt-1 bg-white border-[var(--color-meiyou-border)] rounded-lg h-9 text-sm focus:ring-meiyou/30 focus:border-meiyou"
        />
      </div>
      {/* 商品列表 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-[var(--color-meiyou-text-secondary)]">
            商品列表
            <span className="text-xs text-[var(--color-meiyou-text-placeholder)] ml-1">({products.length}个)</span>
          </span>
          <Button size="sm" className="bg-meiyou hover:bg-meiyou-hover text-white" onClick={addProduct}>
            <Plus className="h-3 w-3 mr-1" />
            添加商品
          </Button>
        </div>

        {products.length === 0 && (
          <div className="text-center py-6 text-[var(--color-meiyou-text-placeholder)] text-sm border rounded-lg border-dashed border-[var(--color-meiyou-divider)]">
            暂无商品，点击"添加商品"开始配置
          </div>
        )}

        <div className="space-y-3">
          {products.map((product, idx) => (
            <div
              key={product.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-[var(--color-meiyou-border)] bg-meiyou-bg/50"
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
                  disabled={idx === products.length - 1}
                  onClick={() => moveProduct(product.id, 'down')}
                >
                  <ChevronLeft className="h-3 w-3 -rotate-90" />
                </Button>
              </div>

              {/* 商品字段 */}
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs text-[var(--color-meiyou-text-secondary)]">商品ID <span className="text-meiyou">*</span></Label>
                    <WelfareSelect
                      value={product.productId}
                      onChange={(val) => updateProduct(product.id, { productId: val })}
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
                className="text-[var(--color-meiyou-text-placeholder)] hover:text-red-500 h-7 w-7 p-0 mt-1 shrink-0"
                onClick={() => removeProduct(product.id)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** 会员限时福利配置卡片 */
function FlashSaleConfigCard({
  config,
  onConfigChange,
}: {
  config: FlashSaleConfig;
  onConfigChange: (config: FlashSaleConfig) => void;
}) {
  const products = config.products || [];

  const addProduct = () => {
    onConfigChange({
      ...config,
      products: [
        ...products,
        {
          id: `p_${Date.now()}`,
          productId: '',
          stock: '',
          rushImage: '',
          benefitImage: '',
          popupImage: '',
          jumpLink: '',
          timeSessions: [],
          audienceRules: [],
        } as FlashSaleProduct,
      ],
    });
  };

  const removeProduct = (index: number) => {
    onConfigChange({
      ...config,
      products: products.filter((_: FlashSaleProduct, i: number) => i !== index),
    });
  };

  const updateProduct = (index: number, field: string, value: string | TimeSession[] | ComponentAudienceRule[]) => {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    onConfigChange({ ...config, products: updated });
  };

  return (
    <div className="space-y-4">
      {/* 模块背景图 */}
      <div>
        <Label className="text-sm text-foreground/80">模块背景图</Label>
        <div className="mt-1.5">
          <Input
            value={config.moduleBgImage || ''}
            onChange={(e) => onConfigChange({ ...config, moduleBgImage: e.target.value })}
            placeholder="输入模块背景图URL"
            className="w-full"
          />
        </div>
      </div>

      {/* 商品列表 */}
      <div className="flex items-center justify-between">
        <Label className="text-sm text-foreground/80">限时福利商品</Label>
        <Button type="button" variant="outline" size="sm" onClick={addProduct}>
          <Plus className="h-3 w-3 mr-1" /> 添加商品
        </Button>
      </div>

      {products.map((product: FlashSaleProduct, index: number) => (
        <Card key={product.id} className="border border-dashed border-border/60">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground/80">商品 {index + 1}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeProduct(index)} className="text-destructive hover:text-destructive h-6 px-2">
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>

            <div>
              <Label className="text-xs text-foreground/60">商品ID</Label>
              <div className="mt-1">
                <WelfareSelect
                  value={product.productId}
                  onChange={(val: string) => updateProduct(index, 'productId', val)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-foreground/60">库存</Label>
                <Input
                  value={product.stock}
                  onChange={(e) => updateProduct(index, 'stock', e.target.value)}
                  placeholder="库存数量"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-foreground/60">跳转链接</Label>
                <Input
                  value={product.jumpLink}
                  onChange={(e) => updateProduct(index, 'jumpLink', e.target.value)}
                  placeholder="跳转链接"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-foreground/60">抢购图</Label>
                <Input
                  value={product.rushImage}
                  onChange={(e) => updateProduct(index, 'rushImage', e.target.value)}
                  placeholder="抢购图URL"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-foreground/60">权益图</Label>
                <Input
                  value={product.benefitImage}
                  onChange={(e) => updateProduct(index, 'benefitImage', e.target.value)}
                  placeholder="权益图URL"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-foreground/60">弹窗图</Label>
              <Input
                value={product.popupImage}
                onChange={(e) => updateProduct(index, 'popupImage', e.target.value)}
                placeholder="弹窗图URL"
                className="mt-1"
              />
            </div>

            {/* 时段配置 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-xs text-foreground/60">抢购时段</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const sessions = [...(product.timeSessions || [])];
                    sessions.push({ id: `ts_${Date.now()}`, bookingStartTime: '', bookingEndTime: '', rushStartTime: '', rushEndTime: '' });
                    updateProduct(index, 'timeSessions', sessions);
                  }}
                  className="h-5 px-1.5 text-xs text-primary"
                >
                  <Plus className="h-3 w-3 mr-0.5" /> 添加时段
                </Button>
              </div>
              <div className="space-y-2">
                {(product.timeSessions || []).map((session: TimeSession, si: number) => (
                  <div key={session.id || si} className="space-y-1.5 rounded-md border border-border/40 p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground/50">时段 {si + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const sessions = (product.timeSessions || []).filter((_: TimeSession, i: number) => i !== si);
                          updateProduct(index, 'timeSessions', sessions);
                        }}
                        className="h-5 w-5 p-0 text-destructive hover:text-destructive shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-foreground/40">预约开始</Label>
                        <Input
                          type="time"
                          value={session.bookingStartTime}
                          onChange={(e) => {
                            const sessions = [...(product.timeSessions || [])];
                            sessions[si] = { ...sessions[si], bookingStartTime: e.target.value };
                            updateProduct(index, 'timeSessions', sessions);
                          }}
                          className="mt-0.5"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-foreground/40">预约结束</Label>
                        <Input
                          type="time"
                          value={session.bookingEndTime}
                          onChange={(e) => {
                            const sessions = [...(product.timeSessions || [])];
                            sessions[si] = { ...sessions[si], bookingEndTime: e.target.value };
                            updateProduct(index, 'timeSessions', sessions);
                          }}
                          className="mt-0.5"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-foreground/40">抢购开始</Label>
                        <Input
                          type="time"
                          value={session.rushStartTime}
                          onChange={(e) => {
                            const sessions = [...(product.timeSessions || [])];
                            sessions[si] = { ...sessions[si], rushStartTime: e.target.value };
                            updateProduct(index, 'timeSessions', sessions);
                          }}
                          className="mt-0.5"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-foreground/40">抢购结束</Label>
                        <Input
                          type="time"
                          value={session.rushEndTime}
                          onChange={(e) => {
                            const sessions = [...(product.timeSessions || [])];
                            sessions[si] = { ...sessions[si], rushEndTime: e.target.value };
                            updateProduct(index, 'timeSessions', sessions);
                          }}
                          className="mt-0.5"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

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
    <div className="space-y-4">
      <div>
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
      const rawInitial = initialData as unknown as Record<string, unknown>;
      const rawConfigs = rawInitial.component_configs || rawInitial.componentConfigs || {};
      const parsed = (typeof rawConfigs === 'string' ? JSON.parse(rawConfigs as string) : rawConfigs) as Record<string, unknown>;
      // Deep clone to avoid mutating props
      const componentConfigs: Record<string, unknown> = JSON.parse(JSON.stringify(parsed));
      // Migrate old exclusive_gift and free_benefit to welfare_product instances
      const egConfig = componentConfigs.exclusive_gift as Record<string, unknown> | undefined;
      const fbConfig = componentConfigs.free_benefit as Record<string, unknown> | undefined;
      if (egConfig) {
        const wpId = `wp_${Date.now()}_1`;
        componentConfigs[wpId] = {
          instanceName: '会员专属礼',
          products: Array.isArray((egConfig as Record<string, unknown>).products) ? ((egConfig as Record<string, unknown>).products as WelfareProductItem[]) : [],
          displayMode: 'single',
          buttonTheme: 'pink',
        };
        delete componentConfigs.exclusive_gift;
      }
      if (fbConfig) {
        const wpId = `wp_${Date.now()}_2`;
        componentConfigs[wpId] = {
          instanceName: '会员专属生活券包',
          products: Array.isArray((fbConfig as Record<string, unknown>).products) ? ((fbConfig as Record<string, unknown>).products as WelfareProductItem[]) : [],
          displayMode: 'single',
          buttonTheme: 'pink',
        };
        delete componentConfigs.free_benefit;
      }
      return { componentConfigs: componentConfigs as unknown as ComponentConfigs };
    }
    return { componentConfigs: {} as unknown as ComponentConfigs };
  });

  const isFormValid = () => {
    return (
      step1Data.templateId !== '' &&
      step1Data.name !== '' &&
      step1Data.category !== '' &&
      step1Data.sellStartTime !== '' &&
      step1Data.bufferEndTime !== ''
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
        </div>

      </div>

      {/* 单页配置：基础信息 + 活动组件 */}
      <Card className="mr-52">
        <CardContent className="pt-6 space-y-6">
          {/* 基础信息 */}
          <div>
            <h3 className="text-base font-semibold text-[var(--color-meiyou-text-primary)] mb-4 pb-2 border-b border-[var(--color-meiyou-divider)]">基础信息</h3>
            <StepBasicInfo data={step1Data} onChange={setStep1Data} isEdit={isEdit} hideComponentsSection />
          </div>

          {/* 活动组件 */}
          <div>
            <h3 className="text-base font-semibold text-[var(--color-meiyou-text-primary)] mb-4 pb-2 border-b border-[var(--color-meiyou-divider)]">活动组件</h3>
            <StepComponentConfig
              data={step2Data}
              onChange={setStep2Data}
              components={step1Data.components}
              onComponentsChange={(comps) => setStep1Data((prev) => ({ ...prev, components: comps }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* 底部操作栏 */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          className="border-[var(--color-meiyou-divider)]"
          onClick={() => router.push('/activities')}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          返回列表
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-[var(--color-meiyou-divider)]" onClick={() => window.close()}>
            取消
          </Button>
          <Button
            className="bg-meiyou hover:bg-meiyou-hover text-white h-10 rounded-lg"
            onClick={handlePublish}
          >
            提交
          </Button>
        </div>
      </div>
    </div>
  );
}
