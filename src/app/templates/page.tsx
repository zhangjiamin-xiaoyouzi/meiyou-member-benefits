'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Pencil, Search } from 'lucide-react';
import type { Template } from '@/lib/types';
import { mockTemplates } from '@/lib/mock-data';
import { TEMPLATE_CATEGORIES } from '@/lib/types';

const categoryColorMap: Record<string, string> = {
  '年度大促': 'bg-pink-50 text-pink-700 border-pink-200',
  '会员日': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  '固定节日': 'bg-blue-50 text-blue-700 border-blue-200',
};
const defaultCategoryColor = 'bg-gray-50 text-gray-700 border-gray-200';

function getCategoryColor(category: string): string {
  return categoryColorMap[category] || defaultCategoryColor;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function TemplatesPage() {
  const router = useRouter();
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchText, setSearchText] = useState('');

  // 动态收集所有已有分类
  const allCategories = [...TEMPLATE_CATEGORIES];

  const filteredTemplates = mockTemplates.filter((t) => {
    const matchCategory = filterCategory === 'all' || t.category === filterCategory;
    const matchSearch = !searchText || t.name.includes(searchText) || t.description.includes(searchText);
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">模板管理</h1>
          <p className="mt-1 text-sm text-gray-500">
            研发与UI定义的皮肤/核心组件库，运营仅有引用权
          </p>
        </div>
      </div>

      {/* 筛选区域 */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索模板名称..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-9 border-gray-200"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px] border-gray-200">
            <SelectValue placeholder="筛选分类" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部分类</SelectItem>
            {allCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-gray-400">
          共 {filteredTemplates.length} 个模板
        </span>
      </div>

      {/* 模板列表 - 表格形式 */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="w-[200px]">模板名称</TableHead>
              <TableHead className="w-[120px]">模版分类</TableHead>
              <TableHead>说明</TableHead>
              <TableHead className="w-[100px] text-center">组件数</TableHead>
              <TableHead className="w-[160px]">创建时间 / 创建人</TableHead>
              <TableHead className="w-[160px]">操作时间 / 操作人</TableHead>
              <TableHead className="w-[80px] text-center">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTemplates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-gray-400">
                  暂无匹配的模板
                </TableCell>
              </TableRow>
            ) : (
              filteredTemplates.map((template: Template) => {
                const isMemberDay = template.category === '会员日';
                return (
                  <TableRow key={template.id} className={`hover:bg-gray-50/50${!isMemberDay ? ' opacity-60' : ''}`}>
                    <TableCell>
                      <span className="font-medium text-gray-900">{template.name}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getCategoryColor(template.category)}>
                        {template.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500 max-w-[280px] truncate">
                      {template.description}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-mono text-sm text-gray-700">{template.components.length}</span>
                      <span className="text-xs text-gray-400 ml-1">个</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-700">{formatDate(template.createdAt)}</div>
                      <div className="text-xs text-gray-400">{template.createdBy}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-700">{formatDate(template.updatedAt)}</div>
                      <div className="text-xs text-gray-400">{template.updatedBy}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      {isMemberDay ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-pink-600 hover:text-pink-700 hover:bg-pink-50"
                          onClick={() => router.push(`/templates/${template.id}`)}
                        >
                          <Pencil className="mr-1 h-3.5 w-3.5" />
                          编辑
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-300 cursor-not-allowed"
                          disabled
                        >
                          <Pencil className="mr-1 h-3.5 w-3.5" />
                          编辑
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
