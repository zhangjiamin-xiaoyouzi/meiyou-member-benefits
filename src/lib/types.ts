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

export type ActivityStatus = 'draft' | 'pending' | 'active' | 'ended';

export interface TimeConfig {
  activityStartTime: string;
  activityEndTime: string;
  sellStartTime: string;
  sellEndTime: string;
  bookingStartTime?: string;
  bookingEndTime?: string;
  claimStartTime?: string;
  claimEndTime?: string;
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
  ruleRichText?: string;
  popupBg?: string;
  marqueeText?: string;
}

// ==================== 会员日组件配置类型 ====================

/** 全局配置 */
export type BackgroundType = 'solid' | 'gradient' | 'image';

export interface GlobalConfig {
  backgroundType: BackgroundType;
  solidColor: string;           // 纯色背景颜色值
  gradientStart: string;        // 渐变色起始颜色
  gradientEnd: string;          // 渐变色结束颜色
  gradientDirection: string;    // 渐变方向：to-right / to-bottom / to-bottom-right 等
  backgroundImage: string;      // 背景图片 URL
}

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

/** 会员限时福利-福利商品 */
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
  timeSessions: TimeSession[];
  audienceRules: ComponentAudienceRule[];
}

/** 会员限时福利配置 */
export interface FlashSaleConfig {
  moduleHeaderImage: string;
  moduleBgImage: string;
  products: FlashSaleProduct[];
}

/** 会员专属生活券包/会员专属礼商品 */
export interface BenefitProduct {
  id: string;
  productId: string;
  benefitImage: string;
  displayMode: 'horizontal' | 'double-column';
  sortOrder: number;
  audienceRules: ComponentAudienceRule[];
}

/** 会员专属生活券包/会员专属礼配置 */
export interface BenefitConfig {
  moduleHeaderImage: string;
  moduleBgImage: string;
  products: BenefitProduct[];
}

/** 会员专属0元购配置 */
export interface FreePurchaseConfig {
  moduleHeaderImage: string;
  moduleBgImage: string;
  categoryIds: string[];
}

/** 规则弹窗配置 */
export interface RulePopupConfig {
  iconImage: string;
  ruleRichText: string;
}

/** 按钮组件单阶段配置 */
/** 按钮状态配置 */
export interface StatusButtonConfig {
  buttonText: string;
  buttonColor: string;
  jumpLink: string;
}

/** 吸底按钮组件配置 */
export interface ActionButtonConfig {
  nonMember: StatusButtonConfig;        // 非会员
  memberBooked: StatusButtonConfig;     // 会员已预约
  memberNotBooked: StatusButtonConfig;  // 会员未预约
}

/** 组件配置集合 */
export interface ComponentConfigs {
  global_config?: GlobalConfig;
  header_banner?: HeaderBannerConfig;
  flash_sale?: FlashSaleConfig;
  free_benefit?: BenefitConfig;
  exclusive_gift?: BenefitConfig;
  free_purchase?: FreePurchaseConfig;
  rule_popup?: RulePopupConfig;
  cta_button?: ActionButtonConfig;
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
