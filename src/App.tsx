import { useState } from 'react'
import { MotionConfig, useReducedMotion } from 'motion/react'
import { ArrowDown, ArrowUpRight, Pause, Play } from 'lucide-react'
import { copy } from './content/en'
import { Mark, TimeSculpture } from './components/Artwork'
import Weight from './components/Weight'
import Memory from './components/Memory'
import Tomorrows from './components/Tomorrows'
import { moments } from './content/moments'
import type { WallHope } from './lib/wall'

export default function App() {
  const reducedMotion = useReducedMotion()
  const [paused, setPaused] = useState(false)
  const [heldMoment, setHeldMoment] = useState<number | null>(null)
  const [borrowedHope, setBorrowedHope] = useState<WallHope | null>(null)
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
              <p className="eyebrow">{copy.hero.eyebrow}</p>
              <h1 id="hero-title">
                {copy.hero.title[0]} <br />
                {copy.hero.title[1]} <br />
                <em>{copy.hero.title[2]}</em>
              </h1>
              <p className="hero-intro">{copy.hero.intro}</p>
              <a className="button button-dark hero-cta" href="#weight">
                Borrow a clock <ArrowUpRight size={18} />
              </a>
              <p className="unhurried">A few moments. At your own pace.</p>
            </div>
            <TimeSculpture still={still} />
            <div className="hero-foot">
              <span>{copy.hero.invitation}</span>
              <a href="#weight">
                SCROLL TO EXPLORE <ArrowDown size={16} />
              </a>
            </div>
          </section>
          <Weight still={still} borrowedHope={borrowedHope} />
          <section className="lens-section" id="lens" aria-labelledby="lens-title">
            <div className="lens-inner">
              <h2 id="lens-title">About this lens</h2>
              <div className="lens-copy">
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
            </div>
          </section>
          <Memory still={still} held={heldMoment} onHold={setHeldMoment} />
          <Tomorrows
            still={still}
            moment={heldMoment === null ? null : moments[heldMoment]}
            onRelease={() => setHeldMoment(null)}
            onBorrow={(hope) => {
              setBorrowedHope({ ...hope })
              requestAnimationFrame(() => {
                document
                  .getElementById('weight')
                  ?.scrollIntoView({ block: 'start', behavior: still ? 'instant' : 'smooth' })
                document.getElementById('weight-title')?.focus({ preventScroll: true })
              })
            }}
          />
          <section className="about-section" id="about" aria-labelledby="about-title">
            <span className="eyebrow">A NOTE ON TIME</span>
            <h2 id="about-title">
              An invitation to notice.
              <br />
              <em>Room for your own experience.</em>
            </h2>
            <div className="about-columns">
              <div id="privacy">
                <h3>Your words, your choice</h3>
                <p>
                  Your reflection stays private unless you choose to share its words and your age.
                  Shared hopes stay on the Wall for up to seven days. A removal key lets you
                  withdraw yours earlier. Imagined examples are labelled separately.
                </p>
                <p>
                  No accounts or tracking added by Timempathy. Shared hopes appear after automated
                  checks, with no manual review at this stage. These checks are limited; flagging a
                  hope removes it from the Wall. The public Wall is hosted by Cloudflare, which
                  processes shared words and connection information to deliver and protect the
                  service. Deleted words may remain in its recovery backups for seven more days.
                  Keeping a thought private sends none of its words there.
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
