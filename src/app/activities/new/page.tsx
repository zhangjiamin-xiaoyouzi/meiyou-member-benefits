'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ActivityFormWizard from '@/components/activity/activity-form-wizard';
import type { Activity } from '@/lib/types';

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

function NewActivityContent() {
  const searchParams = useSearchParams();
  const copyFromId = searchParams.get('copyFrom');
  const [copiedActivity, setCopiedActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(!!copyFromId);

  useEffect(() => {
    if (!copyFromId) {
      setLoading(false);
      return;
    }
    fetch(`/api/activities/${copyFromId}`)
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.data) {
          setCopiedActivity(toCamelCaseDeep(result.data) as Activity);
        }
      })
      .catch(() => {
        // ignore error, proceed without copy data
      })
      .finally(() => {
        setLoading(false);
      });
  }, [copyFromId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        加载中...
      </div>
    );
  }

  return <ActivityFormWizard initialData={copiedActivity} />;
}

export default function NewActivityPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20 text-slate-400">加载中...</div>}>
      <NewActivityContent />
    </Suspense>
  );
}
