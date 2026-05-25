'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Puzzle,
  Gift,
  CalendarDays,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { mockTemplates, mockPromoPatches, mockActivities } from '@/lib/mock-data';

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  active: { label: '进行中', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: TrendingUp },
  scheduled: { label: '待上线', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  draft: { label: '草稿', color: 'bg-slate-50 text-slate-600 border-slate-200', icon: AlertCircle },
  expired: { label: '已结束', color: 'bg-slate-50 text-slate-400 border-slate-200', icon: CheckCircle2 },
};

const categoryColorMap: Record<string, string> = {
  '年度大促': 'bg-rose-50 text-rose-700 border-rose-200',
  '会员日': 'bg-amber-50 text-amber-700 border-amber-200',
  '固定节日': 'bg-blue-50 text-blue-700 border-blue-200',
};
const defaultCategoryColor = 'bg-slate-50 text-slate-700 border-slate-200';

export default function DashboardPage() {
  const activeActivities = mockActivities.filter((a) => a.status === 'active');
  const scheduledActivities = mockActivities.filter((a) => a.status === 'scheduled');
  const draftActivities = mockActivities.filter((a) => a.status === 'draft');
  const activePatches = mockPromoPatches.filter((p) => p.status === 'active');

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">活动概览</h1>
        <p className="mt-1 text-sm text-slate-500">美柚会员订阅活动管理中心，一站式管理模板、策略与活动</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">进行中活动</p>
                <p className="mt-1 text-3xl font-semibold text-slate-900">{activeActivities.length}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">待上线活动</p>
                <p className="mt-1 text-3xl font-semibold text-slate-900">{scheduledActivities.length}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">可用模板</p>
                <p className="mt-1 text-3xl font-semibold text-slate-900">{mockTemplates.length}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Puzzle className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">活跃策略补丁</p>
                <p className="mt-1 text-3xl font-semibold text-slate-900">{activePatches.length}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50">
                <Gift className="h-5 w-5 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 快捷操作 */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-900">快捷操作</CardTitle>
          <CardDescription className="text-sm text-slate-500">快速创建活动所需资源</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/activities/new">
              <Button className="bg-rose-500 hover:bg-rose-600 text-white">
                <Plus className="mr-2 h-4 w-4" />
                新建活动
              </Button>
            </Link>
            <Link href="/templates">
              <Button variant="outline" className="border-slate-300">
                <Puzzle className="mr-2 h-4 w-4" />
                管理模板
              </Button>
            </Link>
            <Link href="/promo-patches">
              <Button variant="outline" className="border-slate-300">
                <Gift className="mr-2 h-4 w-4" />
                配置策略
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 最近活动 */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-slate-900">最近活动</CardTitle>
              <Link href="/activities" className="text-sm text-rose-500 hover:text-rose-600 flex items-center gap-1">
                查看全部 <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockActivities.slice(0, 4).map((activity) => {
                const status = statusConfig[activity.status];
                const StatusIcon = status.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-white p-3"
                  >
                    <div className="flex items-center gap-3">
                      <StatusIcon className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{activity.name}</p>
                        <p className="text-xs text-slate-500">{activity.templateName} · {activity.sceneKey}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-xs ${status.color}`}>
                      {status.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 模板与策略概览 */}
        <Card className="border-slate-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-900">资源概览</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 模板 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Puzzle className="h-3.5 w-3.5" />
                    活动模板
                  </h4>
                  <Link href="/templates" className="text-xs text-rose-500 hover:text-rose-600">
                    管理
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {mockTemplates.map((tpl) => (
                    <Badge key={tpl.id} variant="outline" className={`text-xs ${categoryColorMap[tpl.category] || defaultCategoryColor}`}>
                      {tpl.category} · {tpl.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 策略补丁 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Gift className="h-3.5 w-3.5" />
                    营销策略补丁
                  </h4>
                  <Link href="/promo-patches" className="text-xs text-rose-500 hover:text-rose-600">
                    管理
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2">
                  {mockPromoPatches.filter((p) => p.status === 'active').map((patch) => {
                    const typeLabels: Record<string, string> = {
                      price_discount: '立减',
                      bonus_duration: '加赠',
                      gift: '赠礼',
                    };
                    const typeColors: Record<string, string> = {
                      price_discount: 'bg-rose-50 text-rose-700 border-rose-200',
                      bonus_duration: 'bg-blue-50 text-blue-700 border-blue-200',
                      gift: 'bg-amber-50 text-amber-700 border-amber-200',
                    };
                    return (
                      <Badge key={patch.id} variant="outline" className={`text-xs ${typeColors[patch.type]}`}>
                        {typeLabels[patch.type]} · {patch.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
