import { useCallback, useEffect, useRef, useState } from 'react'
import { z } from 'zod'
export const wallHopeSchema = z.object({
  id: z.uuid(),
  text: z.string().min(1).max(240),
  age: z.number().int().min(1).max(120),
})
export type WallHope = z.infer<typeof wallHopeSchema>
const feedSchema = z.object({
  mode: z.literal('local-prototype'),
  consentVersion: z.string(),
  retentionDays: z.number().int(),
  hopes: z.array(wallHopeSchema),
})
export type WallFeed = z.infer<typeof feedSchema>
export type Receipt = { id: string; state: 'shared' | 'withdrawn' | 'flagged'; expires: number }
const receiptSchema = z.object({
  id: z.uuid(),
  state: z.enum(['shared', 'withdrawn', 'flagged']),
  expires: z.number(),
})
export const makeRemovalKey = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(32)), (n) =>
    n.toString(16).padStart(2, '0'),
  ).join('')

export class WallRequestError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function wallRequest(path: string, body?: unknown, key?: string): Promise<unknown> {
  const response = await fetch(`/api/wall${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(key ? { Authorization: `Bearer ${key}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
    signal: AbortSignal.timeout(10000),
  })
  if (!response.headers.get('content-type')?.includes('application/json'))
    throw new Error('The shared Wall is not connected. Your private thought is still here.')
  const data = await response.json()
  if (!response.ok)
    throw new WallRequestError(
      typeof data.message === 'string'
        ? data.message
        : 'The Wall could not complete this request. Please try again.',
      response.status,
    )
  return data
}
export async function sendHope(input: {
  text: string
  age: number
  key: string
  consentVersion: string
}) {
  return receiptSchema.parse(await wallRequest('', { ...input, consent: true }))
}
export async function manageHope(action: 'receipt' | 'withdraw', key: string) {
  return receiptSchema.parse(await wallRequest(`/${action}`, {}, key))
}
export function useWall() {
  const [feed, setFeed] = useState<WallFeed | null>(null)
  const [loading, setLoading] = useState(true)
  const controller = useRef<AbortController | null>(null)
  const refresh = useCallback(async () => {
    controller.current?.abort()
    const active = new AbortController()
    controller.current = active
    try {
      const response = await fetch('/api/wall', {
        signal: AbortSignal.any([active.signal, AbortSignal.timeout(10000)]),
        cache: 'no-store',
      })
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json'))
        throw new Error('Offline')
      const next = feedSchema.parse(await response.json())
      if (!active.signal.aborted) setFeed(next)
    } catch {
      if (!active.signal.aborted) setFeed(null)
    } finally {
      if (!active.signal.aborted) setLoading(false)
    }
  }, [])
  useEffect(() => {
    void refresh()
    const visible = () => {
      if (!document.hidden) void refresh()
    }
    window.addEventListener('focus', visible)
    document.addEventListener('visibilitychange', visible)
    const timer = window.setInterval(visible, 30000)
    return () => {
      controller.current?.abort()
      clearInterval(timer)
      window.removeEventListener('focus', visible)
      document.removeEventListener('visibilitychange', visible)
    }
  }, [refresh])
  return { feed, loading, refresh }
}

// Age offers distance, not a prediction of emotional similarity. No text is sent for matching.
export function encounterCandidates(
  hopes: WallHope[],
  age: number | null,
  ownId?: string,
  ownText?: string,
) {
  const others = hopes.filter((hope) => hope.id !== ownId && hope.text !== ownText)
  if (age === null) return others
  const distant = others.filter((hope) => Math.abs(hope.age - age) >= 15)
  const different = others.filter((hope) => hope.age !== age)
  return distant.length ? distant : different.length ? different : others
}
