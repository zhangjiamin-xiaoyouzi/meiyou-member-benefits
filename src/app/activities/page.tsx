'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Search,
  Pencil,
  ArrowDownCircle,
  QrCode,
  Copy,
} from 'lucide-react';
import type { Activity, ActivityStatus } from '@/lib/types';
import { mockActivities } from '@/lib/mock-data';
import { DEFAULT_CATEGORIES } from '@/lib/types';
import QRCodeLib from 'qrcode';

function QRCodeCanvas({ url }: { url: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && url) {
      QRCodeLib.toCanvas(canvasRef.current, url, {
        width: 192,
        margin: 2,
        color: { dark: '#1e293b', light: '#ffffff' },
      });
    }
  }, [url]);

  return <canvas ref={canvasRef} />;
}

const statusConfig: Record<ActivityStatus, { label: string; color: string }> = {
  active: { label: '进行中', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  scheduled: { label: '待上线', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  draft: { label: '草稿', color: 'bg-slate-100 text-slate-600 border-slate-200' },
  expired: { label: '已结束', color: 'bg-slate-50 text-slate-400 border-slate-200' },
};

export default function ActivitiesPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [localActivities, setLocalActivities] = useState<Activity[]>(mockActivities);
  const [previewActivity, setPreviewActivity] = useState<Activity | null>(null);

  const handleOffline = async (activity: Activity) => {
    try {
      const res = await fetch(`/api/activities/${activity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'expired' }),
      });
      const data = await res.json();
      if (data.success) {
        setLocalActivities((prev) =>
          prev.map((a) => (a.id === activity.id ? { ...a, status: 'expired' as ActivityStatus } : a))
        );
      }
    } catch {
      // 静默处理
    }
  };

  const getPreviewUrl = (activity: Activity) => {
    const domain = typeof window !== 'undefined' ? window.location.origin : '';
    return `${domain}/activities/${activity.id}/preview`;
  };

  const filteredActivities = localActivities
    .filter((activity) => ['促活', '转化', '拉新'].includes(activity.category))
    .filter((activity) => {
      const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || activity.category === categoryFilter;
      const matchesSearch =
        !searchQuery ||
        activity.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesCategory && matchesSearch;
    });

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">活动列表</h1>
          <p className="mt-1 text-sm text-slate-500">
            运营日常使用的组合拳，选定模板即可一键发布大促
          </p>
        </div>
        <Link href="/activities/new">
          <Button className="bg-rose-500 hover:bg-rose-600 text-white">
            <Plus className="mr-2 h-4 w-4" />
            新建活动
          </Button>
        </Link>
      </div>

      {/* 筛选栏 */}
      <Card className="border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="搜索活动名称..."
                className="pl-9 border-slate-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] border-slate-200">
                <SelectValue placeholder="活动状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="active">进行中</SelectItem>
                <SelectItem value="scheduled">待上线</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="expired">已结束</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px] border-slate-200">
                <SelectValue placeholder="活动分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                {DEFAULT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm text-slate-500">
              共 {filteredActivities.length} 个活动
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 活动列表 */}
      <Card className="border-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="w-[200px]">活动名称</TableHead>
                <TableHead className="w-[100px]">活动分类</TableHead>
                <TableHead className="w-[120px]">使用模板</TableHead>
                <TableHead className="w-[200px]">活动时间</TableHead>
                <TableHead className="w-[80px] text-center">状态</TableHead>
                <TableHead className="w-[160px]">创建时间/人</TableHead>
                <TableHead className="w-[160px]">操作时间/人</TableHead>
                <TableHead className="w-[120px] text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.map((activity) => {
                const status = statusConfig[activity.status];
                const createdDate = activity.createdAt ? new Date(activity.createdAt).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-';
                const updatedDate = activity.updatedAt ? new Date(activity.updatedAt).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-';

                return (
                  <TableRow key={activity.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900 text-sm">{activity.name}</p>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">ID: {activity.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs bg-slate-50 text-slate-700 border-slate-200">
                        {activity.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">{activity.templateName}</TableCell>
                    <TableCell>
                      {(() => {
                        const tc = activity.timeConfig;
                        if (!tc) return <span className="text-xs text-slate-400">-</span>;
                        const startTime = tc.sellStartTime;
                        const endTime = tc.bufferEndTime || tc.sellEndTime;
                        const fmt = (d: string) => {
                          if (!d) return '-';
                          return new Date(d).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
                        };
                        return (
                          <div className="text-xs text-slate-600">
                            <div>{fmt(startTime)}</div>
                            <div className="text-slate-400">至 {fmt(endTime)}</div>
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`text-xs ${status.color}`}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-slate-600">{createdDate}</div>
                      <div className="text-xs text-slate-400">{activity.createdBy || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-slate-600">{updatedDate}</div>
                      <div className="text-xs text-slate-400">{activity.updatedBy || '-'}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                          <Link href={`/activities/${activity.id}/edit`}>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-600 hover:text-rose-600">
                              <Pencil className="h-3.5 w-3.5 mr-1" />
                              编辑
                            </Button>
                          </Link>
                          <Link href={`/activities/new?copyFrom=${activity.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-600 hover:text-emerald-600">
                              <Copy className="h-3.5 w-3.5 mr-1" />
                              复制
                            </Button>
                          </Link>
                        {activity.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-slate-600 hover:text-amber-600"
                            onClick={() => handleOffline(activity)}
                          >
                            <ArrowDownCircle className="h-3.5 w-3.5 mr-1" />
                            下线
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-slate-600 hover:text-blue-600"
                          onClick={() => setPreviewActivity(activity)}
                        >
                          <QrCode className="h-3.5 w-3.5 mr-1" />
                          预览
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredActivities.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                    暂无匹配的活动
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 预览弹窗 */}
      <AlertDialog open={!!previewActivity} onOpenChange={(open) => { if (!open) setPreviewActivity(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>扫码预览活动</AlertDialogTitle>
            <AlertDialogDescription>
              扫描下方二维码或在手机浏览器中打开链接，查看活动配置
            </AlertDialogDescription>
          </AlertDialogHeader>
          {previewActivity && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="bg-white border-2 border-slate-200 rounded-xl p-2">
                <QRCodeCanvas url={getPreviewUrl(previewActivity)} />
              </div>
              <p className="text-sm font-medium text-slate-900">{previewActivity.name}</p>
              <div className="w-full bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">预览链接</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-blue-600 break-all flex-1">{getPreviewUrl(previewActivity)}</code>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 h-7 text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(getPreviewUrl(previewActivity));
                    }}
                  >
                    复制
                  </Button>
                </div>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>关闭</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
