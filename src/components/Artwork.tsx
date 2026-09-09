import { arcPoint, yearShare } from '../lib/model'

export function Mark() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true">
      <ellipse cx="16" cy="20" rx="10" ry="15" transform="rotate(-25 16 20)" />
      <ellipse cx="24" cy="20" rx="10" ry="15" transform="rotate(25 24 20)" />
    </svg>
  )
}

function contour(index: number) {
  const radius = 54 + index * 4.3
  return (
    Array.from({ length: 181 }, (_, step) => {
      const t = (step / 180) * Math.PI * 2
      const bend = Math.sin(t * 3 + index * 0.043) * (6 + index * 0.2) + Math.cos(t * 2) * 10
      const x = 295 + Math.cos(t) * (radius + bend) * 0.87 + Math.sin(index * 0.05) * 10
      const y = 280 + Math.sin(t) * (radius + bend) * 1.05
      return `${step ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`
    }).join(' ') + 'Z'
  )
}

export function TimeSculpture({ still }: { still: boolean }) {
  return (
    <div className={`time-sculpture ${still ? 'is-still' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 600 570" fill="none">
        <defs>
          <radialGradient id="paper-glow">
            <stop stopColor="#d6b98a" stopOpacity=".2" />
            <stop offset="1" stopColor="#e7d8b9" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="300" cy="295" r="280" fill="url(#paper-glow)" />
        <g className="sculpture-lines">
          {Array.from({ length: 43 }, (_, i) => (
            <path
              key={i}
              d={contour(i)}
              stroke={i > 32 ? '#797e68' : '#526450'}
              strokeWidth={i % 5 === 0 ? 1 : 0.65}
              opacity={0.38 + (i % 4) * 0.09}
            />
          ))}
        </g>
        <g className="sculpture-inner" stroke="#ab5737" strokeWidth=".8" opacity=".8">
          {Array.from({ length: 17 }, (_, i) => (
            <ellipse
              key={i}
              cx={260 - i * 1.25}
              cy={305 + i * 1.7}
              rx={73 + i * 2.9}
              ry={80 + i * 3.2}
              transform={`rotate(${-28 - i * 1.4} 260 305)`}
            />
          ))}
        </g>
        <path d="M413 139L474 84H547" stroke="#9c9c89" strokeWidth=".7" />
        <circle cx="413" cy="139" r="7" fill="#b66441" stroke="#f5f2e9" strokeWidth="3" />
        <text x="481" y="72" className="svg-note">
          one shared moment
        </text>
        <path d="M91 426H135L176 387" stroke="#9c9c89" strokeWidth=".7" />
        <text x="67" y="448" className="svg-note">
          many ways to feel it
        </text>
      </svg>
    </div>
  )
}

export function YearDial({
  age,
  progress,
  variant,
}: {
  age: number
  progress: number
  variant: 'copper' | 'sage'
}) {
  const share = yearShare(age)
  const point = arcPoint(age, progress)
  return (
    <svg
      className={`year-dial ${variant}`}
      viewBox="0 0 360 360"
      role="img"
      aria-label={`At age ${age}, one year is one ${age === 1 ? 'whole' : `part in ${age}`} of life so far, ${(share * 100).toFixed(1)} percent. The bright arc shows this proportion.`}
    >
      <g className="dial-threads" fill="none">
        {Array.from({ length: 11 }, (_, i) => (
          <circle key={i} cx="180" cy="180" r={87 + i * 3} />
        ))}
      </g>
      <g className="dial-ticks">
        {Array.from({ length: age }, (_, i) => (
          <line
            key={i}
            x1="180"
            y1="29"
            x2="180"
            y2={i === 0 ? 42 : 35}
            transform={`rotate(${(i / age) * 360} 180 180)`}
          />
        ))}
      </g>
      <circle className="dial-track" cx="180" cy="180" r="132" fill="none" strokeWidth="8" />
      <circle
        className="dial-potential"
        cx="180"
        cy="180"
        r="132"
        fill="none"
        strokeWidth="8"
        pathLength="1"
        strokeDasharray={`${share} 1`}
        transform="rotate(-90 180 180)"
      />
      <circle
        className="dial-year"
        cx="180"
        cy="180"
        r="132"
        fill="none"
        strokeWidth="8"
        pathLength="1"
        strokeDasharray={`${share * progress} 1`}
        transform="rotate(-90 180 180)"
      />
      <circle className="dial-point" cx={point.x} cy={point.y} r="6" />
      <text className="dial-age" x="180" y="185" textAnchor="middle">
        {age}
      </text>
      <text className="dial-label" x="180" y="212" textAnchor="middle">
        YEARS LIVED
      </text>
    </svg>
  )
}
