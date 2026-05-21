export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />
}

export function SkeletonCard() {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-10" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  )
}

export function SkeletonResult() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4 animate-fade-in">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-10 w-16" />
      </div>
      <Skeleton className="h-3 w-full rounded-full" />
      <div className="grid gap-3 sm:grid-cols-2">
        {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
      </div>
    </div>
  )
}
