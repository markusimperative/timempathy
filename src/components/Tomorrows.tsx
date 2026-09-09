import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowDown, ArrowRight, Check, Shuffle, Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
import HopeNote from './HopeNote'
import { echoes } from '../content/echoes'
import { copy, hopes } from '../content/en'
import type { Hope } from '../content/en'
import { forgetReflection, readReflection, reflectionSchema, saveReflection } from '../lib/model'
import type { Reflection } from '../lib/model'
import type { MemoryMoment } from '../content/moments'
import { MemoryObject } from './MemoryArtwork'

const filters = [
  { id: 'all', label: 'All tomorrows' },
  { id: 'company', label: 'Being together' },
  { id: 'quiet', label: 'A little quiet' },
  { id: 'small', label: 'Small pleasures' },
] as const

function initialReflection() {
  try {
    return readReflection(window.localStorage)
  } catch {
    return { value: null, unavailable: true }
  }
}

export default function Tomorrows({
  still,
  moment,
  onRelease,
}: {
  still: boolean
  moment: MemoryMoment | null
  onRelease: () => void
}) {
  const [initial] = useState(initialReflection)
  const [saved, setSaved] = useState<Reflection | null>(initial.value)
  const [persistent, setPersistent] = useState(!!initial.value)
  const [text, setText] = useState('')
  const [age, setAge] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [ageError, setAgeError] = useState('')
  const [storageNote, setStorageNote] = useState(
    initial.unavailable
      ? 'Browser storage could not be read. You can still keep a thought for this visit.'
      : '',
  )
  const [filter, setFilter] = useState<Hope['thread'] | 'all'>('all')
  const [echo, setEcho] = useState(-1)
  const [echoOrigin, setEchoOrigin] = useState<string | null>(null)
  const pairRef = useRef<HTMLDivElement>(null)
  const echoButtonRef = useRef<HTMLButtonElement>(null)
  const focusPair = useRef(false)
  useEffect(() => {
    if (!focusPair.current || echo < 0) return
    focusPair.current = false
    pairRef.current?.focus({ preventScroll: true })
    pairRef.current?.scrollIntoView({ block: 'nearest', behavior: still ? 'instant' : 'smooth' })
  }, [echo, echoOrigin, still])
  const [status, setStatus] = useState('')
  const successRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)
  const ageRef = useRef<HTMLInputElement>(null)
  const userSaved = useRef(false)

  useEffect(() => {
    if (saved && userSaved.current) successRef.current?.focus()
  }, [saved])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const result = reflectionSchema.safeParse({ text, age: age.trim() === '' ? null : Number(age) })
    setError('')
    setAgeError('')
    setStorageNote('')
    if (!result.success) {
      const invalidText = result.error.issues.find((issue) => issue.path[0] === 'text')
      const invalidAge = result.error.issues.find((issue) => issue.path[0] === 'age')
      if (invalidText) setError(invalidText.message)
      if (invalidAge) setAgeError('Use a whole number from 1 to 120, or leave your age blank.')
      if (invalidText) textRef.current?.focus()
      else ageRef.current?.focus()
      return
    }
    let stored = false
    if (remember) {
      try {
        stored = saveReflection(window.localStorage, result.data)
      } catch {
        /* Browser policy can block access itself. */
      }
      if (!stored)
        setStorageNote(
          'Your browser could not save this thought. It is here for this visit only; you can copy it before leaving.',
        )
    }
    userSaved.current = true
    setPersistent(stored)
    setSaved(result.data)
    setText('')
    setAge('')
    setStatus('Your private thought has been added below the imagined wall’s introduction.')
  }

  const forget = () => {
    let removed = !persistent
    if (persistent) {
      try {
        removed = forgetReflection(window.localStorage)
      } catch {
        /* Keep visible until deletion is confirmed. */
      }
    }
    if (!removed) {
      setStorageNote(
        'This browser could not remove the saved thought. Please clear this site’s storage in your browser settings.',
      )
      return
    }
    setSaved(null)
    setPersistent(false)
    setRemember(false)
    setStorageNote('')
    setStatus('Your thought has been removed.')
    requestAnimationFrame(() => textRef.current?.focus())
  }

  const visibleHopes = hopes.filter((hope) => filter === 'all' || hope.thread === filter)
  const activeEcho = echo >= 0 ? echoes[echo % echoes.length] : null
  const activePair = activeEcho?.ids ?? null
  const pairedHopes = activePair
    ? activePair.map((id) => hopes.find((hope) => hope.id === id)!)
    : []
  if (echoOrigin && pairedHopes[1]?.id === echoOrigin) pairedHopes.reverse()
  const remainingHopes = visibleHopes.filter((hope) => !activePair?.some((id) => id === hope.id))
  const findEcho = () => {
    setFilter('all')
    setEchoOrigin(null)
    setEcho((previous) => (previous + 1) % echoes.length)
  }
  const openWish = (id: string) => {
    const pair = echoes.findIndex((item) => item.ids.some((hopeId) => hopeId === id))
    if (pair < 0) return
    focusPair.current = true
    setFilter('all')
    setEchoOrigin(id)
    setEcho(pair)
  }
  const leavePair = () => {
    setEcho(-1)
    requestAnimationFrame(() => {
      const target = echoOrigin
        ? document.getElementById(`hope-open-${echoOrigin}`)
        : echoButtonRef.current
      target?.focus()
    })
  }

  return (
    <>
      <section id="tomorrow" className="tomorrow-section" aria-labelledby="tomorrow-title">
        <span className="eyebrow">03 / REMEMBERING TOMORROW</span>
        <div className="tomorrow-flower" aria-hidden="true">
          ✳
        </div>
        <h2 id="tomorrow-title" tabIndex={-1}>
          {copy.tomorrow.title[0]}
          <br />
          <em>{copy.tomorrow.title[1]}</em>
        </h2>
        <p className="tomorrow-intro">{copy.tomorrow.intro}</p>
        {moment && (
          <motion.div
            key={moment.day}
            className="tomorrow-companion"
            initial={still ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: still ? 0 : 0.65 }}
          >
            <div className="companion-object">
              <MemoryObject kind={moment.kind} />
            </div>
            <div>
              <span className="eyebrow">FROM YOUR WEEK</span>
              <p>{moment.label}</p>
              <span>A small thing you chose to hold.</span>
              <button
                onClick={() => {
                  onRelease()
                  ;(textRef.current ?? successRef.current)?.focus({ preventScroll: true })
                }}
                className="release-moment"
              >
                Leave this moment here
              </button>
            </div>
          </motion.div>
        )}
        {saved ? (
          <div className="saved-state" ref={successRef} tabIndex={-1}>
            <span className="saved-icon">
              <Check size={20} />
            </span>
            <h3>A little thought, held here.</h3>
            <blockquote>{saved.text}</blockquote>
            <p>
              {persistent
                ? 'Saved only in this browser, until you remove it. Someone using this browser could read it.'
                : 'Kept only for this visit. It will disappear when you reload or leave.'}{' '}
              Nothing was sent or published.
            </p>
            <div className="saved-actions">
              <a className="text-link" href="#your-thought">
                Find it on your wall <ArrowDown size={16} />
              </a>
              <button className="text-button" onClick={forget}>
                <Trash2 size={15} />
                Remove my thought
              </button>
            </div>
          </div>
        ) : (
          <form className="reflection-form" onSubmit={submit} noValidate>
            <label htmlFor="reflection">I’d like to remember…</label>
            <textarea
              id="reflection"
              ref={textRef}
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={240}
              placeholder="The way we laughed over nothing."
              aria-invalid={!!error}
              aria-describedby={`reflection-help${error ? ' reflection-error' : ''}`}
            />
            <div className="form-meta">
              <span id="reflection-help">A private thought. Nothing is published.</span>
              <span>{text.length} / 240</span>
            </div>
            {error && (
              <p className="field-error" id="reflection-error" role="alert">
                {error}
              </p>
            )}
            <div className="age-input-row">
              <label htmlFor="reflection-age">
                Your age <span>(optional)</span>
              </label>
              <input
                id="reflection-age"
                ref={ageRef}
                type="number"
                inputMode="numeric"
                min="1"
                max="120"
                step="1"
                value={age}
                placeholder="—"
                onChange={(e) => setAge(e.target.value)}
                aria-invalid={!!ageError}
                aria-describedby={ageError ? 'age-error' : undefined}
              />
            </div>
            {ageError && (
              <p className="field-error" id="age-error" role="alert">
                {ageError}
              </p>
            )}
            <label className="remember-choice">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>
                Keep this thought in this browser.
                <small>
                  Optional. It stays until you remove it. Anyone using this browser could read it.
                </small>
              </span>
            </label>
            <button className="button button-dark" type="submit">
              Keep this thought <ArrowRight size={17} />
            </button>
          </form>
        )}
        {storageNote && (
          <p className="storage-note" role="status">
            {storageNote}
          </p>
        )}
        <p className="sr-only" role="status">
          {status}
        </p>
        <a className="tomorrow-skip" href="#wall">
          Or just spend a moment with other tomorrows <ArrowDown size={16} />
        </a>
      </section>
      <section id="wall" className="wall-section" aria-labelledby="wall-title">
        <div className="section-head">
          <span className="eyebrow">04 / A SHARED HORIZON</span>
          <span className="section-aside">DIFFERENT AGES. FAMILIAR HOPES.</span>
        </div>
        <div className="wall-heading">
          <h2 id="wall-title">
            The Wall of <em>Tomorrows.</em>
          </h2>
          <p>
            A place for the things we hope will stay with us.
            <br />
            Some may sound a little like your own.
          </p>
        </div>
        <p className="sample-notice">
          <span className="color-dot" />
          An imagined wall — these are written examples, not real submissions.
        </p>
        {saved && (
          <div id="your-thought" className="private-thought">
            <span className="eyebrow">
              YOUR PRIVATE THOUGHT{saved.age !== null ? ` / AGE ${saved.age}` : ''}
            </span>
            <blockquote>{saved.text}</blockquote>
            <span className="small-note">
              Only in your browser{persistent ? ' · saved on this device' : ' · for this visit'}
            </span>
          </div>
        )}
        <div className="wall-controls">
          <div className="wall-filters" role="group" aria-label="Explore tomorrows">
            {filters.map((item) => (
              <button
                key={item.id}
                aria-pressed={filter === item.id}
                onClick={() => {
                  setFilter(item.id)
                  setEcho(-1)
                  setEchoOrigin(null)
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button ref={echoButtonRef} className="echo-button" onClick={findEcho}>
            <Shuffle size={16} />
            {echo < 0 ? 'Find an echo' : 'Another echo'}
          </button>
        </div>
        <div className="echo-caption" role="status">
          {activePair ? (
            <>
              <span aria-hidden="true">Two tomorrows, side by side.</span>
              <span className="sr-only">
                An echo across ages {pairedHopes[0].age} and {pairedHopes[1].age}. The underlined
                details connect these authored wishes.
              </span>
            </>
          ) : (
            'Open a wish. Let another tomorrow sit beside it.'
          )}
        </div>
        <div className={`hope-wall ${activePair ? 'has-echo' : ''}`}>
          {activeEcho && (
            <div
              key={echo}
              className="echo-pair"
              ref={pairRef}
              role="group"
              aria-label={`Two imagined wishes, ages ${pairedHopes[0].age} and ${pairedHopes[1].age}`}
              tabIndex={-1}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault()
                  leavePair()
                }
              }}
            >
              {pairedHopes.map((hope) => (
                <HopeNote
                  key={hope.id}
                  hope={hope}
                  still={still}
                  fragment={activeEcho.fragments[activeEcho.ids.findIndex((id) => id === hope.id)]}
                />
              ))}
            </div>
          )}
          {remainingHopes.map((hope) => (
            <HopeNote key={hope.id} hope={hope} still={still} onOpen={() => openWish(hope.id)} />
          ))}
        </div>
        <p className="wall-ending">
          A different amount of life behind us.
          <br />
          <em>Sometimes, the same wish ahead.</em>
        </p>
      </section>
    </>
  )
}
