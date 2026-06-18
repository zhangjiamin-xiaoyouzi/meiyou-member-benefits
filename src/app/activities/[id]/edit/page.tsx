'use client';

import { useState, useEffect } from 'react';
import ActivityFormWizard from '@/components/activity/activity-form-wizard';
import type { Activity } from '@/lib/types';

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

/**
 * 仅转换顶层 key 为 camelCase，不递归转换嵌套对象内部的 key。
 * 因为 components 和 component_configs 内部的 key（如 flash_sale、global_config）
 * 本身就是 snake_case，是业务约定的组件标识符，不应被转换。
 */
function toCamelCaseShallow(obj: unknown): unknown {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    const record = obj as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(record)) {
      result[toCamelCase(key)] = record[key];
    }
    return result;
  }
  return obj;
}

export default function EditActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [id, setId] = useState('');

  useEffect(() => {
    params.then((p) => {
      setId(p.id);
      fetch(`/api/activities/${p.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setActivity(toCamelCaseShallow(data.data) as Activity);
          }
        })
        .finally(() => setLoading(false));
    });
  }, [params]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">活动不存在</div>
      </div>
    );
  }

  return <ActivityFormWizard editId={id} initialData={activity} />;
}
