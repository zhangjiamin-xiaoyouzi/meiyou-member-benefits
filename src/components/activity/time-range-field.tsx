'use client';

import { useState, useRef, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { ArrowRight } from 'lucide-react';

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
  }, []);

  const handleEndClick = useCallback(() => {
    setEditing('end');
  }, []);

  const handleStartBlur = useCallback(() => {
    // Delay to avoid flicker when clicking end
    setTimeout(() => {
      if (editing === 'start') setEditing(null);
    }, 150);
  }, [editing]);

  const handleEndBlur = useCallback(() => {
    setTimeout(() => {
      if (editing === 'end') setEditing(null);
    }, 150);
  }, [editing]);

  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-sm text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div className="flex items-center gap-0 rounded-md border border-slate-200 bg-white hover:border-slate-300 transition-colors h-9 overflow-hidden">
        {/* Start time - native input always rendered, styled as transparent overlay */}
        <div className="relative flex-1 min-w-0 flex items-center h-full">
          <input
            ref={startRef}
            type="datetime-local"
            value={startValue}
            onChange={(e) => onStartChange(e.target.value)}
            onFocus={handleStartClick}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            tabIndex={-1}
          />
          <div
            className={`w-full h-full flex items-center px-2.5 pointer-events-none ${editing === 'start' ? 'bg-rose-50' : ''}`}
          >
            <span className={`text-sm font-mono truncate ${startValue ? 'text-slate-800' : 'text-slate-400'}`}>
              {startValue ? formatDateTime(startValue) : (placeholder?.start || '开始时间')}
            </span>
          </div>
        </div>

        <ArrowRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />

        {/* End time - native input always rendered, styled as transparent overlay */}
        <div className="relative flex-1 min-w-0 flex items-center h-full">
          <input
            ref={endRef}
            type="datetime-local"
            value={endValue}
            onChange={(e) => onEndChange(e.target.value)}
            onFocus={handleEndClick}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            tabIndex={-1}
          />
          <div
            className={`w-full h-full flex items-center px-2 pointer-events-none ${editing === 'end' ? 'bg-rose-50' : ''}`}
          >
            <span className={`text-sm font-mono truncate ${endValue ? 'text-slate-800' : 'text-slate-400'}`}>
              {endValue ? formatDateTime(endValue) : (placeholder?.end || '结束时间')}
            </span>
          </div>
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
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = useCallback(() => {
    setFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setTimeout(() => setFocused(false), 150);
  }, []);

  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-sm text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div
        className={`relative flex items-center rounded-md border transition-colors h-9 overflow-hidden cursor-pointer ${focused ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
      >
        <input
          ref={inputRef}
          type="datetime-local"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          tabIndex={-1}
        />
        <div className="w-full h-full flex items-center px-3 pointer-events-none">
          <span className={`text-sm font-mono truncate ${value ? 'text-slate-800' : 'text-slate-400'}`}>
            {value ? formatDateTime(value) : (placeholder || '选择时间')}
          </span>
        </div>
      </div>
    </div>
  );
}
