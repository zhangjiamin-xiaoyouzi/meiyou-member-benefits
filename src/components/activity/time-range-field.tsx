'use client';

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
}: TimeRangeFieldProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-sm text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div className="flex items-center gap-1.5">
        <input
          type="datetime-local"
          value={startValue}
          onChange={(e) => onStartChange(e.target.value)}
          className="flex-1 min-w-0 h-9 rounded-md border border-gray-200 bg-white px-2.5 text-sm font-mono text-gray-800 placeholder:text-gray-400 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-meiyou transition-colors"
        />
        <ArrowRight className="h-3.5 w-3.5 text-gray-300 shrink-0" />
        <input
          type="datetime-local"
          value={endValue}
          onChange={(e) => onEndChange(e.target.value)}
          className="flex-1 min-w-0 h-9 rounded-md border border-gray-200 bg-white px-2.5 text-sm font-mono text-gray-800 placeholder:text-gray-400 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-meiyou transition-colors"
        />
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
}: SingleTimeFieldProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <Label className="text-sm text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 rounded-md border border-gray-200 bg-white px-3 text-sm font-mono text-gray-800 placeholder:text-gray-400 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-meiyou transition-colors"
      />
    </div>
  );
}
