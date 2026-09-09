import { yearShare } from '../lib/model'
import { motion, useTransform } from 'motion/react'
import type { MotionValue } from 'motion/react'

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

// One shared progress value draws the same twelve months along the strip and
// into one year-sized segment of each life. Age changes the context, not speed.
export function YearStrip({ progress }: { progress: MotionValue<number> }) {
  const width = useTransform(progress, (value) => value * 240)
  return (
    <figure className="shared-year">
      <figcaption>
        One year <span>The same twelve months.</span>
      </figcaption>
      <svg viewBox="0 0 242 24" aria-hidden="true">
        <rect className="year-strip-outline" x="1" y="3" width="240" height="18" rx="2" />
        <motion.rect className="year-strip-fill" x="1" y="3" width={width} height="18" rx="2" />
        {Array.from({ length: 11 }, (_, i) => (
          <line
            key={i}
            x1={21 + i * 20}
            y1="4"
            x2={21 + i * 20}
            y2="20"
            className="year-strip-month"
          />
        ))}
      </svg>
      <div className="year-bookends" aria-hidden="true">
        <span>January</span>
        <span>December</span>
      </div>
    </figure>
  )
}

export function YearDial({ age, progress }: { age: number; progress: MotionValue<number> }) {
  const share = yearShare(age)
  const dash = useTransform(progress, (value) => `${share * value} 1`)
  const x = useTransform(
    progress,
    (value) => 180 + 128 * Math.cos(value * share * Math.PI * 2 - Math.PI / 2),
  )
  const y = useTransform(
    progress,
    (value) => 180 + 128 * Math.sin(value * share * Math.PI * 2 - Math.PI / 2),
  )
  const pointOpacity = useTransform(progress, (value) => (value > 0 && value < 1 ? 1 : 0))
  return (
    <div className="dial-illustration">
      <svg
        className="year-dial"
        viewBox="0 0 360 360"
        role="img"
        aria-label={`${age} ${age === 1 ? 'year' : 'years'} lived. Each segment is one year. The copper segment is ${age === 1 ? 'the whole circle' : `one of ${age} years`}, ${(share * 100).toFixed(1)} percent of life so far.`}
      >
        <circle className="dial-inner-thread" cx="180" cy="180" r="99" fill="none" />
        <circle className="dial-outer-thread" cx="180" cy="180" r="153" fill="none" />
        <g className="dial-segments" fill="none" strokeWidth="34">
          {Array.from({ length: age }, (_, i) => (
            <circle
              className={`dial-segment ${i === 0 ? 'is-one-year' : ''}`}
              key={i}
              cx="180"
              cy="180"
              r="128"
              pathLength="1"
              strokeDasharray={`${share} 1`}
              transform={`rotate(${-90 + i * share * 360} 180 180)`}
            />
          ))}
        </g>
        <motion.circle
          className="dial-year"
          cx="180"
          cy="180"
          r="128"
          fill="none"
          strokeWidth="34"
          pathLength="1"
          strokeDasharray={dash}
          transform="rotate(-90 180 180)"
        />
        <g className="dial-divisions">
          {age > 1 &&
            Array.from({ length: age }, (_, i) => (
              <line
                key={i}
                x1="180"
                y1="68"
                x2="180"
                y2="35"
                transform={`rotate(${i * share * 360} 180 180)`}
              />
            ))}
        </g>
        <circle
          className="dial-year-outline"
          cx="180"
          cy="180"
          r="145"
          fill="none"
          strokeWidth="1.5"
          pathLength="1"
          strokeDasharray={`${share} 1`}
          transform="rotate(-90 180 180)"
        />
        <motion.circle
          className="dial-point"
          cx={x}
          cy={y}
          r="4"
          style={{ opacity: pointOpacity }}
        />
      </svg>
      <div className="dial-copy" aria-hidden="true">
        <span className="dial-age">{age}</span>
        <span className="dial-label">{age === 1 ? 'year lived' : 'years lived'}</span>
      </div>
    </div>
  )
}
