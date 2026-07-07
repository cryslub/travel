export const DURATION_STEPS: { label: string; minDays: number; maxDays: number | null }[] = [
  { label: '< 1 week',  minDays: 0,   maxDays: 7    },
  { label: '2 weeks',   minDays: 8,  maxDays: 14   },
  { label: '3 weeks',   minDays: 15,  maxDays: 21   },
  { label: '1 month',   minDays: 22,  maxDays: 30   },
  { label: '2 months',  minDays: 31,  maxDays: 60   },
  { label: '3 months',  minDays: 61,  maxDays: 90  },
  { label: '3+ months', minDays: 91, maxDays: null  },
];

export const STEP_COUNT = DURATION_STEPS.length;

export function getDurationFilter(durMin: string | undefined, durMax: string | undefined) {
  const lo = Math.max(1, Math.min(STEP_COUNT, Number(durMin ?? 1)));
  const hi = Math.max(1, Math.min(STEP_COUNT, Number(durMax ?? STEP_COUNT)));
  const minDays = DURATION_STEPS[lo - 1].minDays;
  const maxDays = DURATION_STEPS[hi - 1].maxDays;
  const isDefault = lo === 1 && hi === STEP_COUNT;
  return { minDays, maxDays, isDefault };
}
