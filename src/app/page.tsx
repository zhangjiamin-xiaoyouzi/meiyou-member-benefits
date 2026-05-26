'use client';

import { LayoutDashboard, FileText, Tag } from 'lucide-react';
import Link from 'next/link';

export default function OverviewPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <LayoutDashboard className="h-6 w-6 text-rose-500" />
        <h1 className="text-2xl font-semibold text-slate-900">活动概览</h1>
        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">本期不做</span>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <LayoutDashboard className="h-8 w-8 text-slate-400" />
        </div>
        <h2 className="text-lg font-medium text-slate-700 mb-2">活动概览功能规划中</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          活动概览将提供活动数据看板、运营指标追踪、活动效果对比等功能，敬请期待。
        </p>
        <div className="flex items-center justify-center gap-6 mt-8">
          <Link
            href="/templates"
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 transition-colors"
          >
            <FileText className="h-4 w-4" />
            模板管理
          </Link>
          <Link
            href="/activities"
            className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 rounded-lg text-sm text-white transition-colors"
          >
            <Tag className="h-4 w-4" />
            活动列表
          </Link>
        </div>
      </div>
    </div>
  );
}
