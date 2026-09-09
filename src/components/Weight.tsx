import { Fragment, useEffect, useRef, useState } from 'react'
import { ArrowLeftRight, Pause, Play, RotateCcw } from 'lucide-react'
import { animate, useInView, useMotionValue, useMotionValueEvent } from 'motion/react'
import { copy } from '../content/en'
import { YearDial } from './Artwork'
import YearScrubber from './YearScrubber'

const presets = [5, 18, 32, 50, 65, 85]
const duration = 8

export default function Weight({ still }: { still: boolean }) {
  const [referenceAge, setReferenceAge] = useState(5)
  const [borrowedAge, setBorrowedAge] = useState(50)
  const progress = useMotionValue(0)
  const [phase, setPhase] = useState<'start' | 'middle' | 'end'>('start')
  const phaseRef = useRef(phase)
  const [playing, setPlaying] = useState(false)
  const [hasPlayed, setHasPlayed] = useState(false)
  const [cueActive, setCueActive] = useState(false)
  const cueSeen = useRef(false)
  const sectionRef = useRef<HTMLElement>(null)
  const playRef = useRef<HTMLButtonElement>(null)
  const playInView = useInView(playRef, { once: true, amount: 0.85 })

  useMotionValueEvent(progress, 'change', (value) => {
    const nextPhase = value === 0 ? 'start' : value >= 1 ? 'end' : 'middle'
    if (nextPhase !== phaseRef.current) {
      phaseRef.current = nextPhase
      setPhase(nextPhase)
    }
  })

  const dismissCue = () => {
    cueSeen.current = true
    setCueActive(false)
  }

  useEffect(() => {
    if (playInView && !cueSeen.current) {
      cueSeen.current = true
      if (!still) setCueActive(true)
    }
  }, [playInView, still])

  useEffect(() => {
    if (still) {
      progress.stop()
      setPlaying(false)
      setCueActive(false)
    }
  }, [still, progress])

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
      progress.stop()
      setPlaying(false)
      setCueActive(false)
    }
    const onVisibility = () => {
      if (document.hidden) stop()
    }
    document.addEventListener('visibilitychange', onVisibility)
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) stop()
    })
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      observer.disconnect()
    }
  }, [progress])

  const changeAge = (value: number, side: 'reference' | 'borrowed') => {
    dismissCue()
    setPlaying(false)
    progress.stop()
    progress.set(1)
    if (side === 'reference') setReferenceAge(value)
    else setBorrowedAge(value)
  }
  const play = () => {
    dismissCue()
    if (still) {
      progress.set(progress.get() === 1 ? 0 : 1)
      return
    }
    if (playing) {
      progress.stop()
      setPlaying(false)
      return
    }
    if (progress.get() === 1) progress.set(0)
    setHasPlayed(true)
    setPlaying(true)
  }
  const playLabel = still
    ? phase === 'end'
      ? 'Show the beginning'
      : 'Compare the same year'
    : playing
      ? 'Pause'
      : phase === 'middle'
        ? 'Continue the year'
        : hasPlayed
          ? 'Watch again'
          : 'Watch the same year pass'

  return (
    <section
      id="weight"
      className="weight-section dark-section"
      aria-labelledby="weight-title"
      ref={sectionRef}
      onPointerDownCapture={(event) => {
        if (event.target instanceof Element && event.target.closest('button, input, a'))
          dismissCue()
      }}
      onKeyDownCapture={dismissCue}
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
        {[referenceAge, borrowedAge].map((age, index) => (
          <Fragment key={index}>
            {index === 1 && (
              <div className="clock-connection" aria-hidden="true">
                <span>one year</span>
                <ArrowLeftRight size={46} strokeWidth={1} />
                <span>in both lives</span>
              </div>
            )}
            <figure className={`clock ${index === 0 ? 'clock-reference' : 'clock-borrowed'}`}>
              <YearDial age={age} progress={progress} variant={index === 0 ? 'sage' : 'copper'} />
              <figcaption className="clock-details">
                <p className="year-share">
                  {age === 1 ? (
                    'One whole year.'
                  ) : (
                    <>
                      One of <em>{age}</em> years.
                    </>
                  )}
                </p>
                <div className="clock-age-control">
                  <label
                    className="range-label"
                    htmlFor={index === 0 ? 'reference-age' : 'borrowed-age'}
                  >
                    {index === 0 ? 'Starting age' : 'Borrowed age'}
                  </label>
                  <input
                    id={index === 0 ? 'reference-age' : 'borrowed-age'}
                    type="range"
                    min="1"
                    max="100"
                    value={age}
                    onChange={(event) =>
                      changeAge(+event.target.value, index === 0 ? 'reference' : 'borrowed')
                    }
                  />
                </div>
              </figcaption>
            </figure>
          </Fragment>
        ))}
      </div>
      <p className="clock-summary sr-only" aria-live="polite">
        {playing
          ? 'The same twelve months are passing in both lives.'
          : phase === 'middle'
            ? 'The year is paused. Move through it at your own pace.'
            : phase === 'end'
              ? referenceAge === borrowedAge
                ? 'The same year. The same share of life so far.'
                : 'The same year. A different share of the story.'
              : 'The highlighted arc marks one year in each life.'}
      </p>
      <div className="borrow-presets">
        <span>Borrow an age</span>
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
        <YearScrubber
          progress={progress}
          still={still}
          onScrub={() => {
            dismissCue()
            progress.stop()
            setPlaying(false)
          }}
        />
        <p id="play-description" className="sr-only">
          {still
            ? 'Explore the comparison at your own pace.'
            : 'Follow twelve months into both lives.'}
        </p>
        <button
          ref={playRef}
          className={`button clock-play ${cueActive ? 'has-cue' : ''}`}
          onClick={play}
          onFocus={dismissCue}
          onAnimationEnd={() => setCueActive(false)}
          aria-describedby="play-description"
        >
          <span className="play-symbol" aria-hidden="true">
            {still ? <RotateCcw size={21} /> : playing ? <Pause size={21} /> : <Play size={21} />}
          </span>
          {playLabel}
        </button>
      </div>
    </section>
  )
}
