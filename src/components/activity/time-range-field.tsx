'use client';

import { useState, useRef, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { ArrowRight, Calendar } from 'lucide-react';

interface TimeRangeFieldProps {
  label?: string;
  required?: boolean;
  startValue: string;
  endValue: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  placeholder?: { start?: string; end?: string };
}

function formatDateTime(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${mm}-${dd} ${hh}:${mi}`;
}

export function TimeRangeField({
  label,
  required,
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  placeholder,
}: TimeRangeFieldProps) {
  const [editing, setEditing] = useState<'start' | 'end' | null>(null);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  const handleStartClick = useCallback(() => {
    setEditing('start');
    setTimeout(() => startRef.current?.showPicker?.(), 0);
  }, []);

  const handleEndClick = useCallback(() => {
    setEditing('end');
    setTimeout(() => endRef.current?.showPicker?.(), 0);
  }, []);

  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-sm text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div className="flex items-center gap-0 rounded-md border border-slate-200 bg-white hover:border-slate-300 transition-colors h-9 overflow-hidden">
        {/* Start time */}
        <div
          className={`relative flex-1 min-w-0 flex items-center h-full px-2.5 cursor-text ${editing === 'start' ? 'bg-rose-50' : ''}`}
          onClick={handleStartClick}
        >
          {editing === 'start' ? (
            <input
              ref={startRef}
              type="datetime-local"
              value={startValue}
              onChange={(e) => {
                onStartChange(e.target.value);
              }}
              onBlur={() => setEditing(null)}
              autoFocus
              className="w-full h-full text-sm font-mono bg-transparent border-0 outline-none focus:ring-0 p-0"
              style={{ colorScheme: 'light' }}
            />
          ) : (
            <span className={`text-sm font-mono truncate ${startValue ? 'text-slate-800' : 'text-slate-400'}`}>
              {startValue ? formatDateTime(startValue) : (placeholder?.start || '开始时间')}
            </span>
          )}
        </div>

        <ArrowRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />

        {/* End time */}
        <div
          className={`relative flex-1 min-w-0 flex items-center h-full px-2 cursor-text ${editing === 'end' ? 'bg-rose-50' : ''}`}
          onClick={handleEndClick}
        >
          {editing === 'end' ? (
            <input
              ref={endRef}
              type="datetime-local"
              value={endValue}
              onChange={(e) => {
                onEndChange(e.target.value);
              }}
              onBlur={() => setEditing(null)}
              autoFocus
              className="w-full h-full text-sm font-mono bg-transparent border-0 outline-none focus:ring-0 p-0"
              style={{ colorScheme: 'light' }}
            />
          ) : (
            <span className={`text-sm font-mono truncate ${endValue ? 'text-slate-800' : 'text-slate-400'}`}>
              {endValue ? formatDateTime(endValue) : (placeholder?.end || '结束时间')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface SingleTimeFieldProps {
  label?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SingleTimeField({
  label,
  required,
  value,
  onChange,
  placeholder,
}: SingleTimeFieldProps) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = useCallback(() => {
    setEditing(true);
    setTimeout(() => inputRef.current?.showPicker?.(), 0);
  }, []);

  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-sm text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div
        className={`flex items-center rounded-md border bg-white hover:border-slate-300 transition-colors h-9 overflow-hidden cursor-text ${editing ? 'border-rose-300 bg-rose-50' : 'border-slate-200'}`}
        onClick={handleClick}
      >
        <div className="flex-1 flex items-center h-full px-3">
          {editing ? (
            <input
              ref={inputRef}
              type="datetime-local"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={() => setEditing(false)}
              autoFocus
              className="w-full h-full text-sm font-mono bg-transparent border-0 outline-none focus:ring-0 p-0"
              style={{ colorScheme: 'light' }}
            />
          ) : (
            <span className={`text-sm font-mono truncate ${value ? 'text-slate-800' : 'text-slate-400'}`}>
              {value ? formatDateTime(value) : (placeholder || '选择时间')}
            </span>
          )}
        </div>
        <div className="pr-2.5 text-slate-400">
          <Calendar className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
