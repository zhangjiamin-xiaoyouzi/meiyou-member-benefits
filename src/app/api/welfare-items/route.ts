import { NextResponse } from 'next/server';

/** 灵感后台福利项（模拟数据，status=启用） */
const welfareItems = [
  { id: 'wlf_001', name: '连续包月7天体验卡', image: 'https://placehold.co/200x200/ff4d88/ffffff?text=7day', status: 'enabled', stock: 1280 },
  { id: 'wlf_002', name: '全棉时代护肤礼包', image: 'https://placehold.co/200x200/ff4d88/ffffff?text=Cotton', status: 'enabled', stock: 560 },
  { id: 'wlf_003', name: '星巴克中杯券', image: 'https://placehold.co/200x200/ff4d88/ffffff?text=Starbucks', status: 'enabled', stock: 2300 },
  { id: 'wlf_004', name: '瑞幸咖啡29元券', image: 'https://placehold.co/200x200/ff4d88/ffffff?text=Luckin', status: 'enabled', stock: 890 },
  { id: 'wlf_005', name: '京东PLUS月卡', image: 'https://placehold.co/200x200/ff4d88/ffffff?text=JD+', status: 'enabled', stock: 320 },
  { id: 'wlf_006', name: '爱奇艺VIP月卡', image: 'https://placehold.co/200x200/ff4d88/ffffff?text=iQIYI', status: 'enabled', stock: 1500 },
  { id: 'wlf_007', name: '网易云音乐黑胶月卡', image: 'https://placehold.co/200x200/ff4d88/ffffff?text=Music', status: 'enabled', stock: 780 },
  { id: 'wlf_008', name: '芒果TV月卡', image: 'https://placehold.co/200x200/ff4d88/ffffff?text=Mango', status: 'enabled', stock: 0 },
  { id: 'wlf_009', name: '喜马拉雅VIP月卡', image: 'https://placehold.co/200x200/ff4d88/ffffff?text=Himalaya', status: 'enabled', stock: 450 },
  { id: 'wlf_010', name: '滴滴出行10元券', image: 'https://placehold.co/200x200/ff4d88/ffffff?text=DiDi', status: 'enabled', stock: 1600 },
  { id: 'wlf_011', name: '美团外卖8元红包', image: 'https://placehold.co/200x200/ff4d88/ffffff?text=Meituan', status: 'enabled', stock: 2100 },
  { id: 'wlf_012', name: '肯德基冰咖啡券', image: 'https://placehold.co/200x200/ff4d88/ffffff?text=KFC', status: 'enabled', stock: 0 },
  { id: 'wlf_013', name: '必胜客9折券', image: 'https://placehold.co/200x200/ff4d88/ffffff?text=PH', status: 'enabled', stock: 670 },
  { id: 'wlf_014', name: '屈臣氏20元券', image: 'https://placehold.co/200x200/ff4d88/ffffff?text=Watsons', status: 'disabled', stock: 0 },
  { id: 'wlf_015', name: '名创优品10元券', image: 'https://placehold.co/200x200/ff4d88/ffffff?text=Miniso', status: 'disabled', stock: 100 },
  { id: 'wlf_016', name: '唯品会30元券', image: 'https://placehold.co/200x200/ff4d88/ffffff?text=Vipshop', status: 'enabled', stock: 920 },
  { id: 'wlf_017', name: 'QQ超级会员月卡', image: 'https://placehold.co/200x200/ff4d88/ffffff?text=QQ', status: 'enabled', stock: 1800 },
  { id: 'wlf_018', name: '腾讯视频月卡', image: 'https://placehold.co/200x200/ff4d88/ffffff?text=Tencent', status: 'enabled', stock: 340 },
  { id: 'wlf_019', name: '优酷月卡', image: 'https://placehold.co/200x200/ff4d88/ffffff?text=Youku', status: 'disabled', stock: 0 },
  { id: 'wlf_020', name: '百度网盘月卡', image: 'https://placehold.co/200x200/ff4d88/ffffff?text=Baidu', status: 'enabled', stock: 1100 },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword') || '';

  // 只返回状态=启用的福利项
  let items = welfareItems.filter((item) => item.status === 'enabled');

  // 支持关键词检索福利名称
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    items = items.filter((item) => item.name.toLowerCase().includes(lowerKeyword) || item.id.toLowerCase().includes(lowerKeyword));
  }

  return NextResponse.json({ success: true, data: items });
}
