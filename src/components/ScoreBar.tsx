type ScoreBarProps = {
  label: string
  value: number
  tone?: 'blue' | 'green' | 'amber' | 'ink'
}

export function ScoreBar({ label, value, tone = 'blue' }: ScoreBarProps) {
  return (
    <div className="scorebar" data-tone={tone}>
      <div className="scorebar__row">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="scorebar__track" aria-hidden="true">
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}
