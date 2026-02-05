'use client';

import React, { useState, useRef, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isBefore, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from './Button';

interface DateTimePickerProps {
  label?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabledDays?: Date[];
  className?: string;
}

export function DateTimePicker({
  label,
  value,
  onChange,
  placeholder = 'Pilih tanggal dan waktu',
  disabledDays = [],
  className,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const [hours, setHours] = useState(value ? value.getHours() : 9);
  const [minutes, setMinutes] = useState(value ? value.getMinutes() : 0);
  const containerRef = useRef<HTMLDivElement>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const isDisabled = (date: Date) => {
    return disabledDays.some(d => isSameDay(d, date)) || isBefore(date, startOfDay(new Date()));
  };

  const handleDateClick = (date: Date) => {
    if (isDisabled(date)) return;
    const newDate = new Date(date);
    newDate.setHours(hours, minutes);
    onChange?.(newDate);
    setIsOpen(false);
  };

  const handleTimeChange = (type: 'hours' | 'minutes', delta: number) => {
    const newHours = type === 'hours' ? hours + delta : hours;
    const newMinutes = type === 'minutes' ? minutes + delta : minutes;
    
    setHours(Math.min(23, Math.max(0, newHours)));
    setMinutes(Math.min(59, Math.max(0, newMinutes)));

    if (value) {
      const newDate = new Date(value);
      newDate.setHours(
        Math.min(23, Math.max(0, type === 'hours' ? newHours : hours)),
        Math.min(59, Math.max(0, type === 'minutes' ? newMinutes : minutes))
      );
      onChange?.(newDate);
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

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div ref={containerRef} className={clsx('relative', className)}>
      {label && (
        <label className="text-sm font-medium text-[var(--foreground)]">
          {label}
        </label>
      )}
      
      <div className="relative mt-1">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(
            'w-full h-10 px-3 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)]',
            'text-left text-sm font-normal transition-colors',
            'hover:bg-[var(--color-gray-100)]',
            'flex items-center gap-2',
            !value && 'text-[var(--color-gray-500)]'
          )}
        >
          <CalendarIcon className="w-4 h-4 text-[var(--color-gray-400)]" />
          {value ? format(value, 'PPP HH:mm') : placeholder}
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

              <div className="grid grid-cols-7 gap-1 mb-3">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-xs text-center text-[var(--color-gray-500)]"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 mb-3">
                {days.map((day, idx) => {
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isSelected = value && isSameDay(day, value);
                  const disabled = isDisabled(day);

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleDateClick(day)}
                      className={clsx(
                        'h-8 w-8 text-xs rounded-md transition-colors flex items-center justify-center relative z-10',
                        !isCurrentMonth && 'invisible',
                        isSelected && 'bg-[var(--color-secondary)] text-white',
                        !isSelected && !disabled && 'hover:bg-[var(--color-gray-100)]',
                        isSameDay(day, new Date()) && !isSelected && 'font-semibold',
                        disabled && 'text-[var(--color-gray-400)] opacity-50 cursor-not-allowed'
                      )}
                    >
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-2 border-t pt-3">
                <Clock className="h-4 w-4 text-[var(--color-gray-500)]" />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleTimeChange('hours', -1)}
                >
                  -
                </Button>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={hours.toString().padStart(2, '0')}
                    onChange={(e) => {
                      const h = Math.min(23, Math.max(0, parseInt(e.target.value) || 0));
                      setHours(h);
                      if (value) {
                        const newDate = new Date(value);
                        newDate.setHours(h, minutes);
                        onChange?.(newDate);
                      }
                    }}
                    className="w-12 text-center border border-[var(--card-border)] rounded px-1 py-1 text-sm bg-[var(--card-bg)]"
                  />
                  <span>:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={minutes.toString().padStart(2, '0')}
                    onChange={(e) => {
                      const m = Math.min(59, Math.max(0, parseInt(e.target.value) || 0));
                      setMinutes(m);
                      if (value) {
                        const newDate = new Date(value);
                        newDate.setHours(hours, m);
                        onChange?.(newDate);
                      }
                    }}
                    className="w-12 text-center border border-[var(--card-border)] rounded px-1 py-1 text-sm bg-[var(--card-bg)]"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleTimeChange('hours', 1)}
                >
                  +
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
