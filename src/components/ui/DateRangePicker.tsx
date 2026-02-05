'use client';

import React, { useState, useRef, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, addMonths, subMonths, isBefore, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from './Button';

interface DateRange {
  start?: Date;
  end?: Date;
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Pilih rentang tanggal',
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value?.start || new Date());
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const isDisabled = (date: Date) => {
    return isBefore(date, startOfDay(new Date()));
  };

  const isInRange = (date: Date) => {
    if (value?.start && value?.end) {
      return isWithinInterval(date, { start: value.start, end: value.end });
    }
    if (value?.start && hoverDate) {
      const start = isBefore(hoverDate, value.start) ? hoverDate : value.start;
      const end = isBefore(hoverDate, value.start) ? value.start : hoverDate;
      return isWithinInterval(date, { start, end });
    }
    return false;
  };

  const isSelected = (date: Date) => {
    if (value?.start && isSameDay(date, value.start)) return true;
    if (value?.end && isSameDay(date, value.end)) return true;
    return false;
  };

  const handleDateClick = (date: Date) => {
    if (isDisabled(date)) return;
    
    if (!value?.start || (value.start && value.end)) {
      onChange?.({ start: date, end: undefined });
    } else if (value.start && !value.end) {
      if (isBefore(date, value.start)) {
        onChange?.({ start: date, end: value.start });
      } else {
        onChange?.({ start: value.start, end: date });
      }
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatValue = () => {
    if (!value?.start) return placeholder;
    if (value?.start && value?.end) {
      return `${format(value.start, 'PPP')} - ${format(value.end, 'PPP')}`;
    }
    return `${format(value.start, 'PPP')} - ...`;
  };

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div ref={containerRef} className={clsx('relative', className)}>
      <label className="text-sm font-medium text-[var(--color-gray-700)]">Tanggal</label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(
            'w-full h-10 px-3 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)]',
            'text-left text-sm font-normal transition-colors',
            'hover:bg-[var(--color-gray-100)]',
            'flex items-center gap-2',
            !value?.start && 'text-[var(--color-gray-500)]'
          )}
        >
          <CalendarIcon className="w-4 h-4 text-[var(--color-gray-400)]" />
          {formatValue()}
        </button>

        {isOpen && (
          <div className="absolute left-0 top-full mt-1 z-[9999]">
            <div className="w-auto rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xl p-3">
              <div className="flex items-center justify-between mb-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-semibold text-[var(--foreground)]">
                  {format(currentMonth, 'MMMM yyyy')}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-xs text-center text-[var(--color-gray-500)]"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((day, idx) => {
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const selected = isSelected(day);
                  const inRange = isInRange(day);
                  const disabled = isDisabled(day);

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleDateClick(day)}
                      onMouseEnter={() => setHoverDate(day)}
                      onMouseLeave={() => setHoverDate(null)}
                      className={clsx(
                        'h-8 w-8 text-xs rounded-md transition-colors flex items-center justify-center relative z-10',
                        !isCurrentMonth && 'invisible',
                        selected && 'bg-[var(--color-secondary)] text-white',
                        !selected && inRange && 'bg-[var(--color-gray-200)] dark:bg-[var(--color-gray-600)]',
                        !selected && !inRange && !disabled && 'hover:bg-[var(--color-gray-100)]',
                        isSameDay(day, new Date()) && !selected && 'font-semibold',
                        disabled && 'text-[var(--color-gray-400)] opacity-50 cursor-not-allowed'
                      )}
                    >
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
