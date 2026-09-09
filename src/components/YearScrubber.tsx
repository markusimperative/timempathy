import { useEffect, useRef } from 'react'
import type { MotionValue } from 'motion/react'

// Motion owns continuous progress. Native range semantics remain available to
// keyboard and assistive technology without rerendering the clock scene per frame.
export default function YearScrubber({
  progress,
  still,
  onScrub,
}: {
  progress: MotionValue<number>
  still: boolean
  onScrub: () => void
}) {
  const initialMonths = useRef(Math.round(progress.get() * 12)).current
  const input = useRef<HTMLInputElement>(null)
  const output = useRef<HTMLOutputElement>(null)
  useEffect(() => {
    const sync = (value: number) => {
      const months = Math.round(value * 12)
      if (input.current) {
        input.current.value = String(value * 12)
        input.current.setAttribute('aria-valuetext', `${months} of 12 months`)
      }
      if (output.current) output.current.textContent = `${months} / 12 months`
    }
    sync(progress.get())
    return progress.on('change', sync)
  }, [progress])
  return (
    <div className="year-scrubber">
      <label htmlFor="year-progress">
        {still ? 'Move through the year' : 'Twelve months in eight seconds'}
        <output ref={output}>{initialMonths} / 12 months</output>
      </label>
      <input
        id="year-progress"
        ref={input}
        type="range"
        min="0"
        max="12"
        step="0.1"
        defaultValue={initialMonths}
        aria-valuetext={`${initialMonths} of 12 months`}
        onChange={(event) => {
          onScrub()
          progress.set(Number(event.target.value) / 12)
        }}
      />
    </div>
  )
}
