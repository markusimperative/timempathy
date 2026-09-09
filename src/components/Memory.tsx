import { useRef, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { copy } from '../content/en'
import { moments } from '../content/moments'
import { MemoryObject, MemoryScene } from './MemoryArtwork'

export default function Memory({
  still,
  held,
  onHold,
}: {
  still: boolean
  held: number | null
  onHold: (day: number | null) => void
}) {
  const [fold, setFold] = useState(0)
  const stripRef = useRef<HTMLDivElement>(null)
  const remembered = fold >= 0.5
  const chosen = held === null ? null : moments[held]
  const transition = { duration: still ? 0 : 0.75, ease: [0.22, 0.7, 0.2, 1] as const }

  function moveWeek(direction: number) {
    stripRef.current?.scrollBy({ left: direction * 240, behavior: still ? 'instant' : 'smooth' })
  }

  return (
    <section id="memory" className="memory-section" aria-labelledby="memory-title">
      <div className="split-heading">
        <h2 id="memory-title">
          {copy.memory.title[0]}
          <br />
          <em>{copy.memory.title[1]}</em>
        </h2>
        <div>
          <p>{copy.memory.intro}</p>
          <div className="fold-control">
            <div className="fold-endpoints" role="group" aria-label="View the week">
              <button aria-pressed={fold === 0} onClick={() => setFold(0)}>
                As it happens
              </button>
              <button aria-pressed={fold === 1} onClick={() => setFold(1)}>
                Looking back
              </button>
            </div>
            <input
              id="memory-fold"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={fold}
              onChange={(event) => setFold(Number(event.target.value))}
              aria-label="Fold the week into memory"
              aria-valuetext={
                fold === 0
                  ? 'Seven equal days, as they happen'
                  : fold === 1
                    ? 'Looking back, familiar mornings folded together'
                    : 'Partway between the week and its memory'
              }
            />
            <span className="fold-hint">Pull the thread to fold the week.</span>
          </div>
        </div>
      </div>
      <div className="week-topline">
        <p>
          An imagined week <span>Choose a day. Let a small detail stay.</span>
        </p>
        <div className="week-navigation">
          <button onClick={() => moveWeek(-1)} aria-label="Earlier in the week">
            <ArrowLeft size={17} />
          </button>
          <button onClick={() => moveWeek(1)} aria-label="Later in the week">
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
      <motion.div
        layoutScroll
        ref={stripRef}
        className={`memory-strip ${remembered ? 'remembered' : ''}`}
        role="group"
        aria-label="An imagined week. Choose a moment you would remember."
      >
        {moments.map((moment, i) => {
          const selected = held === i
          const folded = i < 3 && !selected
          const amount = folded ? fold : 0
          return (
            <motion.div
              key={moment.day}
              className={`memory-page ${selected ? 'selected' : ''}`}
              style={{ flexGrow: selected ? 1.55 : 1 - amount * 0.52 }}
              layout={!still}
              transition={transition}
            >
              <button
                className={`memory-moment ${selected ? 'held' : ''}`}
                aria-pressed={selected}
                onClick={() => onHold(selected ? null : i)}
              >
                <span className="moment-day">{moment.day}</span>
                <motion.span
                  className={`paper-face ${amount > 0.2 ? 'is-folded' : ''}`}
                  initial={false}
                  animate={{
                    rotateY: (i % 2 ? -1 : 1) * amount * 34,
                    y: selected ? -9 : amount * 5,
                  }}
                  transition={transition}
                >
                  <MemoryScene kind={moment.kind} day={i} active={selected} still={still} />
                  <motion.span
                    className="paper-crease"
                    initial={false}
                    animate={{ opacity: amount * 0.65 }}
                    transition={transition}
                  />
                  <span className="paper-edge" />
                </motion.span>
                <span className="moment-label">{moment.label}</span>
                <span className="moment-pin">
                  <span aria-hidden="true">{selected ? '−' : '+'}</span>
                  {selected ? 'Held here' : 'Hold this'}
                </span>
              </button>
            </motion.div>
          )
        })}
      </motion.div>
      <div className="memory-caption" aria-live="polite">
        <span className="small-note">
          {remembered ? 'A week, remembered' : 'Seven days, as they happen'}
        </span>
        <p>{chosen ? chosen.note : remembered ? copy.memory.remembered : copy.memory.lived}</p>
      </div>
      <div className={`memory-keepsake ${chosen ? 'has-keepsake' : ''}`}>
        <div className="keepsake-drawing" aria-hidden="true">
          {chosen ? (
            <MemoryObject kind={chosen.kind} />
          ) : (
            <svg viewBox="0 0 100 100" fill="none">
              <path
                d="M8 62C32 22 83 27 75 57S18 90 23 56S91 43 93 68"
                stroke="currentColor"
                strokeWidth=".8"
              />
              <circle cx="75" cy="57" r="3" fill="currentColor" />
            </svg>
          )}
        </div>
        <div className="keepsake-copy">
          <p>{chosen ? chosen.label : 'Some things can come with you.'}</p>
          <span>
            {chosen ? chosen.detail : 'Choose any moment above, even one that happened before.'}
          </span>
        </div>
        {chosen ? (
          <a className="text-link carry-link" href="#tomorrow-title">
            Take this into tomorrow <ArrowDown size={17} />
          </a>
        ) : (
          <a className="text-link carry-link" href="#tomorrow-title">
            Continue to tomorrow <ArrowDown size={17} />
          </a>
        )}
      </div>
      <div className="memory-closing">
        <p>{copy.memory.closing}</p>
        <p>
          This paper week is one imagined recollection. What stays distinct can be different for
          each of us. It is an illustration, not a memory test.{' '}
          <a href="#research">Read the research notes</a>.
        </p>
      </div>
    </section>
  )
}
