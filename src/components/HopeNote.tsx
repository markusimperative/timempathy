import { motion } from 'motion/react'
import { hopes } from '../content/en'
import type { Hope } from '../content/en'

export default function HopeNote({
  hope,
  fragment,
  still,
  onOpen,
}: {
  hope: Hope
  fragment?: string
  still: boolean
  onOpen?: () => void
}) {
  const start = fragment ? hope.text.indexOf(fragment) : -1
  const words =
    fragment && start >= 0 ? (
      <>
        {hope.text.slice(0, start)}
        <span className="echo-fragment" style={still ? { animation: 'none' } : undefined}>
          {fragment}
        </span>
        {hope.text.slice(start + fragment.length)}
      </>
    ) : (
      hope.text
    )
  return (
    <motion.figure
      layout={still ? false : 'position'}
      transition={{ duration: still ? 0 : 0.45 }}
      className={`hope-note note-${hopes.indexOf(hope) % 4} ${fragment ? 'is-echo' : ''}`}
    >
      <span className="note-hole" aria-hidden="true" />
      <blockquote>
        {onOpen ? (
          <button
            id={`hope-open-${hope.id}`}
            className="hope-open"
            onClick={onOpen}
            aria-describedby={`hope-age-${hope.id}`}
          >
            “{words}”
          </button>
        ) : (
          <>“{words}”</>
        )}
      </blockquote>
      <figcaption id={`hope-age-${hope.id}`}>
        <span className="hope-age">{hope.age}</span>
        <span>years old</span>
      </figcaption>
    </motion.figure>
  )
}
