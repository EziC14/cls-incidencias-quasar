export function fmtFecha(val) {
  if (!val) return '—'
  const s = String(val).replace(/[-\s]/g, '')
  if (s.length === 8 && /^\d{8}$/.test(s)) return `${s.slice(6, 8)}/${s.slice(4, 6)}/${s.slice(0, 4)}`
  return val
}

export function fmtMoney(val) {
  if (!val && val !== 0) return '—'
  const n = Number(val)
  if (isNaN(n)) return val
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
