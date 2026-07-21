export function ProgressBar({
  value,
  max,
  label,
  color = '#58CC02',
  height = 16,
}: {
  value: number
  max: number
  label?: string
  color?: string
  height?: number
}) {
  const pct = Math.min(100, Math.round((value / max) * 100))

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '4px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#555',
        }}>
          <span>{label}</span>
          <span>{value}/{max}</span>
        </div>
      )}
      <div style={{
        width: '100%',
        height: `${height}px`,
        background: '#E5E5E5',
        borderRadius: `${height / 2}px`,
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: color,
          borderRadius: `${height / 2}px`,
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  )
}
