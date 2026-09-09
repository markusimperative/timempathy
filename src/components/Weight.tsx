import { useEffect, useRef, useState } from 'react'
import { ArrowDown, Pause, Play, RotateCcw } from 'lucide-react'
import { copy } from '../content/en'
import { YearDial } from './Artwork'
import { animate, useMotionValue, useMotionValueEvent } from 'motion/react'
import YearScrubber from './YearScrubber'

const presets = [5, 18, 32, 65, 85]
const duration = 8

export default function Weight({ still }: { still: boolean }) {
  const [referenceAge, setReferenceAge] = useState(32)
  const [borrowedAge, setBorrowedAge] = useState(5)
  const progress = useMotionValue(1)
  const [phase, setPhase] = useState<'start' | 'middle' | 'end'>('end')
  const phaseRef = useRef(phase)
  const [playing, setPlaying] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  useMotionValueEvent(progress, 'change', (value) => {
    const nextPhase = value === 0 ? 'start' : value >= 1 ? 'end' : 'middle'
    if (nextPhase !== phaseRef.current) {
      phaseRef.current = nextPhase
      setPhase(nextPhase)
    }
  })

  useEffect(() => {
    if (still) setPlaying(false)
  }, [still])

  useEffect(() => {
    if (!playing || still) return
    const playback = animate(progress, 1, {
      duration: (1 - progress.get()) * duration,
      ease: 'linear',
      onComplete: () => setPlaying(false),
    })
    return () => playback.stop()
  }, [playing, still, progress])

  useEffect(() => {
    const stop = () => {
      if (document.hidden) {
        progress.stop()
        setPlaying(false)
      }
    }
    document.addEventListener('visibilitychange', stop)
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        progress.stop()
        setPlaying(false)
      }
    })
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => {
      document.removeEventListener('visibilitychange', stop)
      observer.disconnect()
    }
  }, [progress])

  const changeAge = (value: number, side: 'reference' | 'borrowed') => {
    setPlaying(false)
    progress.stop()
    progress.set(1)
    if (side === 'reference') setReferenceAge(value)
    else setBorrowedAge(value)
  }
  const play = () => {
    if (playing) {
      progress.stop()
      setPlaying(false)
      return
    }
    if (progress.get() === 1) progress.set(0)
    setPlaying(true)
  }
  return (
    <section id="weight" className="weight-section" aria-labelledby="weight-title" ref={sectionRef}>
      <div className="weight-heading">
        <h2 id="weight-title">{copy.weight.title}</h2>
        <p>{copy.weight.intro}</p>
      </div>
      <div className="clocks">
        <div className="clock clock-reference">
          <p className="clock-kicker">A clock to begin with</p>
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
          <p className="clock-kicker">The clock you’re borrowing</p>
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
              : phase === 'middle'
                ? 'Continue the year'
                : 'Let a year pass'}
          </button>
        )}
        {still && (
          <button
            className="button button-light"
            onClick={() => progress.set(progress.get() === 1 ? 0 : 1)}
          >
            <RotateCcw size={16} />
            {phase === 'end' ? 'Show the beginning' : 'Show the whole year'}
          </button>
        )}
        <YearScrubber
          progress={progress}
          still={still}
          onScrub={() => {
            progress.stop()
            setPlaying(false)
          }}
        />
      </div>
      <p className="clock-summary" aria-live="polite">
        {playing
          ? 'Both years are passing together.'
          : phase === 'end'
            ? `The same year occupies ${(100 / referenceAge).toFixed(1)}% of one circle and ${(100 / borrowedAge).toFixed(1)}% of the other.`
            : 'The year is paused. Move through it at your own pace.'}
      </p>
      <div className="model-note">
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
