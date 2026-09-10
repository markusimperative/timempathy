import { z } from 'zod'
import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from 'obscenity'

export const RETENTION_DAYS = 7
export const keySchema = z.string().regex(/^[a-f0-9]{64}$/)
export const submissionSchema = (consentVersion: string) =>
  z
    .object({
      text: z.string().trim().min(1).max(240),
      age: z.number().int().min(1).max(120),
      consent: z.literal(true),
      consentVersion: z.literal(consentVersion),
      key: keySchema,
    })
    .strict()
export const reportSchema = z
  .object({ reason: z.enum(['identifying', 'harmful', 'other']) })
  .strict()
const matcher = new RegExpMatcher({ ...englishDataset.build(), ...englishRecommendedTransformers })

export function checkWords(text: string): string | null {
  const normalized = text.normalize('NFKC')
  const contact =
    /(?:https?:|www\.|[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:\+?\d[\s().-]*){7,}|@[\w_]{2,}|\b[\w-]+\.(?:com|net|org|io|fr|uk)\b)/iu
  const control =
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/u
  if (contact.test(normalized) || control.test(normalized))
    return 'Leave out links, contact details, handles, and hidden formatting. You can also keep this thought private.'
  if (matcher.hasMatch(normalized))
    return 'The automated language check could not accept these words. You can revise them or keep your thought private.'
  return null
}
