'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { Activity, ComponentConfigs, FlashSaleConfig, BenefitConfig, FreePurchaseConfig, RulePopupConfig, ActionButtonConfig } from '@/lib/types';

/** 将 snake_case 深度转为 camelCase */
function toCamelCaseDeep(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(toCamelCaseDeep);
  if (obj && typeof obj === 'object') {
    const rec = obj as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(rec)) {
      const camel = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      out[camel] = toCamelCaseDeep(rec[key]);
    }
    return out;
  }
  return obj;
}

export default function ActivityPreviewPage() {
  const params = useParams();
  const id = params.id as string;
  const [activity, setActivity] = useState<Activity | null>(null);
  const [showRulePopup, setShowRulePopup] = useState(false);

  useEffect(() => {
    fetch(`/api/activities/${id}`)
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) {
          setActivity(toCamelCaseDeep(res.data) as Activity);
        }
      });
  }, [id]);

  if (!activity) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-400 text-sm">加载中...</div>
      </div>
    );
  }

  const configs = (activity.componentConfigs || {}) as ComponentConfigs;
  const components = activity.components || {};

  // 按模板中定义的顺序获取已启用的组件 key
  const enabledKeys = Object.entries(components)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key);

  /** 渲染氛围头图 */
  const renderHeaderBanner = () => {
    const cfg = configs.header_banner;
    if (!cfg?.imageUrl) return null;
    return (
      <div key="header_banner" className="w-full">
        <img src={cfg.imageUrl} alt="氛围头图" className="w-full block" />
      </div>
    );
  };

  /** 渲染限时抢购 */
  const renderFlashSale = () => {
    const cfg = configs.flash_sale as FlashSaleConfig | undefined;
    if (!cfg) return null;
    return (
      <div key="flash_sale" className="w-full" style={cfg.moduleBgImage ? { backgroundImage: `url(${cfg.moduleBgImage})`, backgroundSize: 'cover' } : {}}>
        {cfg.moduleHeaderImage && (
          <img src={cfg.moduleHeaderImage} alt="限时抢购头图" className="w-full block" />
        )}
        <div className="px-3 py-2">
          <div className="text-center text-xs font-semibold text-rose-500 mb-2">限时抢购</div>
          {cfg.products?.map((product) => (
            <div key={product.id} className="bg-white rounded-lg mb-2 overflow-hidden shadow-sm">
              <div className="flex">
                {product.rushImage && <img src={product.rushImage} alt="" className="w-20 h-20 object-cover" />}
                <div className="flex-1 p-2 text-xs">
                  <div className="font-medium text-gray-800">商品ID: {product.productId}</div>
                  <div className="text-gray-400 mt-1">库存: {product.stock}</div>
                  {product.pushText && <div className="text-rose-500 mt-1">{product.pushText}</div>}
                  {product.timeSessions?.map((session, idx) => (
                    <div key={session.id || idx} className="text-gray-400 mt-0.5 text-[10px]">
                      第{idx + 1}场: {session.rushStartTime?.slice(0, 16).replace('T', ' ')} ~ {session.rushEndTime?.slice(11, 16)}
                    </div>
                  ))}
                </div>
                {product.benefitImage && <img src={product.benefitImage} alt="" className="w-16 h-16 object-cover m-2" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  /** 渲染0元福利/专属礼 */
  const renderBenefit = (key: string, title: string) => {
    const cfg = configs[key as keyof ComponentConfigs] as BenefitConfig | undefined;
    if (!cfg) return null;
    const isDouble = cfg.products?.some(p => p.displayMode === 'double-column');
    return (
      <div key={key} className="w-full" style={cfg.moduleBgImage ? { backgroundImage: `url(${cfg.moduleBgImage})`, backgroundSize: 'cover' } : {}}>
        {cfg.moduleHeaderImage && (
          <img src={cfg.moduleHeaderImage} alt={`${title}头图`} className="w-full block" />
        )}
        <div className="px-3 py-2">
          <div className="text-center text-xs font-semibold text-orange-500 mb-2">{title}</div>
          <div className={isDouble ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-2'}>
            {cfg.products?.map((product) => (
              <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-sm">
                {product.benefitImage && (
                  <img src={product.benefitImage} alt="" className="w-full h-24 object-cover" />
                )}
                <div className="p-1.5 text-[10px] text-gray-600 text-center">商品ID: {product.productId}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  /** 渲染0元购 */
  const renderFreePurchase = () => {
    const cfg = configs.free_purchase as FreePurchaseConfig | undefined;
    if (!cfg) return null;
    return (
      <div key="free_purchase" className="w-full" style={cfg.moduleBgImage ? { backgroundImage: `url(${cfg.moduleBgImage})`, backgroundSize: 'cover' } : {}}>
        {cfg.moduleHeaderImage && (
          <img src={cfg.moduleHeaderImage} alt="0元购头图" className="w-full block" />
        )}
        <div className="px-3 py-2">
          <div className="text-center text-xs font-semibold text-green-600 mb-2">0元购</div>
          <div className="bg-white rounded-lg p-3 text-xs text-gray-600">
            <div>下单全额返现金</div>
            {cfg.categoryIds?.length > 0 && (
              <div className="mt-1 text-gray-400 text-[10px]">
                返现类目: {cfg.categoryIds.join('、')}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  /** 渲染规则弹窗入口 */
  const renderRulePopup = () => {
    const cfg = configs.rule_popup as RulePopupConfig | undefined;
    if (!cfg) return null;
    return (
      <div key="rule_popup" className="w-full px-3 py-2">
        <button
          className="flex items-center gap-1 mx-auto text-xs text-gray-500"
          onClick={() => setShowRulePopup(true)}
        >
          {cfg.iconImage ? (
            <img src={cfg.iconImage} alt="" className="w-4 h-4" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          活动规则
        </button>

        {/* 规则弹窗 */}
        {showRulePopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowRulePopup(false)}>
            <div className="bg-white rounded-xl mx-6 p-4 max-h-[70vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="text-sm font-semibold mb-3">活动规则</div>
              <div className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed">
                {cfg.ruleText || '暂无规则说明'}
              </div>
              <button
                className="mt-4 w-full py-2 bg-gray-100 rounded-lg text-xs text-gray-600"
                onClick={() => setShowRulePopup(false)}
              >
                我知道了
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  /** 渲染按钮 */
  const renderCtaButton = () => {
    const cfg = configs.cta_button as ActionButtonConfig | undefined;
    if (!cfg) return null;
    // 简单展示当前状态的按钮（默认展示预约期）
    const period = cfg.bookingPeriod || cfg.claimPeriod || cfg.endPeriod;
    if (!period) return null;
    return (
      <div key="cta_button" className="w-full px-4 py-3">
        <button
          className="w-full py-3 rounded-full text-white font-semibold text-sm"
          style={{ backgroundColor: period.buttonColor || '#f43f5e' }}
        >
          {period.buttonText || '立即参与'}
        </button>
      </div>
    );
  };

  // 组件渲染映射
  const componentRenderers: Record<string, () => React.ReactNode> = {
    header_banner: renderHeaderBanner,
    flash_sale: renderFlashSale,
    free_benefit: () => renderBenefit('free_benefit', '0元福利'),
    exclusive_gift: () => renderBenefit('exclusive_gift', '专属礼'),
    free_purchase: renderFreePurchase,
    rule_popup: renderRulePopup,
    cta_button: renderCtaButton,
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-start justify-center py-4">
      {/* 手机壳 */}
      <div className="w-[375px] min-h-[667px] bg-white shadow-2xl rounded-[2rem] overflow-hidden relative">
        {/* 状态栏 */}
        <div className="h-11 bg-white flex items-end justify-center pb-1">
          <span className="text-[10px] text-gray-400">美柚会员</span>
        </div>
        
        {/* 活动标题 */}
        <div className="px-4 py-2 bg-white border-b border-gray-100">
          <div className="text-sm font-semibold text-gray-800 truncate">{activity.name}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">
            {activity.category === '促活' ? '会员日' : activity.category} · 会员日模板
          </div>
        </div>

        {/* 活动内容区 */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(667px - 70px)' }}>
          {enabledKeys.map(key => {
            const renderer = componentRenderers[key];
            return renderer ? renderer() : null;
          })}
          
          {enabledKeys.length === 0 && (
            <div className="py-20 text-center text-gray-300 text-xs">
              暂无组件内容
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
