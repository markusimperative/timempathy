import { useState } from 'react'
import { motion } from 'motion/react'
import { copy } from '../content/en'
import { MomentArt } from './Artwork'

const moments = [
  {
    day: 'MON',
    kind: 'cup',
    label: 'A familiar cup',
    note: 'The cup you reach for without thinking.',
  },
  { day: 'TUE', kind: 'cup', label: 'The same cup', note: 'That little warmth in your hands.' },
  {
    day: 'WED',
    kind: 'cup',
    label: 'Morning, again',
    note: 'A familiar morning can stay with you, too.',
  },
  {
    day: 'THU',
    kind: 'rain',
    label: 'A sudden rain',
    note: 'The sound of the rain through an open window.',
  },
  {
    day: 'FRI',
    kind: 'table',
    label: 'A long conversation',
    note: 'Something someone said across the table.',
  },
  { day: 'SAT', kind: 'moon', label: 'An evening walk', note: 'The sky on the way back.' },
  {
    day: 'SUN',
    kind: 'flower',
    label: 'Something growing',
    note: 'A new leaf on a plant you’ve had for years.',
  },
] as const

export default function Memory({ still }: { still: boolean }) {
  const [remembered, setRemembered] = useState(false)
  const [held, setHeld] = useState<number | null>(null)
  return (
    <section id="memory" className="memory-section" aria-labelledby="memory-title">
      <div className="section-head">
        <span className="eyebrow">02 / THE TEXTURE OF MEMORY</span>
        <span className="section-aside">TIME LEAVES DIFFERENT TRACES.</span>
      </div>
      <div className="split-heading">
        <h2 id="memory-title">
          {copy.memory.title[0]}
          <br />
          <em>{copy.memory.title[1]}</em>
        </h2>
        <div>
          <p>{copy.memory.intro}</p>
          <div className="segmented" role="group" aria-label="View the week">
            <button aria-pressed={!remembered} onClick={() => setRemembered(false)}>
              As it happens
            </button>
            <button aria-pressed={remembered} onClick={() => setRemembered(true)}>
              Looking back
            </button>
          </div>
        </div>
      </div>
      <p className="memory-instruction">Swipe through the week. Choose a moment to hold.</p>
      <div
        className={`memory-strip ${remembered ? 'remembered' : ''}`}
        aria-label="An imagined week. Choose a moment you would remember."
      >
        {moments.map((moment, i) => (
          <motion.button
            key={moment.day}
            className={`memory-moment ${held === i ? 'held' : ''}`}
            aria-pressed={held === i}
            aria-label={`${moment.day}: ${moment.label}. ${held === i ? 'Held in memory.' : 'Choose to hold this moment.'}`}
            animate={{ flexGrow: remembered && i < 3 && held !== i ? 0.42 : held === i ? 1.65 : 1 }}
            transition={{ duration: still ? 0 : 0.7, ease: [0.2, 0.7, 0.2, 1] }}
            onClick={() => setHeld(held === i ? null : i)}
          >
            <span className="moment-day">{moment.day}</span>
            <MomentArt kind={moment.kind} />
            <span className="moment-label">{moment.label}</span>
            <span className="moment-pin">{held === i ? 'Held here' : '+'}</span>
          </motion.button>
        ))}
      </div>
      <div className="memory-caption">
        <span className="eyebrow">AN IMAGINED WEEK</span>
        <p aria-live="polite">
          {held !== null
            ? moments[held].note
            : remembered
              ? copy.memory.remembered
              : copy.memory.lived}
        </p>
        <span className="small-note">Choose a moment to hold.</span>
      </div>
      <div className="memory-closing">
        <span className="tiny-flower" aria-hidden="true">
          ✳
        </span>
        <p>{copy.memory.closing}</p>
        <p>
          Memory is more than a recording. What stands out may shape the way a stretch of time is
          remembered. This little scene is an illustration, not a memory test.{' '}
          <a href="#research">Read the research notes</a>.
        </p>
      </div>
    </section>
  )
}
