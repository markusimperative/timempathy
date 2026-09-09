// Keep narrative content separate so another language can carry the same idea.
export const copy = {
  hero: {
    eyebrow: 'AN EXPLORATION OF HUMAN TIME',
    title: ['The same clock.', 'A different', 'feeling.'],
    intro:
      'We share the hours. But a year, a day, a moment can hold something different for each of us.',
    invitation: 'Step into someone else’s sense of time.',
  },
  weight: {
    title: 'Borrow another clock.',
    intro: 'Each circle holds a life so far. The bright arc is one year.',
    caveat: 'A visual analogy, not a measure of how time feels.',
  },
  memory: {
    title: ['A day passes.', 'What stays?'],
    intro: 'A week can be seven equal days on a calendar, and something quite different in memory.',
    lived:
      'Seven days, each with the same space. A familiar cup, a different sky, a conversation at the table.',
    remembered:
      'Here, familiar cups fold together, while other moments stay distinct. This is one imagined memory. Yours might hold the cups most clearly.',
    closing: 'The familiar can be what we treasure most.',
  },
  tomorrow: {
    title: ['How would you like', 'to remember tomorrow?'],
    intro:
      'Imagine tomorrow is already a memory. Something small is enough. An ordinary, peaceful day is enough.',
  },
} as const

export type Hope = { id: string; age: number; text: string; thread: 'company' | 'quiet' | 'small' }

// Authored examples, never represented as real visitor submissions.
export const hopes: Hope[] = [
  { id: 's1', age: 17, text: 'Having dinner with someone I love.', thread: 'company' },
  {
    id: 's2',
    age: 79,
    text: 'A long dinner. Nobody needing to leave just yet.',
    thread: 'company',
  },
  { id: 's3', age: 34, text: 'Sitting outside with my tea before it gets cold.', thread: 'quiet' },
  { id: 's4', age: 68, text: 'Getting the bread just right.', thread: 'small' },
  { id: 's5', age: 23, text: 'A day when I feel a little more at home.', thread: 'quiet' },
  { id: 's6', age: 51, text: 'Laughing so much I forget what started it.', thread: 'company' },
  { id: 's7', age: 86, text: 'Hearing a song I haven’t heard in ages.', thread: 'small' },
  { id: 's8', age: 42, text: 'Walking with my friend. The usual route.', thread: 'company' },
  { id: 's9', age: 19, text: 'The smell of rain through the window.', thread: 'small' },
  { id: 's10', age: 73, text: 'A quiet afternoon with nothing much to tell.', thread: 'quiet' },
  { id: 's11', age: 29, text: 'Making something nice for lunch.', thread: 'small' },
  {
    id: 's12',
    age: 60,
    text: 'Someone asking how I am and having time to listen.',
    thread: 'company',
  },
]
