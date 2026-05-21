export function toYAML(obj: unknown, indent = 0): string {
  const pad = '  '.repeat(indent)
  if (obj === null || obj === undefined) return 'null'
  if (typeof obj === 'string') {
    if (obj.includes('\n') || obj.includes(':') || obj.includes('#')) {
      return `"${obj.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
    }
    return obj
  }
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj)
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]'
    return obj.map(item => `\n${pad}- ${toYAML(item, indent + 1).trimStart()}`).join('')
  }
  if (typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>)
    if (entries.length === 0) return '{}'
    return entries.map(([k, v]) => {
      const val = toYAML(v, indent + 1)
      if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
        return `\n${pad}${k}:${val}`
      }
      return `\n${pad}${k}: ${val}`
    }).join('')
  }
  return String(obj)
}

export function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  downloadBlob(blob, filename)
}

export function downloadYAML(data: unknown, filename: string) {
  const yaml = toYAML(data)
  const blob = new Blob([yaml], { type: 'text/yaml' })
  downloadBlob(blob, filename)
}

function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}
