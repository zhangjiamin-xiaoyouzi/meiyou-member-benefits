'use client';

import { useState, useRef, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { ArrowRight } from 'lucide-react';

interface TimeRangeFieldProps {
  label: string;
  required?: boolean;
  startValue: string;
  endValue: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  placeholder?: { start?: string; end?: string };
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
  const [activeField, setActiveField] = useState<'start' | 'end' | null>(null);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  const formatDisplay = (value: string) => {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${month}-${day} ${hours}:${mins}`;
  };

  // Auto advance: when start is set, focus end
  useEffect(() => {
    if (activeField === 'start' && startValue) {
      setActiveField('end');
      endRef.current?.focus();
    }
  }, [startValue, activeField]);

  const hasStart = !!startValue;
  const hasEnd = !!endValue;

  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-sm text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div className="flex items-center gap-0 rounded-md border border-slate-200 bg-white hover:border-slate-300 transition-colors h-9 overflow-hidden">
        {/* Start time - native input overlaid */}
        <div className={`relative flex-1 min-w-0 ${activeField === 'start' ? 'bg-rose-50/50' : ''}`}>
          <input
            ref={startRef}
            type="datetime-local"
            value={startValue}
            onChange={(e) => {
              onStartChange(e.target.value);
            }}
            onFocus={() => setActiveField('start')}
            onBlur={() => setActiveField(null)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            tabIndex={0}
          />
          <div className="flex items-center px-2.5 py-1.5 pointer-events-none">
            {hasStart ? (
              <span className="text-sm text-slate-900 font-mono">{formatDisplay(startValue)}</span>
            ) : (
              <span className="text-sm text-slate-400">
                {placeholder?.start || '开始时间'}
              </span>
            )}
          </div>
        </div>

        <ArrowRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />

        {/* End time - native input overlaid */}
        <div className={`relative flex-1 min-w-0 ${activeField === 'end' ? 'bg-rose-50/50' : ''}`}>
          <input
            ref={endRef}
            type="datetime-local"
            value={endValue}
            onChange={(e) => {
              onEndChange(e.target.value);
            }}
            onFocus={() => setActiveField('end')}
            onBlur={() => setActiveField(null)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            tabIndex={0}
          />
          <div className="flex items-center px-2.5 py-1.5 pointer-events-none">
            {hasEnd ? (
              <span className="text-sm text-slate-900 font-mono">{formatDisplay(endValue)}</span>
            ) : (
              <span className="text-sm text-slate-400">
                {placeholder?.end || '结束时间'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface SingleTimeFieldProps {
  label: string;
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
  const inputRef = useRef<HTMLInputElement>(null);
  const hasValue = !!value;
  const formatDisplay = (v: string) => {
    if (!v) return '';
    const d = new Date(v);
    if (isNaN(d.getTime())) return v;
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${month}-${day} ${hours}:${mins}`;
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-sm text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div className="relative flex items-center rounded-md border border-slate-200 bg-white hover:border-slate-300 transition-colors h-9 overflow-hidden">
        <input
          ref={inputRef}
          type="datetime-local"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          tabIndex={0}
        />
        <div className="flex items-center px-2.5 py-1.5 pointer-events-none">
          {hasValue ? (
            <span className="text-sm text-slate-900 font-mono">{formatDisplay(value)}</span>
          ) : (
            <span className="text-sm text-slate-400">{placeholder || '选择时间'}</span>
          )}
        </div>
      </div>
    </div>
  );
}
