'use client';

import { useState, useRef, useEffect } from 'react';
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

  // Auto advance: when start is set, focus end
  useEffect(() => {
    if (activeField === 'start' && startValue) {
      setActiveField('end');
      endRef.current?.focus();
    }
  }, [startValue, activeField]);

  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-sm text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div className="flex items-center gap-0 rounded-md border border-slate-200 bg-white hover:border-slate-300 transition-colors h-9 overflow-hidden">
        {/* Start time */}
        <div className={`relative flex-1 min-w-0 ${activeField === 'start' ? 'ring-1 ring-rose-300' : ''}`}>
          <input
            ref={startRef}
            type="datetime-local"
            value={startValue}
            onChange={(e) => {
              onStartChange(e.target.value);
            }}
            onFocus={() => setActiveField('start')}
            onBlur={() => setActiveField(null)}
            className="w-full h-9 px-2.5 py-1.5 text-sm font-mono bg-transparent border-0 outline-none focus:ring-0"
            style={{ colorScheme: 'light' }}
          />
          {!startValue && (
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none whitespace-nowrap">
              {placeholder?.start || '开始时间'}
            </span>
          )}
        </div>

        <ArrowRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />

        {/* End time */}
        <div className={`relative flex-1 min-w-0 ${activeField === 'end' ? 'ring-1 ring-rose-300' : ''}`}>
          <input
            ref={endRef}
            type="datetime-local"
            value={endValue}
            onChange={(e) => {
              onEndChange(e.target.value);
            }}
            onFocus={() => setActiveField('end')}
            onBlur={() => setActiveField(null)}
            className="w-full h-9 px-2 py-1.5 text-sm font-mono bg-transparent border-0 outline-none focus:ring-0"
            style={{ colorScheme: 'light' }}
          />
          {!endValue && (
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none whitespace-nowrap">
              {placeholder?.end || '结束时间'}
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-sm text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div className={`relative flex items-center rounded-md border bg-white hover:border-slate-300 transition-colors h-9 overflow-hidden ${focused ? 'border-rose-300' : 'border-slate-200'}`}>
        <input
          ref={inputRef}
          type="datetime-local"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full h-9 px-3 py-1.5 text-sm font-mono bg-transparent border-0 outline-none focus:ring-0"
          style={{ colorScheme: 'light' }}
        />
        {!value && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 pointer-events-none whitespace-nowrap">
            {placeholder || '选择时间'}
          </span>
        )}
      </div>
    </div>
  );
}
