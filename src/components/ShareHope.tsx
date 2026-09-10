import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowRight } from 'lucide-react'
import type { Reflection } from '../lib/model'
import { makeRemovalKey, manageHope, sendHope, WallRequestError } from '../lib/wall'
import type { Receipt, WallFeed } from '../lib/wall'

export default function ShareHope({
  reflection,
  feed,
  onShared,
  onClose,
  onChange,
}: {
  reflection: Reflection
  feed: WallFeed | null
  onShared: (receipt: Receipt, age: number) => void
  onClose: () => void
  onChange: () => void
}) {
  const [age, setAge] = useState(reflection.age?.toString() ?? '')
  const [consent, setConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [key] = useState(makeRemovalKey)
  const [copied, setCopied] = useState(false)
  const [leftWall, setLeftWall] = useState(false)
  useEffect(() => {
    if (
      !receipt ||
      receipt.state !== 'shared' ||
      !feed ||
      feed.hopes.some((hope) => hope.id === receipt.id)
    )
      return
    let active = true
    void manageHope('receipt', key)
      .then((current) => {
        if (active) setReceipt(current)
      })
      .catch((problem) => {
        if (active && problem instanceof WallRequestError && problem.status === 404)
          setLeftWall(true)
      })
    return () => {
      active = false
    }
  }, [feed, receipt?.id, receipt?.state, key])
  const isShared = receipt?.state === 'shared' && !leftWall

  const submission = useRef<{ text: string; age: number } | null>(null)
  const keyRef = useRef<HTMLInputElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const ageRef = useRef<HTMLInputElement>(null)
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (!age.trim() || !Number.isInteger(Number(age)) || Number(age) < 1 || Number(age) > 120) {
      setError('Add your age, from 1 to 120, so it can sit beside your words.')
      ageRef.current?.focus()
      return
    }
    if (!consent) {
      setError('Choose whether you agree to share. Keeping this private is equally welcome.')
      return
    }
    if (!feed) {
      setError('The Wall is not connected. Your thought can stay private.')
      return
    }
    if (submission.current && submission.current.age !== Number(age)) {
      setError('A request may already have arrived. Check its removal key before changing the age.')
      return
    }
    submission.current = { text: reflection.text, age: Number(age) }
    setBusy(true)
    try {
      const result = await sendHope({
        ...submission.current,
        key,
        consentVersion: feed.consentVersion,
      })
      setReceipt(result)
      onShared(result, Number(age))
      requestAnimationFrame(() => resultRef.current?.focus())
    } catch (reason) {
      if (reason instanceof WallRequestError && [400, 422].includes(reason.status))
        submission.current = null
      setError(
        reason instanceof Error
          ? reason.message
          : 'The Wall is unavailable. Try again when you are ready.',
      )
    } finally {
      setBusy(false)
    }
  }
  const keepPrivate = async () => {
    if (!submission.current) {
      onClose()
      return
    }
    setBusy(true)
    setError('')
    try {
      await manageHope('withdraw', key)
      onChange()
      onClose()
    } catch (reason) {
      if (reason instanceof WallRequestError && reason.status === 404) onClose()
      else
        setError(
          'The request may have arrived. Keep the removal key below and try withdrawing again when the Wall is connected.',
        )
    } finally {
      setBusy(false)
    }
  }
  const withdraw = async () => {
    setBusy(true)
    setError('')
    try {
      const result = await manageHope('withdraw', key)
      setReceipt(result)
      onChange()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Please try again.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="sharing-choice">
      {receipt ? (
        <div ref={resultRef} tabIndex={-1} className="sharing-result">
          <h3>
            {isShared ? 'Your hope has a place on the Wall.' : 'Your hope has left the Wall.'}
          </h3>
          <p>
            {isShared
              ? 'It can now meet someone else’s tomorrow.'
              : 'Your words and age are no longer shared here.'}
          </p>
          <details className="receipt-details" open={isShared}>
            <summary>Your removal key</summary>
            <p>
              Keep this key if you may want to withdraw after leaving. Anyone with it can remove
              this hope. It is not saved in your browser automatically.
            </p>
            <input
              ref={keyRef}
              aria-label="Your removal key"
              value={key}
              readOnly
              onFocus={(event) => event.target.select()}
            />
            <div className="sharing-actions">
              <button
                className="text-button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(key)
                    setCopied(true)
                  } catch {
                    keyRef.current?.focus()
                    keyRef.current?.select()
                  }
                }}
              >
                {copied ? 'Key copied' : 'Copy key'}
              </button>
              {isShared && (
                <button className="text-button" disabled={busy} onClick={withdraw}>
                  Withdraw from the Wall
                </button>
              )}
            </div>
          </details>
        </div>
      ) : (
        <form onSubmit={submit} className="share-form" noValidate aria-busy={busy}>
          <h3>Let your hope meet another.</h3>
          <p>
            Your words and age will appear on this local prototype after automated checks. Anyone
            using it can read them. They stay for up to {feed?.retentionDays ?? 7} days, or until
            you withdraw.
          </p>
          <p className="small-note">
            Leave out names, locations, and identifying details. No accounts. No manual review.
            Automated checks can miss things.
          </p>
          <label className="share-age" htmlFor="share-age">
            Your age
            <input
              ref={ageRef}
              id="share-age"
              type="number"
              inputMode="numeric"
              min="1"
              max="120"
              step="1"
              value={age}
              disabled={busy}
              onChange={(event) => setAge(event.target.value)}
            />
          </label>
          <label className="remember-choice">
            <input
              type="checkbox"
              checked={consent}
              disabled={busy}
              onChange={(event) => setConsent(event.target.checked)}
            />
            <span>I agree to share these words and my age on this Wall.</span>
          </label>
          <div className="sharing-actions">
            <button className="button button-dark" type="submit" disabled={busy || !feed}>
              {busy ? 'Finding a place…' : 'Share this hope'}
              <ArrowRight size={16} />
            </button>
            <button type="button" className="text-button" disabled={busy} onClick={keepPrivate}>
              {submission.current ? 'Withdraw and keep it private' : 'Keep it private'}
            </button>
          </div>
          {submission.current && (
            <details className="receipt-details">
              <summary>Manage a request that may have arrived</summary>
              <p>
                If the connection stopped, use this key to check or withdraw the request in the Wall
                below. Retrying uses the same key and cannot create a second copy.
              </p>
              <input aria-label="Request removal key" value={key} readOnly />
            </details>
          )}
        </form>
      )}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
