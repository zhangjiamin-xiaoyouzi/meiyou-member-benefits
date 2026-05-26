'use client';

import { useState } from 'react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  Eye,
  ExternalLink,
} from 'lucide-react';
import type { Activity, ActivityStatus } from '@/lib/types';
import { mockActivities } from '@/lib/mock-data';
import { DEFAULT_CATEGORIES } from '@/lib/types';

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

  const filteredActivities = mockActivities.filter((activity) => {
    const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || activity.category === categoryFilter;
    const matchesSearch =
      !searchQuery ||
      activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.sceneKey.toLowerCase().includes(searchQuery.toLowerCase());
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
                placeholder="搜索活动名称或 scene_key..."
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
                <TableHead className="w-[240px]">活动名称</TableHead>
                <TableHead className="w-[100px]">分类</TableHead>
                <TableHead className="w-[160px]">Scene Key</TableHead>
                <TableHead className="w-[140px]">使用模板</TableHead>
                <TableHead className="w-[100px] text-center">状态</TableHead>
                <TableHead>售卖时间</TableHead>
                <TableHead className="w-[120px] text-center">策略补丁</TableHead>
                <TableHead className="w-[80px] text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.map((activity) => {
                const status = statusConfig[activity.status];
                const patchCount = activity.audienceGroups.reduce((sum, g) => sum + g.shelves.reduce((s, sh) => s + sh.patchIds.length, 0), 0);
                const sellStart = new Date(activity.timeConfig.sellStartTime).toLocaleDateString('zh-CN');
                const sellEnd = new Date(activity.timeConfig.sellEndTime).toLocaleDateString('zh-CN');

                return (
                  <TableRow key={activity.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{activity.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">ID: {activity.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs bg-slate-50 text-slate-700 border-slate-200">
                        {activity.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 font-mono">
                        {activity.sceneKey}
                      </code>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">{activity.templateName}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={`text-xs ${status.color}`}>
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {sellStart} ~ {sellEnd}
                    </TableCell>
                    <TableCell className="text-center">
                      {patchCount > 0 ? (
                        <Badge variant="outline" className="text-xs bg-rose-50 text-rose-700 border-rose-200">
                          {patchCount} 个
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
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
                            <Eye className="mr-2 h-3.5 w-3.5" />
                            查看详情
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-3.5 w-3.5" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-3.5 w-3.5" />
                            复制活动
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ExternalLink className="mr-2 h-3.5 w-3.5" />
                            预览链接
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
              {filteredActivities.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-slate-400">
                    暂无匹配的活动
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
