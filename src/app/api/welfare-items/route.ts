import { NextResponse } from 'next/server';

/** 灵感后台福利项（模拟数据，status=启用） */
const welfareItems = [
  { id: 'wlf_001', name: '连续包月7天体验卡', status: 'enabled' },
  { id: 'wlf_002', name: '全棉时代护肤礼包', status: 'enabled' },
  { id: 'wlf_003', name: '星巴克中杯券', status: 'enabled' },
  { id: 'wlf_004', name: '瑞幸咖啡29元券', status: 'enabled' },
  { id: 'wlf_005', name: '京东PLUS月卡', status: 'enabled' },
  { id: 'wlf_006', name: '爱奇艺VIP月卡', status: 'enabled' },
  { id: 'wlf_007', name: '网易云音乐黑胶月卡', status: 'enabled' },
  { id: 'wlf_008', name: '芒果TV月卡', status: 'enabled' },
  { id: 'wlf_009', name: '喜马拉雅VIP月卡', status: 'enabled' },
  { id: 'wlf_010', name: '滴滴出行10元券', status: 'enabled' },
  { id: 'wlf_011', name: '美团外卖8元红包', status: 'enabled' },
  { id: 'wlf_012', name: '肯德基冰咖啡券', status: 'enabled' },
  { id: 'wlf_013', name: '必胜客9折券', status: 'enabled' },
  { id: 'wlf_014', name: '屈臣氏20元券', status: 'disabled' },
  { id: 'wlf_015', name: '名创优品10元券', status: 'disabled' },
  { id: 'wlf_016', name: '唯品会30元券', status: 'enabled' },
  { id: 'wlf_017', name: 'QQ超级会员月卡', status: 'enabled' },
  { id: 'wlf_018', name: '腾讯视频月卡', status: 'enabled' },
  { id: 'wlf_019', name: '优酷月卡', status: 'disabled' },
  { id: 'wlf_020', name: '百度网盘月卡', status: 'enabled' },
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
