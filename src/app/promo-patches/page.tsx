'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  DollarSign,
  Clock,
  Gift,
  ToggleLeft,
  Pencil,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { PromoPatch, PromoPatchType } from '@/lib/types';
import { mapPromoPatchFromDb } from '@/lib/types';
import { mockPlans, mockLotteryPools } from '@/lib/mock-data';

const typeConfig: Record<PromoPatchType, { label: string; color: string; icon: React.ElementType; desc: string }> = {
  price_discount: {
    label: '价格立减',
    color: 'bg-pink-50 text-pink-700 border-pink-200',
    icon: DollarSign,
    desc: '针对特定套餐的优惠金额或折扣',
  },
  bonus_duration: {
    label: '加赠时长',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Clock,
    desc: '购买后额外赠送会员天数',
  },
  gift: {
    label: '开卡赠礼',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Gift,
    desc: '关联实物卡券或场景券',
  },
};

function PatchConfigForm({ type }: { type: PromoPatchType }) {
  if (type === 'price_discount') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>目标套餐 <span className="text-red-500">*</span></Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="选择套餐" />
              </SelectTrigger>
              <SelectContent>
                {mockPlans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} (¥{plan.price})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>优惠方式 <span className="text-red-500">*</span></Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="选择优惠方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yuan">直减金额(元)</SelectItem>
                <SelectItem value="percent">折扣(%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>优惠数值 <span className="text-red-500">*</span></Label>
          <Input type="number" placeholder="如：5（元）或 20（%）" />
        </div>
      </div>
    );
  }

  if (type === 'bonus_duration') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>赠送天数 <span className="text-red-500">*</span></Label>
          <Input type="number" placeholder="如：60" />
        </div>
        <div className="space-y-2">
          <Label>适用套餐</Label>
          <div className="grid grid-cols-2 gap-2">
            {mockPlans.map((plan) => (
              <label
                key={plan.id}
                className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50"
              >
                <input type="checkbox" className="rounded border-gray-300" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{plan.name}</p>
                  <p className="text-xs text-gray-500">¥{plan.price}/{plan.duration}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'gift') {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>赠礼类型 <span className="text-red-500">*</span></Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="选择赠礼类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="physical">实物礼包</SelectItem>
              <SelectItem value="coupon">场景券</SelectItem>
              <SelectItem value="virtual">虚拟权益</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>赠礼名称 <span className="text-red-500">*</span></Label>
          <Input placeholder="如：全棉时代护肤礼包" />
        </div>
        <div className="space-y-2">
          <Label>关联奖池（场景券时必填）</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="选择奖池ID" />
            </SelectTrigger>
            <SelectContent>
              {mockLotteryPools.map((pool) => (
                <SelectItem key={pool.id} value={pool.id}>
                  {pool.name} ({pool.sceneCode})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>库存数量 <span className="text-red-500">*</span></Label>
          <Input type="number" placeholder="如：500" />
        </div>
      </div>
    );
  }

  return null;
}

function CreatePatchDialog() {
  const [patchType, setPatchType] = useState<PromoPatchType | ''>('');

  return (
    <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>新建营销策略补丁</DialogTitle>
        <DialogDescription>
          统一维护营销补丁包，彻底改变"做活动先去价格管理建新商品"的混乱现状
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>策略名称 <span className="text-red-500">*</span></Label>
            <Input placeholder="如：618连续包月立减5元" />
          </div>
          <div className="space-y-2">
            <Label>策略类型 <span className="text-red-500">*</span></Label>
            <Select
              value={patchType}
              onValueChange={(val) => setPatchType(val as PromoPatchType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择策略类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price_discount">价格立减补丁</SelectItem>
                <SelectItem value="bonus_duration">加赠时长补丁</SelectItem>
                <SelectItem value="gift">开卡赠礼补丁</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {patchType && (
          <>
            <Separator />
            <div className="flex items-center gap-2 mb-2">
              {(() => {
                const TypeIcon = typeConfig[patchType].icon;
                return <TypeIcon className="h-4 w-4 text-gray-500" />;
              })()}
              <span className="text-sm font-medium text-gray-700">
                {typeConfig[patchType].label}配置
              </span>
              <span className="text-xs text-gray-400">
                {typeConfig[patchType].desc}
              </span>
            </div>
            <PatchConfigForm type={patchType} />
          </>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" className="border-gray-300">
          取消
        </Button>
        <Button className="bg-meiyou hover:bg-pink-600 text-white" disabled={!patchType}>
          创建策略
        </Button>
      </div>
    </DialogContent>
  );
}

function PatchDetailContent({ patch }: { patch: PromoPatch }) {
  const config = patch.config;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="text-xs text-gray-500 mb-1">策略类型</p>
          <Badge variant="outline" className={typeConfig[patch.type].color}>
            {typeConfig[patch.type].label}
          </Badge>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="text-xs text-gray-500 mb-1">状态</p>
          <Badge variant="outline" className={patch.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-400 border-gray-200'}>
            {patch.status === 'active' ? '启用中' : '已停用'}
          </Badge>
        </div>
      </div>

      <Separator />

      {patch.type === 'price_discount' && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">立减配置</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-xs text-gray-500 mb-1">目标套餐</p>
              <p className="text-sm font-medium text-gray-900">
                {(config as { targetPlanName: string }).targetPlanName}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-xs text-gray-500 mb-1">优惠幅度</p>
              <p className="text-sm font-medium text-meiyou">
                {(config as { discountUnit: string; discountAmount: number }).discountUnit === 'yuan'
                  ? `直减 ¥${(config as { discountAmount: number }).discountAmount}`
                  : `${(config as { discountAmount: number }).discountAmount}% OFF`}
              </p>
            </div>
          </div>
        </div>
      )}

      {patch.type === 'bonus_duration' && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">加赠配置</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-xs text-gray-500 mb-1">赠送天数</p>
              <p className="text-sm font-medium text-blue-600">
                +{(config as { bonusDays: number }).bonusDays} 天
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-xs text-gray-500 mb-1">适用套餐</p>
              <p className="text-sm font-medium text-gray-900">
                {(config as { targetPlanNames: string[] }).targetPlanNames.join('、')}
              </p>
            </div>
          </div>
        </div>
      )}

      {patch.type === 'gift' && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">赠礼配置</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-xs text-gray-500 mb-1">赠礼名称</p>
              <p className="text-sm font-medium text-gray-900">
                {(config as { giftName: string }).giftName}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-xs text-gray-500 mb-1">赠礼类型</p>
              <p className="text-sm font-medium text-gray-900">
                {{ physical: '实物礼包', coupon: '场景券', virtual: '虚拟权益' }[(config as { giftType: string }).giftType] || (config as { giftType: string }).giftType}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <p className="text-xs text-gray-500 mb-1">库存数量</p>
              <p className="text-sm font-medium text-gray-900">
                {(config as { stockCount: number }).stockCount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PromoPatchesPage() {
  const [patches, setPatches] = useState<PromoPatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/promo-patches')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data) {
          setPatches(json.data.map(mapPromoPatchFromDb));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleToggleStatus = async (patchId: string) => {
    const patch = patches.find((p) => p.id === patchId);
    if (!patch) return;
    const newStatus = patch.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/promo-patches/${patchId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setPatches((prev) =>
          prev.map((p) => (p.id === patchId ? { ...p, status: newStatus } : p))
        );
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">营销策略库</h1>
          <p className="mt-1 text-sm text-gray-500">
            优惠、加赠时长等"策略补丁"配置，运营统一维护营销补丁包
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-meiyou hover:bg-pink-600 text-white">
              <Plus className="mr-2 h-4 w-4" />
              新建策略
            </Button>
          </DialogTrigger>
          <CreatePatchDialog />
        </Dialog>
      </div>

      {/* 策略类型说明 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Object.entries(typeConfig).map(([key, config]) => {
          const TypeIcon = config.icon;
          return (
            <Card key={key} className="border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TypeIcon className="h-4 w-4 text-gray-500" />
                  <Badge variant="outline" className={config.color}>
                    {config.label}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">{config.desc}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 策略列表 */}
      <Card className="border-gray-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="w-[260px]">策略名称</TableHead>
                <TableHead className="w-[120px]">类型</TableHead>
                <TableHead>配置摘要</TableHead>
                <TableHead className="w-[100px] text-center">状态</TableHead>
                <TableHead className="w-[140px] text-center">更新时间</TableHead>
                <TableHead className="w-[80px] text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patches.map((patch) => {
                const TypeIcon = typeConfig[patch.type].icon;
                let summary = '';
                if (patch.type === 'price_discount') {
                  const cfg = patch.config as { targetPlanName: string; discountUnit: string; discountAmount: number };
                  summary = `${cfg.targetPlanName} ${cfg.discountUnit === 'yuan' ? `减¥${cfg.discountAmount}` : `${cfg.discountAmount}% OFF`}`;
                } else if (patch.type === 'bonus_duration') {
                  const cfg = patch.config as { bonusDays: number; targetPlanNames: string[] };
                  summary = `送${cfg.bonusDays}天 · ${cfg.targetPlanNames.join('/')}`;
                } else if (patch.type === 'gift') {
                  const cfg = patch.config as { giftName: string; giftType: string; stockCount: number };
                  summary = `${cfg.giftName} · 库存${cfg.stockCount}`;
                }

                return (
                  <TableRow key={patch.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900 text-sm">{patch.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${typeConfig[patch.type].color}`}>
                        {typeConfig[patch.type].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{summary}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={patch.status === 'active'}
                          onCheckedChange={() => handleToggleStatus(patch.id)}
                          className="data-[state=checked]:bg-emerald-500"
                        />
                        <span className={`text-xs ${patch.status === 'active' ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {patch.status === 'active' ? '启用' : '停用'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-xs text-gray-500">
                      {new Date(patch.updatedAt).toLocaleDateString('zh-CN')}
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-3.5 w-3.5" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 focus:text-red-600">
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
