'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarDays, Clock, ArrowRight } from 'lucide-react';

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
  const containerRef = useRef<HTMLDivElement>(null);

  // Format display value for the compact input
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

  const handleContainerClick = () => {
    if (!startValue) {
      setActiveField('start');
      setTimeout(() => startRef.current?.showPicker?.(), 50);
    } else if (!endValue) {
      setActiveField('end');
      setTimeout(() => endRef.current?.showPicker?.(), 50);
    } else {
      setActiveField('start');
      setTimeout(() => startRef.current?.showPicker?.(), 50);
    }
  };

  // Auto advance: when start is set, focus end
  useEffect(() => {
    if (activeField === 'start' && startValue) {
      setActiveField('end');
      setTimeout(() => endRef.current?.showPicker?.(), 100);
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
      <div
        ref={containerRef}
        className="relative flex items-center gap-0 rounded-md border border-slate-200 bg-white cursor-pointer hover:border-slate-300 transition-colors h-9"
        onClick={handleContainerClick}
      >
        <CalendarDays className="h-4 w-4 text-slate-400 ml-2.5 shrink-0" />

        {/* Start time display */}
        <div
          className={`flex items-center gap-1.5 px-2 py-1.5 flex-1 min-w-0 ${
            activeField === 'start' ? 'bg-rose-50/50' : ''
          }`}
          onClick={(e) => {
            e.stopPropagation();
            setActiveField('start');
            setTimeout(() => startRef.current?.showPicker?.(), 50);
          }}
        >
          {hasStart ? (
            <span className="text-sm text-slate-900 font-mono">{formatDisplay(startValue)}</span>
          ) : (
            <span className="text-sm text-slate-400">
              {placeholder?.start || '开始时间'}
            </span>
          )}
        </div>

        <ArrowRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />

        {/* End time display */}
        <div
          className={`flex items-center gap-1.5 px-2 py-1.5 flex-1 min-w-0 ${
            activeField === 'end' ? 'bg-rose-50/50' : ''
          }`}
          onClick={(e) => {
            e.stopPropagation();
            setActiveField('end');
            setTimeout(() => endRef.current?.showPicker?.(), 50);
          }}
        >
          {hasEnd ? (
            <span className="text-sm text-slate-900 font-mono">{formatDisplay(endValue)}</span>
          ) : (
            <span className="text-sm text-slate-400">
              {placeholder?.end || '结束时间'}
            </span>
          )}
        </div>

        {/* Hidden native inputs for picker */}
        <Input
          ref={startRef}
          type="datetime-local"
          value={startValue}
          onChange={(e) => {
            onStartChange(e.target.value);
          }}
          className="sr-only"
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
        />
        <Input
          ref={endRef}
          type="datetime-local"
          value={endValue}
          onChange={(e) => {
            onEndChange(e.target.value);
          }}
          className="sr-only"
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
        />
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
      <div
        className="relative flex items-center rounded-md border border-slate-200 bg-white cursor-pointer hover:border-slate-300 transition-colors h-9"
        onClick={() => {
          setTimeout(() => inputRef.current?.showPicker?.(), 50);
        }}
      >
        <Clock className="h-4 w-4 text-slate-400 ml-2.5 shrink-0" />
        <div className="flex items-center px-2 py-1.5 flex-1 min-w-0">
          {hasValue ? (
            <span className="text-sm text-slate-900 font-mono">{formatDisplay(value)}</span>
          ) : (
            <span className="text-sm text-slate-400">{placeholder || '选择时间'}</span>
          )}
        </div>
        <Input
          ref={inputRef}
          type="datetime-local"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}
