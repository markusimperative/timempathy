import { arcPoint, yearShare } from '../lib/model'

export function Mark() {
  return <svg viewBox="0 0 40 40" aria-hidden="true"><ellipse cx="16" cy="20" rx="10" ry="15" transform="rotate(-25 16 20)" /><ellipse cx="24" cy="20" rx="10" ry="15" transform="rotate(25 24 20)" /></svg>
}

function contour(index: number) {
  const radius = 54 + index * 4.3
  return Array.from({ length: 181 }, (_, step) => {
    const t = step / 180 * Math.PI * 2
    const bend = Math.sin(t * 3 + index * .043) * (6 + index * .2) + Math.cos(t * 2) * 10
    const x = 295 + Math.cos(t) * (radius + bend) * .87 + Math.sin(index * .05) * 10
    const y = 280 + Math.sin(t) * (radius + bend) * 1.05
    return `${step ? 'L' : 'M'}${x.toFixed(2)},${y.toFixed(2)}`
  }).join(' ') + 'Z'
}

export function TimeSculpture({ still }: { still: boolean }) {
  return <div className={`time-sculpture ${still ? 'is-still' : ''}`} aria-hidden="true">
    <svg viewBox="0 0 600 570" fill="none">
      <defs>
        <radialGradient id="paper-glow"><stop stopColor="#d6b98a" stopOpacity=".2" /><stop offset="1" stopColor="#e7d8b9" stopOpacity="0" /></radialGradient>
      </defs>
      <circle cx="300" cy="295" r="280" fill="url(#paper-glow)" />
      <g className="sculpture-lines">{Array.from({ length: 43 }, (_, i) => <path key={i} d={contour(i)} stroke={i > 32 ? '#797e68' : '#526450'} strokeWidth={i % 5 === 0 ? 1 : .65} opacity={.38 + (i % 4) * .09} />)}</g>
      <g className="sculpture-inner" stroke="#ab5737" strokeWidth=".8" opacity=".8">{Array.from({ length: 17 }, (_, i) => <ellipse key={i} cx={260 - i * 1.25} cy={305 + i * 1.7} rx={73 + i * 2.9} ry={80 + i * 3.2} transform={`rotate(${-28 - i * 1.4} 260 305)`} />)}</g>
      <path d="M413 139L474 84H547" stroke="#9c9c89" strokeWidth=".7" />
      <circle cx="413" cy="139" r="7" fill="#b66441" stroke="#f5f2e9" strokeWidth="3" />
      <text x="481" y="72" className="svg-note">one shared moment</text>
      <path d="M91 426H135L176 387" stroke="#9c9c89" strokeWidth=".7" />
      <text x="67" y="448" className="svg-note">many ways to feel it</text>
    </svg>
  </div>
}

export function YearDial({ age, progress, variant }: { age: number; progress: number; variant: 'copper' | 'sage' }) {
  const share = yearShare(age)
  const point = arcPoint(age, progress)
  return <svg className={`year-dial ${variant}`} viewBox="0 0 360 360" role="img" aria-label={`At age ${age}, one year is one ${age === 1 ? 'whole' : `part in ${age}`} of life so far, ${(share * 100).toFixed(1)} percent. The bright arc shows this proportion.`}>
    <g className="dial-threads" fill="none">{Array.from({ length: 11 }, (_, i) => <circle key={i} cx="180" cy="180" r={87 + i * 3} />)}</g>
    <g className="dial-ticks">{Array.from({ length: age }, (_, i) => <line key={i} x1="180" y1="29" x2="180" y2={i === 0 ? 42 : 35} transform={`rotate(${i / age * 360} 180 180)`} />)}</g>
    <circle className="dial-track" cx="180" cy="180" r="132" fill="none" strokeWidth="8" />
    <circle className="dial-potential" cx="180" cy="180" r="132" fill="none" strokeWidth="8" pathLength="1" strokeDasharray={`${share} 1`} transform="rotate(-90 180 180)" />
    <circle className="dial-year" cx="180" cy="180" r="132" fill="none" strokeWidth="8" pathLength="1" strokeDasharray={`${share * progress} 1`} transform="rotate(-90 180 180)" />
    <circle className="dial-point" cx={point.x} cy={point.y} r="6" />
    <text className="dial-age" x="180" y="185" textAnchor="middle">{age}</text>
    <text className="dial-label" x="180" y="212" textAnchor="middle">YEARS LIVED</text>
  </svg>
}

export function MomentArt({ kind }: { kind: 'cup' | 'rain' | 'table' | 'moon' | 'flower' }) {
  return <svg viewBox="0 0 130 150" fill="none" aria-hidden="true" className={`moment-art art-${kind}`}>
    {kind === 'cup' && <><ellipse cx="59" cy="114" rx="38" ry="6" /><path d="M29 63H85V89Q83 110 59 111Q33 110 29 89Z" /><path d="M85 67C117 63 113 97 84 95M44 48C32 34 57 29 44 14M63 48C50 34 76 29 63 14" /><ellipse cx="57" cy="63" rx="28" ry="5" /></>}
    {kind === 'rain' && <><path d="M21 15H109V132H21ZM65 15V132M21 77H109" /><path d="M38 33L32 47M88 25L80 41M52 55L47 65M94 93L88 107M48 94L37 117M70 102L65 114" /><path d="M14 134H116" /></>}
    {kind === 'table' && <><ellipse cx="65" cy="75" rx="48" ry="16" /><path d="M28 83L23 135M101 83L107 135M15 57V98H31M115 57V98H100" /><ellipse cx="42" cy="73" rx="13" ry="5" /><ellipse cx="87" cy="73" rx="13" ry="5" /><path d="M60 63V42H69V63M65 42V30M62 26Q55 15 65 10Q74 19 68 26" /></>}
    {kind === 'moon' && <><path d="M86 20C25 12 17 89 66 101C102 111 124 68 108 46C108 87 55 84 57 46C57 29 72 19 86 20Z" /><path d="M19 128Q65 113 111 128M14 137H118M22 22V33M17 28H28" /></>}
    {kind === 'flower' && <><path d="M65 134V64M65 116Q36 123 28 96Q57 91 65 116M65 98Q69 71 100 80Q96 105 65 98" /><path d="M65 60C21 89 20 29 51 39C29 8 90 6 79 37C113 10 119 74 84 60C102 98 44 109 65 60Z" /><circle cx="69" cy="51" r="10" /></>}
  </svg>
}
