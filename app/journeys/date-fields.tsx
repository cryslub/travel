'use client';
import { useState } from 'react';

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString('en-CA');
}

export function JourneyDateFields({
  defaultStartDate = '',
  defaultEndDate = '',
  previousStartDate,
  showShiftCheckbox = false,
}: {
  defaultStartDate?: string;
  defaultEndDate?: string;
  previousStartDate?: string;
  showShiftCheckbox?: boolean;
}) {
  const [startDate, setStartDate] = useState(
    defaultStartDate || (defaultEndDate ? addDays(defaultEndDate, -1) : ''),
  );
  const [endDate, setEndDate] = useState(
    defaultEndDate || (defaultStartDate ? addDays(defaultStartDate, 1) : ''),
  );

  const minEndDate = startDate || undefined;

  function handleStartChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setStartDate(val);
    if (val && (!endDate || endDate < val)) setEndDate(val);
  }

  const inputCls =
    'rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white';

  return (
    <>
      {previousStartDate !== undefined && (
        <input type="hidden" name="previous_start_date" value={previousStartDate} />
      )}
      <div className="flex flex-col gap-2">
        <label htmlFor="start_date" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Start Date</label>
        <input
          id="start_date"
          name="start_date"
          type="date"
          value={startDate}
          onChange={handleStartChange}
          className={inputCls}
        />
        {showShiftCheckbox && (
          <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            <input type="checkbox" name="shift_destinations" value="1" className="rounded" />
            Also shift the dates of destinations.
          </label>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="end_date" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">End Date</label>
        <input
          id="end_date"
          name="end_date"
          type="date"
          value={endDate}
          min={minEndDate}
          onChange={(e) => setEndDate(e.target.value)}
          className={inputCls}
        />
      </div>
    </>
  );
}
