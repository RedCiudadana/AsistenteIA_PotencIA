interface DonutSlice {
  value: number;
  color: string;
  label: string;
}

interface DonutChartProps {
  slices: DonutSlice[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerSub?: string;
}

export function DonutChart({ slices, size = 140, thickness = 24, centerLabel, centerSub }: DonutChartProps) {
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const total = slices.reduce((s, x) => s + x.value, 0);

  let offset = -circumference / 4; // start at 12 o'clock

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} className="flex-shrink-0">
        {/* Background track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={thickness} />

        {total === 0 ? (
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={thickness} />
        ) : slices.filter((s) => s.value > 0).map((slice, i) => {
          const dash = (slice.value / total) * circumference;
          const gap = circumference - dash;
          const el = (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={slice.color}
              strokeWidth={thickness}
              strokeDasharray={`${dash - 2} ${gap + 2}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              style={{ transition: 'stroke-dasharray 0.4s ease' }}
            />
          );
          offset += dash;
          return el;
        })}

        {/* Center text */}
        {centerLabel && (
          <>
            <text x={cx} y={cy - 4} textAnchor="middle" className="fill-[#0d2240] font-bold" fontSize={20} fontWeight={700}>
              {centerLabel}
            </text>
            {centerSub && (
              <text x={cx} y={cy + 14} textAnchor="middle" className="fill-gray-400" fontSize={10}>
                {centerSub}
              </text>
            )}
          </>
        )}
      </svg>

      {/* Legend */}
      <div className="flex flex-col gap-1.5 min-w-0">
        {slices.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="text-xs text-gray-600 truncate">{s.label}</span>
            <span className="text-xs font-bold text-gray-700 ml-auto pl-2">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface BarDay {
  date: string;
  values: { count: number; color: string }[];
}

interface ActivityBarChartProps {
  days: BarDay[];
  maxValue: number;
  height?: number;
}

export function ActivityBarChart({ days, maxValue, height = 80 }: ActivityBarChartProps) {
  if (days.length === 0) return null;
  const max = Math.max(maxValue, 1);

  return (
    <div className="flex items-end gap-px w-full" style={{ height }}>
      {days.map((day, i) => {
        const total = day.values.reduce((s, v) => s + v.count, 0);
        const barH = Math.max((total / max) * height, total > 0 ? 3 : 0);
        return (
          <div
            key={i}
            className="flex-1 flex flex-col justify-end rounded-sm overflow-hidden group relative"
            style={{ height }}
            title={`${day.date}: ${total} eventos`}
          >
            <div className="flex flex-col" style={{ height: barH }}>
              {day.values.map((v, vi) => {
                const segH = total > 0 ? (v.count / total) * barH : 0;
                return segH > 0 ? (
                  <div key={vi} style={{ height: segH, background: v.color, opacity: 0.85 }} />
                ) : null;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface HBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
  sublabel?: string;
}

export function HBar({ label, value, max, color, sublabel }: HBarProps) {
  const pct = max > 0 ? Math.max((value / max) * 100, value > 0 ? 4 : 0) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-36 flex-shrink-0">
        <p className="text-xs font-semibold text-[#0d2240] truncate leading-tight">{label}</p>
        {sublabel && <p className="text-[10px] text-gray-400">{sublabel}</p>}
      </div>
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-xs font-bold text-gray-700 w-8 text-right">{value}</span>
    </div>
  );
}
