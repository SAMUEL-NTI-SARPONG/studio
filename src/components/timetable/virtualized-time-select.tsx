
'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

const formatTime12h = (h: number, m: number) => {
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour12)}:${String(m).padStart(2, '0')} ${period}`;
};

const generateTimeSlots = () => {
  const slots: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 5) {
      const hour = String(h).padStart(2, '0');
      const minute = String(m).padStart(2, '0');
      slots.push({
        value: `${hour}:${minute}`,
        label: formatTime12h(h, m),
      });
    }
  }
  return slots;
};

// Generate time slots only once
const timeSlots = generateTimeSlots();

interface VirtualizedTimeSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function VirtualizedTimeSelect({
  value,
  onChange,
  disabled,
}: VirtualizedTimeSelectProps) {
  const selectedSlot = useMemo(() => timeSlots.find(slot => slot.value === value), [value]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && value) {
      const selectedIndex = timeSlots.findIndex(slot => slot.value === value);
      if (selectedIndex !== -1) {
        // We can't directly scroll to the item as it might not be rendered yet.
        // Radix's Select component handles this internally when opened.
        // A possible enhancement would be to use a more advanced virtualized list,
        // but for now, we rely on the default behavior.
      }
    }
  }, [value]);

  return (
    <Select
      onValueChange={onChange}
      defaultValue={value}
      value={value}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a time">
          {selectedSlot?.label || value}
        </SelectValue>
      </SelectTrigger>
      <SelectContent ref={scrollRef}>
        {timeSlots.map((slot) => (
          <SelectItem
            key={slot.value}
            value={slot.value}
          >
            {slot.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
