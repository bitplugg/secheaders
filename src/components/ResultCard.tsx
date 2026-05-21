'use client'

import type { HeaderCheck } from '@/lib/types'

const scoreColor = (s: number) =>
  s >= 4 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' :
  s >= 2 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'

export function ResultCard({ check }: { check: HeaderCheck }) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-sm">{check.displayName}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{check.description}</p>
        </div>
        <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${scoreColor(check.score)}`}>
          {check.score}/{check.maxScore}
        </span>
      </div>
      {check.value && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded px-2 py-1">
          <code className="text-xs break-all text-gray-600 dark:text-gray-300">{check.value}</code>
        </div>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400">{check.details}</p>
    </div>
  )
}
