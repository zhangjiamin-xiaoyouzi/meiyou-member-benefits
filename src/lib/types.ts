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

export interface StickyButtonConfig {
  text: string;          // 按钮文案
  color: string;         // 按钮颜色
  jumpLink: string;      // 跳转链接
  reservationSuccessBgImage?: string;  // 预约成功弹窗背景图（仅会员未预约）
}

/** 全局按钮样式配置 */
export interface ButtonStyleConfig {
  styleType?: 'solid' | 'outline';   // 实色按钮 / 线条按钮
  backgroundType?: 'solid' | 'gradient' | 'image';  // 纯色 / 渐变 / 图片
  solidColor?: string;               // 纯色背景颜色值
  gradientStart?: string;            // 渐变色起始颜色
  gradientEnd?: string;              // 渐变色结束颜色
  gradientDirection?: string;        // 渐变方向
  backgroundImage?: string;          // 背景图片 URL
  fontColor?: string;                // 按钮字体颜色
}

export interface GlobalConfig {
  backgroundType: BackgroundType;
  solidColor: string;           // 纯色背景颜色值
  gradientStart: string;        // 渐变色起始颜色
  gradientEnd: string;          // 渐变色结束颜色
  gradientDirection: string;    // 渐变方向：to-right / to-bottom / to-bottom-right 等
  backgroundImage: string;      // 背景图片 URL
  // 吸底按钮配置
  nonMemberButton?: StickyButtonConfig;    // 非会员按钮（无预约时间时展示）
  memberButton?: StickyButtonConfig;       // 会员按钮（无预约时间时展示）
  memberReservedButton?: StickyButtonConfig;  // 会员已预约按钮（有预约时间时展示）
  memberUnreservedButton?: StickyButtonConfig; // 会员未预约按钮（有预约时间时展示）
  // 全局按钮样式
  button?: ButtonStyleConfig;
  // 预约成功弹窗背景图（配置了预约时间时必填）
  bookingSuccessBgImage?: string;
  // 预约通知push文案
  bookingPushText: string;
}

/** 氛围头图配置 */
export interface HeaderBannerConfig {
  imageUrl: string;
  videoUrl: string;
  coverImageUrl: string;
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
  /** 商品图（根据选择的商品自动填充，支持修改） */
  productImage: string;
  /** 获得弹窗商品图 */
  obtainPopupProductImage: string;
  jumpLink: string;
  timeSessions: TimeSession[];
  audienceRules: ComponentAudienceRule[];
}

/** 会员限时福利配置 */
export interface FlashSaleConfig {
  moduleBgImage: string;
  /** 获得弹窗背景图 */
  obtainPopupBgImage: string;
  /** 获得弹窗背景光圈动效 */
  obtainPopupHaloEffect: string;
  /** 获得弹窗标题背景动效 */
  obtainPopupTitleEffect: string;
  products: FlashSaleProduct[];
}

/** 会员专属生活券包/会员专属礼列表项（商品ID为空时=纯图片项，有值时=商品项） */
export interface BenefitProduct {
  id: string;
  /** 商品ID：空=纯图片项，非空=商品项 */
  productId: string;
  /** 图片：商品ID有值时自动填充，支持修改；无商品ID时手动上传 */
  benefitImage: string;
  /** 展示方式：仅商品ID有值时有效 */
  displayMode: 'horizontal' | 'double-column' | 'triple-column';
  /** 跳转链接：商品ID为空时必填，有商品ID时选填 */
  jumpLink: string;
  /** 预约通知push文案 */
  bookingPushText: string;
  sortOrder: number;
  audienceRules: ComponentAudienceRule[];
}

/** 会员专属生活券包/会员专属礼配置 */
export interface BenefitConfig {
  moduleBgImage: string;
  products: BenefitProduct[];
}

/** 会员专属0元购配置 */
/** 类目路径项 */
export interface CategoryPathItem {
  path: string;
  isDefault: boolean;
}

export interface FreePurchaseConfig {
  moduleBgImage: string;
  /** 步骤图 */
  stepImage: string;
  categories: CategoryPathItem[];
  /** @deprecated 使用 categories 替代 */
  categoryIds?: string[];
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
  jumpLink: string;
}

/** 吸底按钮组件配置 */
export interface ActionButtonConfig {
  nonMember: StatusButtonConfig;        // 非会员
  member?: StatusButtonConfig;          // 会员（仅未配置预约时间时展示）
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
  // 支持复制组件的动态 key（如 exclusive_gift_1, free_benefit_2 等）
  [key: string]: unknown;
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

// ==================== 数据库 → 前端映射 ====================

/** 数据库模板行 → 前端 Template */
export function mapTemplateFromDb(row: Record<string, unknown>): Template {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as string,
    description: row.description as string,
    preview: row.preview as string,
    components: (row.components as TemplateComponent[]) || [],
    createdAt: (row.created_at as string) || '',
    createdBy: (row.created_by as string) || '',
    updatedAt: (row.updated_at as string) || '',
    updatedBy: (row.updated_by as string) || '',
  };
}

/** 数据库策略行 → 前端 PromoPatch */
export function mapPromoPatchFromDb(row: Record<string, unknown>): PromoPatch {
  return {
    id: row.id as string,
    name: row.name as string,
    type: row.type as PromoPatchType,
    config: row.config as PriceDiscountConfig | BonusDurationConfig | GiftConfig,
    status: (row.status as 'active' | 'inactive') || 'inactive',
    createdAt: (row.created_at as string) || '',
    updatedAt: (row.updated_at as string) || '',
    createdBy: row.created_by as string | undefined,
    updatedBy: row.updated_by as string | undefined,
  };
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
