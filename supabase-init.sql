-- 美柚会员订阅后台活动管理系统 - 数据库初始化脚本
-- 在 Supabase SQL Editor 中执行此脚本即可完成建表

-- ============================
-- 1. 活动模板表
-- ============================
CREATE TABLE IF NOT EXISTS templates (
  id varchar PRIMARY KEY,
  name varchar NOT NULL,
  category varchar NOT NULL DEFAULT '会员日',
  description text,
  components jsonb NOT NULL DEFAULT '{}',
  component_configs jsonb NOT NULL DEFAULT '{}',
  created_by varchar,
  updated_by varchar,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================
-- 2. 营销策略补丁表
-- ============================
CREATE TABLE IF NOT EXISTS promo_patches (
  id varchar PRIMARY KEY,
  name varchar NOT NULL,
  type varchar NOT NULL,
  config jsonb NOT NULL DEFAULT '{}',
  status varchar NOT NULL DEFAULT 'active',
  created_by varchar,
  updated_by varchar,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================
-- 3. 活动表
-- ============================
CREATE TABLE IF NOT EXISTS activities (
  id varchar PRIMARY KEY,
  name varchar NOT NULL,
  scene_key varchar DEFAULT 'default',
  template_id varchar REFERENCES templates(id),
  template_name varchar,
  status varchar NOT NULL DEFAULT 'draft',
  time_config jsonb DEFAULT '{}',
  lottery_config jsonb DEFAULT '{}',
  material_config jsonb DEFAULT '{}',
  components jsonb DEFAULT '{}',
  component_configs jsonb DEFAULT '{}',
  audience_groups jsonb DEFAULT '[]',
  category varchar DEFAULT '会员日',
  activity_key varchar,
  created_by varchar,
  updated_by varchar,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================
-- 4. 索引
-- ============================
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_category ON activities(category);
CREATE INDEX IF NOT EXISTS idx_activities_template_id ON activities(template_id);
CREATE INDEX IF NOT EXISTS idx_promo_patches_type ON promo_patches(type);
CREATE INDEX IF NOT EXISTS idx_promo_patches_status ON promo_patches(status);

-- ============================
-- 5. 初始模板数据
-- ============================
INSERT INTO templates (id, name, category, description, components, component_configs) VALUES
('tpl_001', '大促抽奖模板', '年度大促', '适用于618、双11等S级大促活动，预留头图、互动红包、大/小卡货架、弹层、抽奖等全部组件', 
 '{"header_banner":{"required":true,"label":"头图Banner","enabled":true},"global_config":{"required":true,"label":"全局配置","enabled":true},"flash_sale":{"required":false,"label":"会员限时福利","enabled":false},"exclusive_gift":{"required":false,"label":"会员专属礼","enabled":false},"free_benefit":{"required":false,"label":"会员专属0元购","enabled":false},"free_purchase":{"required":false,"label":"会员专属生活券包","enabled":false},"rule_popup":{"required":true,"label":"活动规则弹层","enabled":true},"cta_button":{"required":true,"label":"吸底按钮","enabled":true},"lottery_module":{"required":false,"label":"抽奖模块","enabled":false}}',
 '{}'),
('tpl_002', '会员日模板', '会员日', '适用于A级会员日活动，预留头图、限时福利、专属礼、0元购等组件', 
 '{"header_banner":{"required":true,"label":"头图Banner","enabled":true},"global_config":{"required":true,"label":"全局配置","enabled":true},"flash_sale":{"required":true,"label":"会员限时福利","enabled":true},"exclusive_gift":{"required":true,"label":"会员专属礼","enabled":true},"free_benefit":{"required":false,"label":"会员专属0元购","enabled":false},"free_purchase":{"required":false,"label":"会员专属生活券包","enabled":false},"rule_popup":{"required":true,"label":"活动规则弹层","enabled":true},"cta_button":{"required":true,"label":"吸底按钮","enabled":true}}',
 '{}'),
('tpl_003', '轻量定向模板', '轻量活动', '适用于B级轻量活动，仅保留头图、全局配置和吸底按钮', 
 '{"header_banner":{"required":true,"label":"头图Banner","enabled":true},"global_config":{"required":true,"label":"全局配置","enabled":true},"cta_button":{"required":true,"label":"吸底按钮","enabled":true}}',
 '{}')
ON CONFLICT (id) DO NOTHING;

-- ============================
-- 6. 初始策略补丁数据
-- ============================
INSERT INTO promo_patches (id, name, type, config, status) VALUES
('patch_001', '618连续包月立减5元', 'price_discount', '{"discountUnit":"yuan","targetPlanId":"plan_001","discountAmount":5,"targetPlanName":"连续包月"}', 'active'),
('patch_002', '年卡会员立减50元', 'price_discount', '{"discountUnit":"yuan","targetPlanId":"plan_004","discountAmount":50,"targetPlanName":"年卡会员"}', 'active'),
('patch_003', '连续包月赠送7天', 'extra_duration', '{"durationDays":7,"targetPlanId":"plan_001","targetPlanName":"连续包月"}', 'active'),
('patch_004', '季度会员赠送15天', 'extra_duration', '{"durationDays":15,"targetPlanId":"plan_003","targetPlanName":"季度会员"}', 'active'),
('patch_005', '开卡赠实物礼包', 'gift_with_purchase', '{"giftType":"physical","giftName":"会员专属美妆礼盒","giftValue":99}', 'active'),
('patch_006', '开卡赠场景券', 'gift_with_purchase', '{"giftType":"coupon","giftName":"美柚商城50元优惠券","giftValue":50}', 'active')
ON CONFLICT (id) DO NOTHING;
