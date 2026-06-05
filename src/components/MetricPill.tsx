import type { LucideIcon } from 'lucide-react'

type MetricPillProps = {
  icon: LucideIcon
  label: string
  value: string
}

export function MetricPill({ icon: Icon, label, value }: MetricPillProps) {
  return (
    <div className="metric-pill">
      <Icon aria-hidden="true" size={16} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
