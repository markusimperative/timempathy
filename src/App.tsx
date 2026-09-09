import { useState } from 'react'
import { MotionConfig, useReducedMotion } from 'motion/react'
import { ArrowUpRight, Pause, Play } from 'lucide-react'
import { copy } from './content/en'
import { Mark, TimeSculpture } from './components/Artwork'
import Weight from './components/Weight'
import Memory from './components/Memory'
import Tomorrows from './components/Tomorrows'
import { moments } from './content/moments'

export default function App() {
  const reducedMotion = useReducedMotion()
  const [paused, setPaused] = useState(false)
  const [heldMoment, setHeldMoment] = useState<number | null>(null)
  const still = !!reducedMotion || paused
  return (
    <MotionConfig reducedMotion={still ? 'always' : 'user'}>
      <div className={`app ${still ? 'motion-paused' : ''}`}>
        <a className="skip-link" href="#main">
          Skip to the experience
        </a>
        <header className="site-header">
          <a className="wordmark" href="#top" aria-label="Timempathy home">
            <Mark />
            <span>
              timempathy<span className="wordmark-dot">.</span>
            </span>
          </a>
          <nav aria-label="Main navigation">
            <a href="#weight">The experience</a>
            <a href="#wall">Wall of tomorrows</a>
            <a href="#about">
              A note on time <ArrowUpRight size={13} />
            </a>
          </nav>
          <button
            className="motion-toggle"
            aria-label={
              reducedMotion
                ? 'Reduced motion is enabled by your device'
                : paused
                  ? 'Resume motion'
                  : 'Pause motion'
            }
            aria-pressed={still}
            disabled={!!reducedMotion}
            onClick={() => setPaused(!paused)}
          >
            {still ? <Play size={13} /> : <Pause size={13} />}
            <span>{reducedMotion ? 'Still mode' : paused ? 'Motion paused' : 'Pause motion'}</span>
          </button>
        </header>
        <main id="main">
          <section className="hero" id="top" aria-labelledby="hero-title">
            <div className="hero-copy">
              <h1 id="hero-title">
                <span>{copy.hero.title[0]}</span>
                <span>
                  {copy.hero.title[1]} <em>{copy.hero.title[2]}</em>
                </span>
              </h1>
              <p className="hero-intro">{copy.hero.intro}</p>
              <a className="button button-dark hero-cta" href="#weight">
                Borrow a clock <ArrowUpRight size={18} />
              </a>
            </div>
            <TimeSculpture still={still} />
          </section>
          <Weight still={still} />
          <Memory still={still} held={heldMoment} onHold={setHeldMoment} />
          <Tomorrows
            still={still}
            moment={heldMoment === null ? null : moments[heldMoment]}
            onRelease={() => setHeldMoment(null)}
          />
          <section className="about-section" id="about" aria-labelledby="about-title">
            <h2 id="about-title">
              An invitation to notice.
              <br />
              <em>Room for your own experience.</em>
            </h2>
            <div className="about-columns">
              <div>
                <h3>A lens, not a law</h3>
                <p>
                  The circles use a simple proportion: one year divided by an age. Each circle
                  stands for life already lived, never a lifespan or time remaining. Both animated
                  years take eight seconds.
                </p>
                <p>
                  This arithmetic is a visual metaphor. It cannot tell us how a person experiences
                  time. There is no single clock for an age group.
                </p>
              </div>
              <div>
                <h3>Your words stay here</h3>
                <p>
                  This is a local prototype. The wall contains authored examples. Your reflection
                  stays in this visit unless you choose to keep it in this browser. You can remove
                  it at any time.
                </p>
                <p>
                  No accounts, trackers, analytics, or public submissions. A public wall would need
                  human moderation before any contribution appeared.
                </p>
              </div>
              <div id="research">
                <h3>What informs this</h3>
                <p>
                  Research distinguishes time as it passes from time remembered. Age, emotion,
                  attention, and the way events are organized in memory can relate to these
                  experiences in different ways.
                </p>
                <ul className="research-links">
                  <li>
                    <a
                      href="https://pmc.ncbi.nlm.nih.gov/articles/PMC4690970/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Wittmann et al., 2015 <ArrowUpRight size={14} />
                      <span>Age, time perspective, and emotion · opens a new tab</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://pubmed.ncbi.nlm.nih.gov/19397382/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Swallow, Zacks & Abrams, 2009 <ArrowUpRight size={14} />
                      <span>Event boundaries and memory · opens a new tab</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </main>
        <footer className="site-footer">
          <a className="wordmark" href="#top">
            <Mark />
            <span>timempathy.</span>
          </a>
          <p>We share the same clock, but not the same experience of time.</p>
          <a href="#top">
            Back to the beginning <ArrowUpRight size={15} />
          </a>
        </footer>
      </div>
    </MotionConfig>
  )
}
