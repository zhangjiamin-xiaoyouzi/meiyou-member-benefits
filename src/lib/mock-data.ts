import type { Template, PromoPatch, Activity, Plan, LotteryPool } from './types';
import { DEFAULT_CATEGORIES } from './types';
import { TEMPLATE_CATEGORIES } from './types';

// ==================== 模板分类 ====================
export const templateCategories: string[] = [...TEMPLATE_CATEGORIES];

// ==================== 模拟产品套餐数据 ====================
export const mockPlans: Plan[] = [
  { id: 'plan_001', name: '连续包月', price: 18, duration: '1个月', type: 'monthly' },
  { id: 'plan_002', name: '单月会员', price: 25, duration: '1个月', type: 'monthly' },
  { id: 'plan_003', name: '季度会员', price: 58, duration: '3个月', type: 'quarterly' },
  { id: 'plan_004', name: '年卡会员', price: 178, duration: '12个月', type: 'yearly' },
  { id: 'plan_005', name: '连续包年', price: 148, duration: '12个月', type: 'yearly' },
];

// ==================== 模拟奖池数据 ====================
export const mockLotteryPools: LotteryPool[] = [
  { id: 'pool_001', name: '618大促奖池', sceneCode: 'promo_618', status: 'active' },
  { id: 'pool_002', name: '会员日奖池', sceneCode: 'member_day', status: 'active' },
  { id: 'pool_003', name: '新人专享奖池', sceneCode: 'new_user', status: 'active' },
  { id: 'pool_004', name: '感恩节奖池', sceneCode: 'thanksgiving', status: 'inactive' },
];

// ==================== 模拟模板数据 ====================
export const mockTemplates: Template[] = [
  {
    id: 'tpl_001',
    name: '大促抽奖模板',
    category: '年度大促',
    description: '适用于618、双11等S级大促活动，预留头图、互动红包、大/小卡货架、扭蛋机抽奖楼层、中奖跑马灯组件。',
    preview: '/template-s.png',
    components: [
      { id: 'comp_001', name: '氛围头图', key: 'header_banner', description: '顶部活动氛围大图', enabled: true, required: true },
      { id: 'comp_002', name: '互动红包', key: 'interactive_redpacket', description: '点击拆红包互动组件', enabled: true, required: false },
      { id: 'comp_003', name: '大卡货架', key: 'main_shelf', description: '主推套餐大卡展示', enabled: true, required: true },
      { id: 'comp_004', name: '小卡货架', key: 'sub_shelf', description: '次推套餐小卡展示', enabled: true, required: false },
      { id: 'comp_005', name: '扭蛋机抽奖', key: 'lottery_gacha', description: '扭蛋机互动抽奖楼层', enabled: true, required: false },
      { id: 'comp_006', name: '中奖跑马灯', key: 'winner_marquee', description: '实时滚动中奖信息', enabled: true, required: false },
      { id: 'comp_007', name: '规则弹窗', key: 'rule_popup', description: '活动规则说明弹窗', enabled: true, required: true },
    ],
    createdAt: '2024-01-15T10:00:00Z',
    createdBy: '张三',
    updatedAt: '2024-03-20T14:30:00Z',
    updatedBy: '李四',
  },
  {
    id: 'tpl_002',
    name: '会员日模板',
    category: '会员日',
    description: '适用于每月会员日活动，预留会员限时福利、会员专属生活券包、会员专属礼等组件。',
    preview: '/template-a.png',
    components: [
      { id: 'comp_100', name: '全局配置', key: 'global_config', description: '配置页面全局背景配置', enabled: true, required: true },
      { id: 'comp_101', name: '氛围头图', key: 'header_banner', description: '顶部活动氛围图片', enabled: true, required: true },
      { id: 'comp_105', name: '规则弹窗', key: 'rule_popup', description: '活动规则说明弹窗', enabled: true, required: true },
      { id: 'comp_102', name: '会员限时福利', key: 'flash_sale', description: '配置商品多轮预约与限量抢购（如沪上阿姨奶茶）', enabled: false, required: false },
      { id: 'comp_107', name: '通用福利商品', key: 'welfare_product', description: '配置福利商品分组，支持最多5组', enabled: true, required: false },
      { id: 'comp_106', name: '会员专属0元购', key: 'free_purchase', description: '配置返现商品，会员下单后返现', enabled: false, required: false },
      { id: 'comp_108', name: '吸底按钮', key: 'cta_button', description: '对会员与非会员配置按钮与跳转链接', enabled: false, required: false },
    ],
    createdAt: '2024-02-10T08:00:00Z',
    createdBy: '王五',
    updatedAt: '2024-04-05T11:00:00Z',
    updatedBy: '张三',
  },
  {
    id: 'tpl_003',
    name: '轻量定向模板',
    category: '固定节日',
    description: '半弹窗/浮层样式，适用于定向推送场景，预留单品券发放与快捷开卡组件。',
    preview: '/template-b.png',
    components: [
      { id: 'comp_201', name: '弹窗背景', key: 'popup_bg', description: '浮层背景图', enabled: true, required: true },
      { id: 'comp_202', name: '单品券发放', key: 'coupon_issue', description: '单张优惠券发放组件', enabled: true, required: false },
      { id: 'comp_203', name: '快捷开卡', key: 'quick_subscribe', description: '一键开通会员按钮', enabled: true, required: true },
      { id: 'comp_204', name: '关闭按钮', key: 'close_btn', description: '浮层关闭入口', enabled: true, required: true },
    ],
    createdAt: '2024-03-01T09:00:00Z',
    createdBy: '李四',
    updatedAt: '2024-03-01T09:00:00Z',
    updatedBy: '李四',
  },
];

// ==================== 模拟营销策略补丁数据 ====================
export const mockPromoPatches: PromoPatch[] = [
  {
    id: 'patch_001',
    name: '618连续包月立减5元',
    type: 'price_discount',
    config: {
      targetPlanId: 'plan_001',
      targetPlanName: '连续包月',
      discountAmount: 5,
      discountUnit: 'yuan',
    },
    status: 'active',
    createdAt: '2024-05-01T10:00:00Z',
    updatedAt: '2024-05-01T10:00:00Z',
  },
  {
    id: 'patch_002',
    name: '年卡加赠60天',
    type: 'bonus_duration',
    config: {
      bonusDays: 60,
      targetPlanIds: ['plan_004', 'plan_005'],
      targetPlanNames: ['年卡会员', '连续包年'],
    },
    status: 'active',
    createdAt: '2024-05-10T14:00:00Z',
    updatedAt: '2024-05-10T14:00:00Z',
  },
  {
    id: 'patch_003',
    name: '全棉时代开卡礼包',
    type: 'gift',
    config: {
      giftName: '全棉时代护肤礼包',
      giftType: 'physical',
      stockCount: 500,
    },
    status: 'active',
    createdAt: '2024-04-20T08:00:00Z',
    updatedAt: '2024-05-15T16:00:00Z',
  },
  {
    id: 'patch_004',
    name: '季度卡8折',
    type: 'price_discount',
    config: {
      targetPlanId: 'plan_003',
      targetPlanName: '季度会员',
      discountAmount: 20,
      discountUnit: 'percent',
    },
    status: 'active',
    createdAt: '2024-06-01T09:00:00Z',
    updatedAt: '2024-06-01T09:00:00Z',
  },
  {
    id: 'patch_005',
    name: '新人专享场景券',
    type: 'gift',
    config: {
      giftName: '新用户专属5元券',
      giftType: 'coupon',
      couponPoolId: 'pool_003',
      stockCount: 10000,
    },
    status: 'active',
    createdAt: '2024-05-20T10:00:00Z',
    updatedAt: '2024-05-20T10:00:00Z',
  },
  {
    id: 'patch_006',
    name: '连续包月加赠7天',
    type: 'bonus_duration',
    config: {
      bonusDays: 7,
      targetPlanIds: ['plan_001'],
      targetPlanNames: ['连续包月'],
    },
    status: 'inactive',
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-04-01T10:00:00Z',
  },
];

// ==================== 模拟活动数据 ====================
export const mockActivities: Activity[] = [
  {
    id: 'act_001',
    name: '618会员狂欢节',
    category: '促活',

    templateId: 'tpl_001',
    templateName: '大促抽奖模板',
    status: 'active',
    timeConfig: {
      activityStartTime: '2024-06-01T00:00:00Z',
      activityEndTime: '2024-06-20T23:59:59Z',
      sellStartTime: '2024-06-01T00:00:00Z',
      sellEndTime: '2024-06-18T23:59:59Z',
      lotteryStartTime: '2024-06-01T00:00:00Z',
      lotteryEndTime: '2024-06-18T23:59:59Z',
      bufferEndTime: '2024-06-20T23:59:59Z',
      refundCutoffTime: '2024-06-15T23:59:59Z',
    },
    audienceGroups: [
      {
        id: 'group_001',
        name: '孕期用户',
        rules: [
          { id: 'rule_001', field: 'member_status', label: '会员状态', operator: 'in', value: ['expired', 'non_member'] },
          { id: 'rule_002', field: 'identity', label: '身份模式', operator: 'equals', value: 'pregnant' },
        ],
        shelves: [
          { id: 'shelf_001', planId: 'plan_001', planName: '连续包月', isMainPush: true, sortOrder: 0, patchIds: ['patch_001'] },
          { id: 'shelf_002', planId: 'plan_004', planName: '年卡会员', isMainPush: false, sortOrder: 1, patchIds: ['patch_002'] },
          { id: 'shelf_003', planId: 'plan_003', planName: '季度会员', isMainPush: false, sortOrder: 2, patchIds: ['patch_004'] },
        ],
      },
    ],
    lotteryConfig: {
      enabled: true,
      poolId: 'pool_001',
      poolName: '618大促奖池',
    },
    materialConfig: {
      headerBanner: '/banners/618_header.png',
      ruleRichText: '活动期间订阅会员即可参与抽奖，每人限抽3次',
      popupBg: '/banners/618_popup.png',
      marqueeText: '恭喜用户***获得全棉时代礼包',
    },
    components: {
      header_banner: true,
      interactive_redpacket: true,
      main_shelf: true,
      sub_shelf: true,
      lottery_gacha: true,
      winner_marquee: true,
      rule_popup: true,
    },
    createdAt: '2024-05-15T10:00:00Z',
    updatedAt: '2024-06-01T00:00:00Z',
    createdBy: '张三',
    updatedBy: '李四',
  },
  {
    id: 'act_002',
    name: '每月会员日',
    category: '促活',

    templateId: 'tpl_002',
    templateName: '会员日模板',
    status: 'pending',
    timeConfig: {
      activityStartTime: '2024-07-01T00:00:00Z',
      activityEndTime: '2024-07-01T23:59:59Z',
      sellStartTime: '2024-07-01T00:00:00Z',
      sellEndTime: '2024-07-01T23:59:59Z',
    },
    audienceGroups: [
      {
        id: 'group_101',
        name: '过期会员',
        rules: [
          { id: 'rule_101', field: 'member_status', label: '会员状态', operator: 'in', value: ['expired'] },
        ],
        shelves: [
          { id: 'shelf_101', planId: 'plan_001', planName: '连续包月', isMainPush: true, sortOrder: 0, patchIds: [] },
          { id: 'shelf_102', planId: 'plan_003', planName: '季度会员', isMainPush: false, sortOrder: 1, patchIds: [] },
        ],
      },
    ],
    lotteryConfig: {
      enabled: false,
      poolId: '',
      poolName: '',
    },
    materialConfig: {
      headerBanner: '/banners/member_day_header.png',
      ruleRichText: '会员日专属优惠，限时1天',
    },
    components: {
      header_banner: true,
      flash_sale: true,
      welfare_product: true,
      rule_popup: true,
    },
    createdAt: '2024-06-20T14:00:00Z',
    updatedAt: '2024-06-20T14:00:00Z',
    createdBy: '王五',
    updatedBy: '王五',
  },
  {
    id: 'act_003',
    name: '孕期用户专属弹窗',
    category: '转化',

    templateId: 'tpl_003',
    templateName: '轻量定向模板',
    status: 'draft',
    timeConfig: {
      activityStartTime: '2024-07-15T00:00:00Z',
      activityEndTime: '2024-07-31T23:59:59Z',
      sellStartTime: '2024-07-15T00:00:00Z',
      sellEndTime: '2024-07-31T23:59:59Z',
    },
    audienceGroups: [
      {
        id: 'group_201',
        name: '孕期新用户',
        rules: [
          { id: 'rule_201', field: 'identity', label: '身份模式', operator: 'equals', value: 'pregnant' },
          { id: 'rule_202', field: 'member_status', label: '会员状态', operator: 'equals', value: 'non_member' },
        ],
        shelves: [
          { id: 'shelf_201', planId: 'plan_001', planName: '连续包月', isMainPush: true, sortOrder: 0, patchIds: ['patch_006'] },
        ],
      },
    ],
    lotteryConfig: {
      enabled: false,
      poolId: '',
      poolName: '',
    },
    materialConfig: {
      popupBg: '/banners/pregnant_popup.png',
    },
    components: {
      popup_bg: true,
      coupon_issue: true,
      quick_subscribe: true,
      close_btn: true,
    },
    createdAt: '2024-06-25T16:00:00Z',
    updatedAt: '2024-06-25T16:00:00Z',
    createdBy: '赵六',
    updatedBy: '赵六',
  },
  {
    id: 'act_004',
    name: '双11大促',
    category: '促活',

    templateId: 'tpl_001',
    templateName: '大促抽奖模板',
    status: 'ended',
    timeConfig: {
      activityStartTime: '2023-11-01T00:00:00Z',
      activityEndTime: '2023-11-11T23:59:59Z',
      sellStartTime: '2023-11-01T00:00:00Z',
      sellEndTime: '2023-11-11T23:59:59Z',
    },
    audienceGroups: [],
    lotteryConfig: { enabled: false, poolId: '', poolName: '' },
    materialConfig: {},
    components: {},
    createdAt: '2023-10-20T10:00:00Z',
    updatedAt: '2023-11-12T00:00:00Z',
    createdBy: '张三',
    updatedBy: '李四',
  },
];
