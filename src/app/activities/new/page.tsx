'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ActivityFormWizard from '@/components/activity/activity-form-wizard';
import type { Activity } from '@/lib/types';

export default function NewActivityPage() {
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
          setCopiedActivity(result.data as Activity);
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
