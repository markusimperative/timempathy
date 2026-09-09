export type MomentKind = 'cup' | 'rain' | 'table' | 'moon' | 'flower'
export type MemoryMoment = {
  day: string
  kind: MomentKind
  label: string
  note: string
  detail: string
}

export const moments: MemoryMoment[] = [
  {
    day: 'MON',
    kind: 'cup',
    label: 'A familiar cup',
    note: 'The cup you reach for without thinking.',
    detail: 'A chipped rim. The first light on the table.',
  },
  {
    day: 'TUE',
    kind: 'cup',
    label: 'The same cup',
    note: 'That little warmth in your hands.',
    detail: 'The light has moved. The cup is where you left it.',
  },
  {
    day: 'WED',
    kind: 'cup',
    label: 'Morning, again',
    note: 'A familiar morning can stay with you, too.',
    detail: 'Another cup across the table. A little company.',
  },
  {
    day: 'THU',
    kind: 'rain',
    label: 'A sudden rain',
    note: 'The sound of the rain through an open window.',
    detail: 'An open window. The curtain lifts a little.',
  },
  {
    day: 'FRI',
    kind: 'table',
    label: 'A long conversation',
    note: 'Something someone said across the table.',
    detail: 'Two places set. A chair pulled a little closer.',
  },
  {
    day: 'SAT',
    kind: 'moon',
    label: 'An evening walk',
    note: 'The sky on the way back.',
    detail: 'The familiar path. A small light above it.',
  },
  {
    day: 'SUN',
    kind: 'flower',
    label: 'Something growing',
    note: 'A new leaf on a plant you’ve had for years.',
    detail: 'One leaf uncurling toward the window.',
  },
]
