import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Flag } from 'lucide-react'
import { encounterCandidates, manageHope, wallRequest } from '../lib/wall'
import type { WallFeed, WallHope } from '../lib/wall'
import type { Reflection } from '../lib/model'

export default function CommunityWall({
  feed,
  loading,
  reflection,
  ownId,
  refresh,
  onBorrow,
  still,
}: {
  feed: WallFeed | null
  loading: boolean
  reflection: Reflection | null
  ownId?: string
  refresh: () => Promise<void>
  onBorrow: (hope: WallHope) => void
  still: boolean
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [reportId, setReportId] = useState<string | null>(null)
  const [reason, setReason] = useState('identifying')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [key, setKey] = useState('')
  const [receiptStatus, setReceiptStatus] = useState('')
  const encounterRef = useRef<HTMLDivElement>(null)
  const browseRef = useRef<HTMLButtonElement>(null)
  const wallFocusRef = useRef<HTMLDivElement>(null)
  const returnFocus = () =>
    (browseRef.current ?? wallFocusRef.current)?.focus({ preventScroll: true })
  const selected = feed?.hopes.find((hope) => hope.id === selectedId)
  const candidates = encounterCandidates(
    feed?.hopes ?? [],
    reflection?.age ?? null,
    ownId,
    reflection?.text,
  )
  const meet = (id?: string) => {
    setError('')
    setReportId(null)
    const choices = candidates.filter((hope) => hope.id !== selectedId)
    const next =
      id ??
      (choices.length ? choices[Math.floor(Math.random() * choices.length)].id : candidates[0]?.id)
    if (!next) return
    setSelectedId(next)
    requestAnimationFrame(() => {
      encounterRef.current?.focus({ preventScroll: true })
      encounterRef.current?.scrollIntoView({
        block: 'nearest',
        behavior: still ? 'instant' : 'smooth',
      })
    })
  }
  useEffect(() => {
    if (selectedId && !selected) {
      setSelectedId(null)
      setStatus('That hope has left the Wall. There is room to meet another.')
      returnFocus()
    }
  }, [selectedId, selected])
  const report = async () => {
    if (!reportId) return
    setBusy(true)
    setError('')
    try {
      await wallRequest(`/${reportId}/report`, { reason })
      setReportId(null)
      setStatus('Thank you. That hope has been removed from the Wall.')
      await refresh()
      requestAnimationFrame(returnFocus)
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Please try again.')
    } finally {
      setBusy(false)
    }
  }
  const manage = async (action: 'receipt' | 'withdraw') => {
    setBusy(true)
    setError('')
    setReceiptStatus('')
    try {
      const receipt = await manageHope(action, key.trim())
      setReceiptStatus(
        receipt.state === 'shared'
          ? 'This hope is on the Wall.'
          : receipt.state === 'flagged'
            ? 'This hope was flagged and has left the Wall.'
            : 'This hope has been withdrawn.',
      )
      await refresh()
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : 'Please try again.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="community-wall" id="shared-wall" ref={wallFocusRef} tabIndex={-1}>
      <div className="community-intro">
        <span className="eyebrow">SHARED TOMORROWS</span>
        <p>
          {loading
            ? 'Opening the Wall…'
            : feed
              ? 'Words shared here, with only an age beside them.'
              : 'The shared Wall is not connected. Your private reflection still works.'}
        </p>
        <button className="text-button" onClick={() => void refresh()} disabled={loading}>
          Refresh the Wall
        </button>
      </div>
      {feed && !feed.hopes.length && (
        <div className="wall-empty">
          <span aria-hidden="true" className="empty-thread">
            ⌁
          </span>
          <p>The first place is still open.</p>
          <span>
            Shared hopes will appear here. Until then, you can explore the imagined wall below.
          </span>
        </div>
      )}
      {candidates.length > 0 && (
        <button ref={browseRef} className="button button-dark meet-tomorrow" onClick={() => meet()}>
          {selected
            ? 'Meet another tomorrow'
            : candidates.some((hope) => reflection?.age != null && hope.age !== reflection.age)
              ? 'Meet a tomorrow from another age'
              : 'Meet another tomorrow'}
          <ArrowRight size={16} />
        </button>
      )}
      {selected && (
        <div
          className="shared-encounter"
          ref={encounterRef}
          tabIndex={-1}
          role="group"
          aria-label="Your hope beside another tomorrow"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setSelectedId(null)
              returnFocus()
            }
          }}
        >
          {reflection && (
            <figure className="shared-hope own-hope">
              <figcaption>
                {reflection.age !== null && <span className="shared-age">{reflection.age}</span>}
                <span>Your hope</span>
              </figcaption>
              <blockquote>“{reflection.text}”</blockquote>
            </figure>
          )}
          <figure className="shared-hope encountered-hope">
            <figcaption>
              <span className="shared-age">{selected.age}</span>
              <span>years old</span>
            </figcaption>
            <blockquote>“{selected.text}”</blockquote>
            <button className="text-link" onClick={() => onBorrow(selected)}>
              Borrow this person’s clock <ArrowRight size={15} />
            </button>
          </figure>
          <p className="encounter-question">What feels familiar? What feels different?</p>
          <button
            className="text-button encounter-close"
            onClick={() => {
              setSelectedId(null)
              returnFocus()
            }}
          >
            Back to the Wall
          </button>
        </div>
      )}
      {!!feed?.hopes.length && !selected && (
        <div className="shared-hope-list">
          {feed.hopes.map((hope) => (
            <figure className="shared-hope" key={hope.id}>
              <figcaption>
                <span className="shared-age">{hope.age}</span>
                <span>years old</span>
              </figcaption>
              <blockquote>“{hope.text}”</blockquote>
              <div className="shared-note-actions">
                {hope.id === ownId ? (
                  <span className="small-note">Your shared hope</span>
                ) : (
                  <button className="text-button" onClick={() => meet(hope.id)}>
                    {reflection ? 'Beside my hope' : 'Spend a moment here'}
                  </button>
                )}
                <button
                  className="flag-hope"
                  aria-label={`Flag hope from age ${hope.age}`}
                  onClick={() => {
                    setReportId(hope.id)
                    setError('')
                  }}
                >
                  <Flag size={14} />
                </button>
              </div>
              {reportId === hope.id && (
                <div className="report-choice">
                  <label>
                    Reason to flag
                    <select value={reason} onChange={(event) => setReason(event.target.value)}>
                      <option value="identifying">Identifying details</option>
                      <option value="harmful">Harmful or abusive</option>
                      <option value="other">Another concern</option>
                    </select>
                  </label>
                  <p>Flagging removes this hope from the Wall.</p>
                  <button className="text-button" disabled={busy} onClick={report}>
                    Flag and remove
                  </button>
                  <button className="text-button" onClick={() => setReportId(null)}>
                    Cancel
                  </button>
                </div>
              )}
            </figure>
          ))}
        </div>
      )}
      {feed && (
        <details className="manage-hope">
          <summary>Already shared? Check or withdraw with your key.</summary>
          <label htmlFor="wall-removal-key">Removal key</label>
          <input
            id="wall-removal-key"
            value={key}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => setKey(event.target.value)}
          />
          <div className="sharing-actions">
            <button
              className="text-button"
              disabled={busy || !key.trim()}
              onClick={() => manage('receipt')}
            >
              Check my hope
            </button>
            <button
              className="text-button"
              disabled={busy || !key.trim()}
              onClick={() => manage('withdraw')}
            >
              Withdraw my hope
            </button>
          </div>
          <p role="status">{receiptStatus}</p>
        </details>
      )}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      <p className="sr-only" role="status">
        {status}
      </p>
    </div>
  )
}
