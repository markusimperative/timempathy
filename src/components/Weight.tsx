import { useEffect, useRef, useState } from 'react'
import { ArrowDown, Pause, Play, RotateCcw } from 'lucide-react'
import { copy } from '../content/en'
import { YearDial } from './Artwork'

const presets = [5, 18, 32, 65, 85]
const duration = 8000

export default function Weight({ still }: { still: boolean }) {
  const [referenceAge, setReferenceAge] = useState(32)
  const [borrowedAge, setBorrowedAge] = useState(5)
  const [progress, setProgress] = useState(1)
  const [playing, setPlaying] = useState(false)
  const progressRef = useRef(progress)
  const sectionRef = useRef<HTMLElement>(null)
  progressRef.current = progress

  useEffect(() => {
    if (still) setPlaying(false)
  }, [still])

  useEffect(() => {
    if (!playing || still) return
    let frame = 0
    let previous: number | null = null
    const tick = (now: number) => {
      if (previous === null) previous = now
      const next = Math.min(1, progressRef.current + (now - previous) / duration)
      previous = now
      progressRef.current = next
      setProgress(next)
      if (next < 1) frame = requestAnimationFrame(tick)
      else setPlaying(false)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, still])

  useEffect(() => {
    const stop = () => {
      if (document.hidden) setPlaying(false)
    }
    document.addEventListener('visibilitychange', stop)
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) setPlaying(false)
    })
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => {
      document.removeEventListener('visibilitychange', stop)
      observer.disconnect()
    }
  }, [])

  const changeAge = (value: number, side: 'reference' | 'borrowed') => {
    setPlaying(false)
    setProgress(1)
    if (side === 'reference') setReferenceAge(value)
    else setBorrowedAge(value)
  }
  const play = () => {
    if (playing) {
      setPlaying(false)
      return
    }
    if (progress === 1) {
      progressRef.current = 0
      setProgress(0)
    }
    setPlaying(true)
  }
  return (
    <section
      id="weight"
      className="weight-section dark-section"
      aria-labelledby="weight-title"
      ref={sectionRef}
    >
      <div className="section-head">
        <span className="eyebrow">01 / THE WEIGHT OF A YEAR</span>
        <span className="section-aside">SAME DURATION. DIFFERENT PROPORTIONS.</span>
      </div>
      <div className="weight-heading">
        <h2 id="weight-title">{copy.weight.title}</h2>
        <p>{copy.weight.intro}</p>
      </div>
      <div className="clocks">
        <div className="clock clock-reference">
          <p className="clock-kicker">
            <span className="color-dot sage-dot" />A clock to begin with
          </p>
          <YearDial age={referenceAge} progress={progress} variant="sage" />
          <p className="fraction">
            One year. <em>1/{referenceAge}</em> of a life so far.
          </p>
          <label className="range-label" htmlFor="reference-age">
            Starting age <output>{referenceAge}</output>
          </label>
          <input
            id="reference-age"
            aria-label="Starting age"
            type="range"
            min="1"
            max="100"
            value={referenceAge}
            onChange={(e) => changeAge(+e.target.value, 'reference')}
          />
        </div>
        <div className="clock-connection" aria-hidden="true">
          <span>one year</span>
          <i />
          <span>in both lives</span>
        </div>
        <div className="clock clock-borrowed">
          <p className="clock-kicker">
            <span className="color-dot copper-dot" />
            The clock you’re borrowing
          </p>
          <YearDial age={borrowedAge} progress={progress} variant="copper" />
          <p className="fraction">
            One year. <em>1/{borrowedAge}</em> of a life so far.
          </p>
          <label className="range-label" htmlFor="borrowed-age">
            Borrowed age <output>{borrowedAge}</output>
          </label>
          <input
            id="borrowed-age"
            aria-label="Borrowed age"
            type="range"
            min="1"
            max="100"
            value={borrowedAge}
            onChange={(e) => changeAge(+e.target.value, 'borrowed')}
          />
        </div>
      </div>
      <div className="borrow-presets">
        <span>Try another age</span>
        <div role="group" aria-label="Borrow an age">
          {presets.map((age) => (
            <button
              key={age}
              aria-pressed={borrowedAge === age}
              onClick={() => changeAge(age, 'borrowed')}
            >
              {age}
            </button>
          ))}
        </div>
      </div>
      <div className="passage-controls">
        {!still && (
          <button className="button button-light" onClick={play}>
            {playing ? <Pause size={16} /> : <Play size={16} />}
            {playing
              ? 'Pause the year'
              : progress > 0 && progress < 1
                ? 'Continue the year'
                : 'Let a year pass'}
          </button>
        )}
        {still && (
          <button
            className="button button-light"
            onClick={() => setProgress(progress === 1 ? 0 : 1)}
          >
            <RotateCcw size={16} />
            {progress === 1 ? 'Show the beginning' : 'Show the whole year'}
          </button>
        )}
        <div className="year-scrubber">
          <label htmlFor="year-progress">
            {still ? 'Explore the year at your pace' : 'One imagined year, in eight seconds'}
            <output>{Math.round(progress * 12)} / 12 months</output>
          </label>
          <input
            id="year-progress"
            type="range"
            min="0"
            max="12"
            step="0.1"
            value={progress * 12}
            aria-valuetext={`${Math.round(progress * 12)} of 12 months`}
            onChange={(e) => {
              setPlaying(false)
              setProgress(+e.target.value / 12)
            }}
          />
        </div>
      </div>
      <p className="clock-summary" aria-live="polite">
        {playing
          ? 'Both years are passing together.'
          : progress === 1
            ? `The same year occupies ${(100 / referenceAge).toFixed(1)}% of one circle and ${(100 / borrowedAge).toFixed(1)}% of the other.`
            : 'The year is paused. Move through it at your own pace.'}
      </p>
      <div className="model-note">
        <span className="note-mark">↳</span>
        <p>
          {copy.weight.caveat} <a href="#about">About this lens</a>
        </p>
        <a
          className="next-chapter"
          href="#memory"
          aria-label="Continue to A day passes. What stays?"
        >
          <ArrowDown size={23} />
        </a>
      </div>
    </section>
  )
}
