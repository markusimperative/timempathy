import { z } from 'zod'

export const ageSchema = z.number().int().min(1).max(120)
export function yearShare(age: number) {
  return 1 / ageSchema.parse(age)
}
export function arcPoint(age: number, progress: number, radius = 132) {
  const angle = Math.min(1, Math.max(0, progress)) * yearShare(age) * Math.PI * 2 - Math.PI / 2
  return { x: 180 + radius * Math.cos(angle), y: 180 + radius * Math.sin(angle) }
}

export const reflectionSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, 'A few words are enough.')
    .max(240, 'Please keep your reflection within 240 characters.'),
  age: ageSchema.nullable(),
})
export type Reflection = z.infer<typeof reflectionSchema>
export const STORAGE_KEY = 'timempathy.reflection.v1'
type StoragePort = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
export type ReadResult = { value: Reflection | null; unavailable: boolean }

// A single, deliberately saved reflection. No identity, history, timestamps, or network.
export function readReflection(storage: StoragePort): ReadResult {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return { value: null, unavailable: false }
    const parsed = reflectionSchema.safeParse(JSON.parse(raw))
    return { value: parsed.success ? parsed.data : null, unavailable: !parsed.success }
  } catch {
    return { value: null, unavailable: true }
  }
}
export function saveReflection(storage: StoragePort, input: Reflection): boolean {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(reflectionSchema.parse(input)))
    return true
  } catch {
    return false
  }
}
export function forgetReflection(storage: StoragePort): boolean {
  try {
    storage.removeItem(STORAGE_KEY)
    return true
  } catch {
    return false
  }
}
