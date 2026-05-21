'use client'

const COLORS: Record<string, string> = {
  A: 'bg-emerald-500',
  B: 'bg-green-500',
  C: 'bg-lime-500',
  D: 'bg-yellow-500',
  E: 'bg-orange-500',
  F: 'bg-red-500',
}

export function ScoreBadge({ grade }: { grade: string }) {
  const color = COLORS[grade] ?? 'bg-gray-400'
  return (
    <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-white font-bold text-xl shadow-sm ${color}`}>
      {grade}
    </span>
  )
}

export function ScoreBar({ score, maxScore }: { score: number; maxScore: number }) {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0
  const color =
    pct >= 90 ? 'bg-emerald-500' :
    pct >= 75 ? 'bg-green-500' :
    pct >= 60 ? 'bg-lime-500' :
    pct >= 45 ? 'bg-yellow-500' :
    pct >= 25 ? 'bg-orange-500' : 'bg-red-500'

  return (
    <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
      <div
        className={`h-3 rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
