export const StatCardSkeleton = () => (
  <div className="animate-pulse rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
    <div className="mb-3 h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
    <div className="mb-2 h-8 w-16 rounded-lg bg-slate-200 dark:bg-slate-700" />
    <div className="mb-1 h-3 w-24 rounded bg-slate-100 dark:bg-slate-800" />
    <div className="h-3 w-20 rounded bg-slate-100 dark:bg-slate-800" />
  </div>
);

export const ListItemSkeleton = ({ count = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex animate-pulse items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="h-6 w-14 rounded-full bg-slate-100 dark:bg-slate-800" />
      </div>
    ))}
  </div>
);

export const SkeletonList = ListItemSkeleton;

export const ChartSkeleton = ({ height = 240 }) => (
  <div
    className="animate-pulse rounded-lg bg-slate-50 dark:bg-slate-900/50"
    style={{ height }}
  />
);

export const CardGridSkeleton = ({ count = 6, height = 180 }) => (
  <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="animate-pulse rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm"
        style={{ height }}
      >
        <div className="flex items-center justify-between">
          <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-12 rounded-full bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-3 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div className="h-6 w-16 rounded bg-slate-100 dark:bg-slate-800" />
          <div className="h-6 w-24 rounded bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="animate-pulse rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
    <div className="flex border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-5 py-4">
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="h-4 flex-1 rounded bg-slate-200 dark:bg-slate-700 mx-2 first:ml-0 last:mr-0" />
      ))}
    </div>
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex px-5 py-4">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-3 flex-1 rounded bg-slate-100 dark:bg-slate-800 mx-2 first:ml-0 last:mr-0" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const PageSkeleton = ({ tabs = false }) => (
  <div className="space-y-6">
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-72 rounded bg-slate-100 dark:bg-slate-800" />
      </div>
      <div className="h-10 w-32 rounded-lg bg-slate-200 dark:bg-slate-700" />
    </div>

    {tabs && (
      <div className="flex gap-2 animate-pulse">
        <div className="h-9 w-24 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-9 w-24 rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-9 w-24 rounded bg-slate-100 dark:bg-slate-800" />
      </div>
    )}

    <div className="grid gap-4 md:grid-cols-4">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>

    <div className="h-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
      <ChartSkeleton height={200} />
    </div>
  </div>
);

export const KanbanBoardSkeleton = () => (
  <div className="space-y-6">
    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-72 rounded bg-slate-100 dark:bg-slate-800" />
      </div>
      <div className="h-10 w-36 rounded-lg bg-slate-200 dark:bg-slate-700" />
    </div>

    <div className="grid gap-4 md:grid-cols-4 animate-pulse">
      <div className="h-24 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm" />
      <div className="h-24 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm" />
      <div className="h-24 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm" />
      <div className="h-24 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm" />
    </div>

    <div className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-5 animate-pulse">
      {Array.from({ length: 5 }).map((_, colIndex) => (
        <div key={colIndex} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-20 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-5 w-6 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: colIndex % 2 === 0 ? 3 : 2 }).map((_, cardIndex) => (
              <div key={cardIndex} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                  <div className="h-3.5 flex-1 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
                <div className="h-10 rounded bg-slate-100 dark:bg-slate-800/50" />
                <div className="flex justify-between items-center">
                  <div className="h-4 w-12 rounded bg-slate-100 dark:bg-slate-800/50" />
                  <div className="h-4 w-8 rounded bg-slate-100 dark:bg-slate-800/50" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const CalendarSkeleton = () => (
  <div className="space-y-6">
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-32 rounded-lg bg-slate-200 dark:bg-slate-700" />
        <div className="h-4 w-96 rounded bg-slate-100 dark:bg-slate-800" />
      </div>
      <div className="h-10 w-64 rounded-lg bg-slate-200 dark:bg-slate-700" />
    </div>

    <div className="grid gap-3 sm:grid-cols-4 animate-pulse">
      <div className="h-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
      <div className="h-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
      <div className="h-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
      <div className="h-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
    </div>

    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm animate-pulse">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-6 w-32 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="flex gap-2">
          <div className="h-8 w-20 rounded bg-slate-100 dark:bg-slate-800" />
          <div className="h-8 w-20 rounded bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-8 rounded bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center">
            <div className="h-3 w-8 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
        {Array.from({ length: 28 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg border border-slate-100 dark:border-slate-800/50 p-2 flex flex-col justify-between">
            <div className="h-4 w-4 rounded bg-slate-200 dark:bg-slate-700" />
            {i % 4 === 0 && <div className="h-6 w-full rounded bg-slate-100 dark:bg-slate-800/50" />}
          </div>
        ))}
      </div>
    </div>
  </div>
);
