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
} from 'lucide-react';
import { TimeRangeField, SingleTimeField } from '@/components/activity/time-range-field';
import type {
  TemplateComponent,
  AudienceRule,
  Activity,
  ComponentConfigs,
  HeaderBannerConfig,
  FlashSaleConfig,
  FlashSaleProduct,
  BenefitConfig,
  BenefitProduct,
  RulePopupConfig,
  ComponentAudienceRule,
} from '@/lib/types';
import { mockTemplates } from '@/lib/mock-data';

// ==================== Step Data Types ====================

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
  componentConfigs: ComponentConfigs;
}

// ==================== Constants ====================

const categoryColorMap: Record<string, string> = {
  '年度大促': 'bg-rose-50 text-rose-700 border-rose-200',
  '会员日': 'bg-amber-50 text-amber-700 border-amber-200',
  '固定节日': 'bg-blue-50 text-blue-700 border-blue-200',
};
const defaultCategoryColor = 'bg-slate-50 text-slate-700 border-slate-200';

const defaultCategories = ['会员日', '固定节日', '年度大促'];

const stepConfig = [
  { num: 1, label: '选择模板与基础信息', icon: Puzzle },
  { num: 2, label: '组件配置', icon: Settings2 },
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
      <Label className="text-xs text-slate-500">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          placeholder="输入图片URL"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
        />
        <Button variant="outline" size="sm" type="button">
          <Upload className="h-3.5 w-3.5 mr-1" />
          上传
        </Button>
      </div>
      {value && (
        <div className="mt-1.5 w-20 h-14 rounded border border-slate-200 overflow-hidden bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} className="w-full h-full object-cover" />
        </div>
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
        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
          <Users className="h-3 w-3" />
          受众规则
        </span>
        <Button size="sm" variant="outline" className="h-6 text-xs" onClick={addRule}>
          <Plus className="h-3 w-3 mr-1" />
          添加条件
        </Button>
      </div>
      {rules.length === 0 && (
        <p className="text-xs text-slate-400 py-1">未设置筛选条件，所有用户可见</p>
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
              className="text-slate-400 hover:text-red-500 h-7 w-7 p-0"
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
      {/* 活动分类 */}
      <div>
        <Label className="text-sm font-medium text-slate-700">
          活动分类 <span className="text-rose-500">*</span>
        </Label>
        <div className="mt-1.5">
          <Select
            value={data.category}
            onValueChange={(val) => {
              if (val === '会员日') onChange({ ...data, category: val });
            }}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="选择分类" />
            </SelectTrigger>
            <SelectContent>
              {allCategories.map((cat) => (
                <SelectItem
                  key={cat}
                  value={cat}
                  disabled={cat !== '会员日'}
                >
                  <span className="flex items-center gap-2">
                    {cat}
                    {cat !== '会员日' && (
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        本期不做
                      </span>
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            .map((template) => {
              const isDisabled = template.category !== '会员日';
              return (
                <Card
                  key={template.id}
                  className={`transition-all ${
                    isDisabled
                      ? 'opacity-50 cursor-not-allowed bg-slate-50'
                      : data.templateId === template.id
                        ? 'ring-2 ring-rose-500 border-rose-300 shadow-md cursor-pointer'
                        : 'hover:border-slate-400 hover:shadow-sm cursor-pointer'
                  }`}
                  onClick={() => {
                    if (!isDisabled) handleTemplateSelect(template.id);
                  }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                      <div className="flex items-center gap-1.5">
                        {isDisabled && (
                          <Badge className="bg-slate-100 text-slate-400 border-slate-200 text-[10px]">
                            本期不做
                          </Badge>
                        )}
                        <Badge className={getCategoryColor(template.category)}>
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-xs">{template.description}</CardDescription>
                    <div className="mt-2 text-xs text-slate-400">
                      {template.components.length} 个组件
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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

      {/* 限时福利（组件开关） */}
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
      <p className="text-sm text-slate-500">
        对已启用的组件进行详细配置，关闭的组件无需配置
      </p>

      {/* 氛围头图 */}
      {isComponentEnabled('header_banner') && (
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Image className="h-4 w-4 text-slate-500" />
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

      {/* 限时抢购 */}
      {isComponentEnabled('flash_sale') && (
        <FlashSaleConfigCard
          config={configs.flash_sale || { moduleHeaderImage: '', moduleBgImage: '', products: [] }}
          onChange={(val) => updateConfig('flash_sale', val)}
        />
      )}

      {/* 0元福利 */}
      {isComponentEnabled('free_benefit') && (
        <BenefitConfigCard
          title="0元福利"
          config={configs.free_benefit || { products: [] }}
          onChange={(val) => updateConfig('free_benefit', val)}
        />
      )}

      {/* 专属礼 */}
      {isComponentEnabled('exclusive_gift') && (
        <BenefitConfigCard
          title="专属礼"
          config={configs.exclusive_gift || { products: [] }}
          onChange={(val) => updateConfig('exclusive_gift', val)}
        />
      )}

      {/* 规则弹窗 */}
      {isComponentEnabled('rule_popup') && (
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Image className="h-4 w-4 text-slate-500" />
              规则弹窗
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              const cfg: RulePopupConfig = configs.rule_popup || { iconImage: '', ruleText: '' };
              return (
                <>
                  <ImageUploadField
                    label="规则Icon图片"
                    value={cfg.iconImage}
                    onChange={(val) => updateConfig('rule_popup', { ...cfg, iconImage: val })}
                  />
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-500">规则文本</Label>
                    <Textarea
                      placeholder="请输入活动规则文案，支持文字说明与跳转链接..."
                      rows={5}
                      value={cfg.ruleText}
                      onChange={(e) => updateConfig('rule_popup', { ...cfg, ruleText: e.target.value })}
                    />
                    <p className="text-[10px] text-slate-400">支持直接输入URL作为跳转链接</p>
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ==================== 限时抢购配置卡片 ====================

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
      bookingStartTime: '',
      bookingEndTime: '',
      rushStartTime: '',
      rushEndTime: '',
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
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Image className="h-4 w-4 text-slate-500" />
          限时抢购
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
            <span className="text-sm font-medium text-slate-700">
              福利商品
              <span className="text-xs text-slate-400 ml-1">({config.products.length}个)</span>
            </span>
            <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-white" onClick={addProduct}>
              <Plus className="h-3 w-3 mr-1" />
              添加商品
            </Button>
          </div>

          {config.products.length === 0 && (
            <div className="text-center py-6 text-slate-400 text-sm border rounded-lg border-dashed border-slate-300">
              暂无商品，点击"添加商品"开始配置
            </div>
          )}

          <div className="space-y-4">
            {config.products.map((product, idx) => (
              <Card key={product.id} className="border-slate-200 bg-slate-50/50">
                <CardHeader className="py-3 px-4 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">商品 {idx + 1}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-slate-400 hover:text-red-500 h-7 w-7 p-0"
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
                      <Label className="text-xs text-slate-500">商品ID <span className="text-rose-500">*</span></Label>
                      <Input
                        className="mt-1 h-8 text-sm"
                        placeholder="输入商品ID"
                        value={product.productId}
                        onChange={(e) => updateProduct(product.id, { productId: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">库存 <span className="text-rose-500">*</span></Label>
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
                      <Label className="text-xs text-slate-500">跳转链接</Label>
                      <Input
                        className="mt-1 h-8 text-sm"
                        placeholder="输入跳转链接URL"
                        value={product.jumpLink}
                        onChange={(e) => updateProduct(product.id, { jumpLink: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">推送文案</Label>
                      <Input
                        className="mt-1 h-8 text-sm"
                        placeholder="输入推送文案"
                        value={product.pushText}
                        onChange={(e) => updateProduct(product.id, { pushText: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* 时间配置 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-slate-500">商品预约时间</Label>
                      <TimeRangeField
                        startValue={product.bookingStartTime}
                        endValue={product.bookingEndTime}
                        onStartChange={(val) => updateProduct(product.id, { bookingStartTime: val })}
                        onEndChange={(val) => updateProduct(product.id, { bookingEndTime: val })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-slate-500">商品抢购时间</Label>
                      <TimeRangeField
                        startValue={product.rushStartTime}
                        endValue={product.rushEndTime}
                        onStartChange={(val) => updateProduct(product.id, { rushStartTime: val })}
                        onEndChange={(val) => updateProduct(product.id, { rushEndTime: val })}
                      />
                    </div>
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

// ==================== 0元福利/专属礼配置卡片 ====================

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
    <Card className="border-slate-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Image className="h-4 w-4 text-slate-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-500">
            商品列表
            <span className="text-xs text-slate-400 ml-1">({config.products.length}个)</span>
          </span>
          <Button size="sm" className="bg-rose-500 hover:bg-rose-600 text-white" onClick={addProduct}>
            <Plus className="h-3 w-3 mr-1" />
            添加商品
          </Button>
        </div>

        {config.products.length === 0 && (
          <div className="text-center py-6 text-slate-400 text-sm border rounded-lg border-dashed border-slate-300">
            暂无商品，点击"添加商品"开始配置
          </div>
        )}

        <div className="space-y-3">
          {config.products.map((product, idx) => (
            <div
              key={product.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-white"
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
              <div className="flex-1 grid grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs text-slate-500">商品ID <span className="text-rose-500">*</span></Label>
                  <Input
                    className="mt-1 h-8 text-sm"
                    placeholder="输入商品ID"
                    value={product.productId}
                    onChange={(e) => updateProduct(product.id, { productId: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-500">福利图片</Label>
                  <Input
                    className="mt-1 h-8 text-sm"
                    placeholder="输入图片URL"
                    value={product.benefitImage}
                    onChange={(e) => updateProduct(product.id, { benefitImage: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs text-slate-500">展示方式</Label>
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
                  <Label className="text-xs text-slate-500">排序</Label>
                  <Input
                    className="mt-1 h-8 text-sm"
                    type="number"
                    value={product.sortOrder}
                    onChange={(e) => updateProduct(product.id, { sortOrder: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              {/* 删除按钮 */}
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-400 hover:text-red-500 h-7 w-7 p-0 mt-1"
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
      const rawConfigs = raw.component_configs || raw.componentConfigs || {};
      const componentConfigs = (typeof rawConfigs === 'string' ? JSON.parse(rawConfigs as string) : rawConfigs) as ComponentConfigs;
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
        step1Data.sceneKey !== ''
      );
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
          <h1 className="text-2xl font-semibold text-slate-900">
            {isEdit ? '编辑活动' : '新建活动'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isEdit
              ? '修改活动配置信息'
              : '选定模板与基础信息 → 组件配置，两步完成活动配置'}
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
          {currentStep < 2 ? (
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
