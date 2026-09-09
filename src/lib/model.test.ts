import { describe, expect, it } from 'vitest'
import {
  arcPoint,
  forgetReflection,
  readReflection,
  reflectionSchema,
  saveReflection,
  STORAGE_KEY,
  yearShare,
} from './model'

function memoryStorage() {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
    removeItem: (key: string) => {
      values.delete(key)
    },
  }
}

describe('the proportional lens', () => {
  it('preserves the same year across ages, without a lifespan assumption', () => {
    expect(yearShare(5)).toBe(0.2)
    expect(yearShare(100)).toBe(0.01)
    expect(yearShare(1)).toBe(1)
    expect(arcPoint(5, 0)).toEqual(arcPoint(85, 0))
    const end = arcPoint(5, 1)
    expect(end.x).toBeCloseTo(305.539)
    expect(end.y).toBeCloseTo(139.21)
  })
  it.each([0, -1, 32.5, NaN, Infinity, 121])('rejects invalid age %s', (age) =>
    expect(() => yearShare(age)).toThrow(),
  )
  it('clamps playback to one year', () => {
    expect(arcPoint(32, -5)).toEqual(arcPoint(32, 0))
    expect(arcPoint(32, 9)).toEqual(arcPoint(32, 1))
  })
})

describe('a single private reflection', () => {
  it('requires words and permits no age', () => {
    expect(reflectionSchema.safeParse({ text: '   ', age: null }).success).toBe(false)
    expect(reflectionSchema.parse({ text: ' A quiet lunch. ', age: null })).toEqual({
      text: 'A quiet lunch.',
      age: null,
    })
    expect(reflectionSchema.safeParse({ text: 'a'.repeat(241), age: 25 }).success).toBe(false)
    expect(reflectionSchema.safeParse({ text: 'Lunch', age: 25.5 }).success).toBe(false)
  })
  it('stores only the reflection and optional age, replaces it, and removes it', () => {
    const storage = memoryStorage()
    expect(readReflection(storage).value).toBeNull()
    expect(saveReflection(storage, { text: 'Lunch', age: 79 })).toBe(true)
    expect(JSON.parse(storage.getItem(STORAGE_KEY)!)).toEqual({ text: 'Lunch', age: 79 })
    saveReflection(storage, { text: 'Rain', age: null })
    expect(readReflection(storage).value).toEqual({ text: 'Rain', age: null })
    expect(forgetReflection(storage)).toBe(true)
    expect(readReflection(storage).value).toBeNull()
  })
  it.each(['not json', '{"age":32}', '{"text":"secret","age":-1}', 'null'])(
    'handles malformed stored data without exposing it: %s',
    (raw) => {
      const storage = memoryStorage()
      storage.setItem(STORAGE_KEY, raw)
      expect(readReflection(storage)).toEqual({ value: null, unavailable: true })
    },
  )
  it('reports storage failures honestly', () => {
    const blocked = {
      getItem() {
        throw Error('blocked')
      },
      setItem() {
        throw Error('quota')
      },
      removeItem() {
        throw Error('blocked')
      },
    }
    expect(readReflection(blocked).unavailable).toBe(true)
    expect(saveReflection(blocked, { text: 'A cup of tea', age: null })).toBe(false)
    expect(forgetReflection(blocked)).toBe(false)
  })
})
