'use client';

import { useState, useEffect } from 'react';
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
import { DEFAULT_CATEGORIES } from '@/lib/types';

const statusConfig: Record<ActivityStatus, { label: string; color: string }> = {
  active: { label: '进行中', color: 'bg-green-50/80 text-green-700 border-green-200/60' },
  scheduled: { label: '待上线', color: 'bg-amber-50/80 text-amber-700 border-amber-200/60' },
  draft: { label: '草稿', color: 'bg-[var(--color-meiyou-bg)] text-[var(--color-meiyou-text-secondary)] border-[var(--color-meiyou-border)]' },
  expired: { label: '已结束', color: 'bg-gray-50/80 text-gray-400 border-gray-200/60' },
};

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function toCamelCaseDeep(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(toCamelCaseDeep);
  if (obj && typeof obj === 'object') {
    const record = obj as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(record)) {
      result[toCamelCase(key)] = toCamelCaseDeep(record[key]);
    }
    return result;
  }
  return obj;
}

function mapApiActivity(raw: Record<string, unknown>): Activity {
  return toCamelCaseDeep(raw) as Activity;
}

export default function ActivitiesPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  // 实际生效的筛选条件（点击查询后生效）
  const [appliedStatus, setAppliedStatus] = useState<string>('all');
  const [appliedCategory, setAppliedCategory] = useState<string>('all');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [localActivities, setLocalActivities] = useState<Activity[]>([]);
  const [previewActivity, setPreviewActivity] = useState<Activity | null>(null);

  useEffect(() => {
    fetch('/api/activities')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setLocalActivities(data.data.map(mapApiActivity));
        }
      })
      .catch(() => {
        // 静默处理
      });
  }, []);

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

  const handleQuery = () => {
    setAppliedStatus(statusFilter);
    setAppliedCategory(categoryFilter);
    setAppliedSearch(searchQuery);
  };

  const handleReset = () => {
    setStatusFilter('all');
    setCategoryFilter('all');
    setSearchQuery('');
    setAppliedStatus('all');
    setAppliedCategory('all');
    setAppliedSearch('');
  };

  const filteredActivities = localActivities
    .filter((activity) => ['促活', '转化', '拉新'].includes(activity.category))
    .filter((activity) => {
      const matchesStatus = appliedStatus === 'all' || activity.status === appliedStatus;
      const matchesCategory = appliedCategory === 'all' || activity.category === appliedCategory;
      const matchesSearch =
        !appliedSearch ||
        activity.name.toLowerCase().includes(appliedSearch.toLowerCase());
      return matchesStatus && matchesCategory && matchesSearch;
    });

  return (
    <div className="space-y-4">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-meiyou-text-primary)]">活动列表</h1>
          <p className="mt-1 text-sm text-[var(--color-meiyou-text-secondary)]">
            运营日常使用的组合拳，选定模板即可一键发布大促
          </p>
        </div>
        <Link href="/activities/new">
          <Button className="bg-meiyou hover:bg-meiyou-hover text-white h-10 rounded-lg">
            <Plus className="mr-2 h-4 w-4" />
            新建活动
          </Button>
        </Link>
      </div>

      {/* 筛选栏 */}
      <Card className="border-[var(--color-meiyou-border)] bg-white rounded-lg shadow-none">
        <CardContent className="p-4">
          <div className="flex items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-meiyou-text-secondary)]">活动名称</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-meiyou-text-placeholder)]" />
                <Input
                  placeholder="请输入活动名称"
                  className="pl-9 w-[220px] border-[var(--color-meiyou-border)] focus:border-meiyou focus:ring-meiyou/20 rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleQuery(); }}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-meiyou-text-secondary)]">活动状态</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] border-[var(--color-meiyou-border)] rounded-lg">
                  <SelectValue placeholder="全部状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="active">进行中</SelectItem>
                  <SelectItem value="scheduled">待上线</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="expired">已结束</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[var(--color-meiyou-text-secondary)]">活动分类</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px] border-[var(--color-meiyou-border)] rounded-lg">
                  <SelectValue placeholder="全部分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分类</SelectItem>
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="bg-meiyou hover:bg-meiyou-hover text-white h-9 rounded-lg" onClick={handleQuery}>
              查询
            </Button>
            <Button variant="outline" className="border-[var(--color-meiyou-border)] text-[var(--color-meiyou-text-secondary)] hover:bg-meiyou-bg h-9 rounded-lg" onClick={handleReset}>
              重置
            </Button>
            <div className="text-sm text-[var(--color-meiyou-text-secondary)] ml-auto mb-1.5">
              共 {filteredActivities.length} 个活动
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 活动列表 */}
      <Card className="border-[var(--color-meiyou-border)] bg-white rounded-lg shadow-none">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-meiyou-bg/60 hover:bg-meiyou-bg/60">
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
                  <TableRow key={activity.id} className="hover:bg-meiyou-bg/40 border-b border-[var(--color-meiyou-divider)]">
                    <TableCell>
                      <div>
                        <p className="font-medium text-[var(--color-meiyou-text-primary)] text-sm">{activity.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs rounded-xs bg-meiyou/5 text-meiyou border-meiyou/15`}>
                        {activity.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-[var(--color-meiyou-text-secondary)]">{activity.templateName}</TableCell>
                    <TableCell>
                      {(() => {
                        const tc = activity.timeConfig;
                        if (!tc) return <span className="text-xs text-[var(--color-meiyou-text-placeholder)]">-</span>;
                        const startTime = tc.sellStartTime;
                        const endTime = tc.bufferEndTime || tc.sellEndTime;
                        const fmt = (d: string) => {
                          if (!d) return '-';
                          return new Date(d).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
                        };
                        return (
                          <div className="text-xs text-[var(--color-meiyou-text-secondary)]">
                            <div>{fmt(startTime)}</div>
                            <div className="text-[var(--color-meiyou-text-placeholder)]">至 {fmt(endTime)}</div>
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`text-xs rounded-xs ${status.color}`}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-[var(--color-meiyou-text-secondary)]">{createdDate}</div>
                      <div className="text-xs text-[var(--color-meiyou-text-placeholder)]">{activity.createdBy || '-'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-[var(--color-meiyou-text-secondary)]">{updatedDate}</div>
                      <div className="text-xs text-[var(--color-meiyou-text-placeholder)]">{activity.updatedBy || '-'}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                          <Link href={`/activities/${activity.id}/edit`}>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-[var(--color-meiyou-text-secondary)] hover:text-meiyou hover:bg-meiyou-light rounded-lg">
                              <Pencil className="h-3.5 w-3.5 mr-1" />
                              编辑
                            </Button>
                          </Link>
                          <Link href={`/activities/new?copyFrom=${activity.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-[var(--color-meiyou-text-secondary)] hover:text-green-600 hover:bg-green-50/50 rounded-lg">
                              <Copy className="h-3.5 w-3.5 mr-1" />
                              复制
                            </Button>
                          </Link>
                        {activity.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[var(--color-meiyou-text-secondary)] hover:text-meiyou-warning hover:bg-amber-50/50 rounded-lg"
                            onClick={() => handleOffline(activity)}
                          >
                            <ArrowDownCircle className="h-3.5 w-3.5 mr-1" />
                            下线
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[var(--color-meiyou-text-secondary)] hover:text-meiyou-link hover:bg-blue-50/50 rounded-lg"
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
                  <TableCell colSpan={7} className="text-center py-8 text-[var(--color-meiyou-text-placeholder)]">
                    暂无匹配的活动
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 预览弹窗 - 手机模拟器 */}
      <AlertDialog open={!!previewActivity} onOpenChange={(open) => { if (!open) setPreviewActivity(null); }}>
        <AlertDialogContent className="max-w-lg rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>预览活动H5页面</AlertDialogTitle>
            <AlertDialogDescription>
              {previewActivity?.name} - 活动预览
            </AlertDialogDescription>
          </AlertDialogHeader>
          {previewActivity && (
            <div className="flex flex-col items-center gap-4">
              {/* 手机模拟器外框 */}
              <div className="relative bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl" style={{ width: 320, height: 580 }}>
                {/* 顶部刘海 */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-2xl z-10" />
                {/* 屏幕 */}
                <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden">
                  <iframe
                    src={getPreviewUrl(previewActivity)}
                    className="w-full h-full border-0"
                    title="活动预览"
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              </div>
              <div className="w-full bg-meiyou-bg rounded-lg p-3">
                <p className="text-xs text-[var(--color-meiyou-text-secondary)] mb-1">预览链接（手机扫码查看）</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-meiyou-link break-all flex-1">{getPreviewUrl(previewActivity)}</code>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 h-7 text-xs rounded-lg border-[var(--color-meiyou-border)]"
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
            <AlertDialogCancel className="rounded-lg">关闭</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
