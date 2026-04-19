'use client'

import { useState } from 'react';

export function TransportTimeFields({
  defaultStartTime = '',
  defaultEndTime = '',
}: {
  defaultStartTime?: string;
  defaultEndTime?: string;
}) {
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(defaultEndTime);

  function handleStartTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newStart = e.target.value;
    setStartTime(newStart);
    if (!endTime || endTime < newStart) {
      setEndTime(newStart);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <label htmlFor="start_time" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Start Time</label>
        <input
          id="start_time"
          name="start_time"
          type="datetime-local"
          value={startTime}
          onChange={handleStartTimeChange}
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="end_time" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">End Time</label>
        <input
          id="end_time"
          name="end_time"
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:ring-white"
        />
      </div>
    </>
  );
}
