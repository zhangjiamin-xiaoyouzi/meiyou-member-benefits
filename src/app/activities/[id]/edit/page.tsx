'use client';

import { useState, useEffect } from 'react';
import ActivityFormWizard from '@/components/activity/activity-form-wizard';
import type { Activity } from '@/lib/types';

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
            setActivity(data.data);
          }
        })
        .finally(() => setLoading(false));
    });
  }, [params]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">加载中...</div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">活动不存在</div>
      </div>
    );
  }

  return <ActivityFormWizard editId={id} initialData={activity} />;
}
