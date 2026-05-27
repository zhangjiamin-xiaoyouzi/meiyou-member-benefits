// ==================== 模板管理类型 ====================

// 模板分类
export const TEMPLATE_CATEGORIES = ['会员日', '固定节日', '年度大促'] as const;

// 活动分类（支持自定义扩展）
export const DEFAULT_CATEGORIES = ['促活', '转化', '拉新'] as const;

export interface TemplateComponent {
  id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  required: boolean; // 是否必选组件（不可关闭）
}

export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  preview: string; // 预览图 URL
  components: TemplateComponent[];
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

// ==================== 营销策略库类型 ====================

export type PromoPatchType = 'price_discount' | 'bonus_duration' | 'gift';

export interface PriceDiscountConfig {
  targetPlanId: string;
  targetPlanName: string;
  discountAmount: number;
  discountUnit: 'yuan' | 'percent';
}

export interface BonusDurationConfig {
  bonusDays: number;
  targetPlanIds: string[];
  targetPlanNames: string[];
}

export interface GiftConfig {
  giftName: string;
  giftType: 'physical' | 'coupon' | 'virtual';
  couponPoolId?: string;
  stockCount: number;
}

export interface PromoPatch {
  id: string;
  name: string;
  type: PromoPatchType;
  config: PriceDiscountConfig | BonusDurationConfig | GiftConfig;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// ==================== 活动配置类型 ====================

export type ActivityStatus = 'draft' | 'scheduled' | 'active' | 'expired';

export interface TimeConfig {
  sellStartTime: string;
  sellEndTime: string;
  lotteryStartTime?: string;
  lotteryEndTime?: string;
  bufferEndTime?: string;
  refundCutoffTime?: string;
}

export interface AudienceRule {
  id: string;
  field: string;
  label: string;
  operator: string;
  value: string | string[];
}

export interface ShelfItem {
  id: string;
  planId: string;
  planName: string;
  isMainPush: boolean;
  sortOrder: number;
  patchIds: string[];
}

export interface AudienceGroup {
  id: string;
  name: string;
  rules: AudienceRule[];
  shelves: ShelfItem[];
}

export interface LotteryConfig {
  enabled: boolean;
  poolId: string;
  poolName: string;
}

export interface MaterialConfig {
  headerBanner?: string;
  ruleText?: string;
  popupBg?: string;
  marqueeText?: string;
}

// ==================== 会员日组件配置类型 ====================

/** 氛围头图配置 */
export interface HeaderBannerConfig {
  imageUrl: string;
}

/** 受众规则（组件级别） */
export interface ComponentAudienceRule {
  id: string;
  field: string;
  label: string;
  operator: string;
  value: string | string[];
}

/** 限时抢购-福利商品 */
/** 抢购场次（预约+抢购时间对） */
export interface TimeSession {
  id: string;
  bookingStartTime: string;
  bookingEndTime: string;
  rushStartTime: string;
  rushEndTime: string;
}

export interface FlashSaleProduct {
  id: string;
  productId: string;
  stock: string;
  rushImage: string;
  benefitImage: string;
  popupImage: string;
  jumpLink: string;
  pushText: string;
  timeSessions: TimeSession[];
  audienceRules: ComponentAudienceRule[];
}

/** 限时抢购配置 */
export interface FlashSaleConfig {
  moduleHeaderImage: string;
  moduleBgImage: string;
  products: FlashSaleProduct[];
}

/** 0元福利/专属礼商品 */
export interface BenefitProduct {
  id: string;
  productId: string;
  benefitImage: string;
  displayMode: 'horizontal' | 'double-column';
  sortOrder: number;
  audienceRules: ComponentAudienceRule[];
}

/** 0元福利/专属礼配置 */
export interface BenefitConfig {
  products: BenefitProduct[];
}

/** 0元购配置 */
export interface FreePurchaseConfig {
  categoryIds: string[];
}

/** 规则弹窗配置 */
export interface RulePopupConfig {
  iconImage: string;
  ruleText: string;
}

/** 组件配置集合 */
export interface ComponentConfigs {
  header_banner?: HeaderBannerConfig;
  flash_sale?: FlashSaleConfig;
  free_benefit?: BenefitConfig;
  exclusive_gift?: BenefitConfig;
  free_purchase?: FreePurchaseConfig;
  rule_popup?: RulePopupConfig;
}

export interface Activity {
  id: string;
  name: string;
  category: string;
  templateId: string;
  templateName: string;
  status: ActivityStatus;
  timeConfig: TimeConfig;
  audienceGroups: AudienceGroup[];
  lotteryConfig: LotteryConfig;
  materialConfig: MaterialConfig;
  components: Record<string, boolean>; // 组件开关状态
  componentConfigs?: ComponentConfigs; // 组件详细配置
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// ==================== 通用类型 ====================

export interface Plan {
  id: string;
  name: string;
  price: number;
  duration: string;
  type: 'monthly' | 'quarterly' | 'yearly';
}

export interface LotteryPool {
  id: string;
  name: string;
  sceneCode: string;
  status: 'active' | 'inactive';
}
