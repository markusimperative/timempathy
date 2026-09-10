import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import type { MotionStyle } from 'motion/react'

// A reversible impression of the original drawing; labels remain outside it.
export function MemoryPrint({
  amount,
  still,
  children,
}: {
  amount: number
  still: boolean
  children: ReactNode
}) {
  const ink = useMotionValue(amount)
  useEffect(() => {
    if (still) {
      ink.set(amount)
      return
    }
    const transition = animate(ink, amount, { duration: 0.75, ease: [0.22, 0.7, 0.2, 1] })
    return () => transition.stop()
  }, [amount, still, ink])
  const opacity = useTransform(ink, (value) => 1 - value * 0.18)
  const filter = useTransform(ink, (value) => (value > 0 ? `blur(${value * 0.45}px)` : 'none'))
  const grain = useTransform(ink, (value) => 0.11 + value * 0.12)
  return (
    <motion.span
      className="memory-print"
      style={{ opacity, filter, '--grain-strength': grain } as MotionStyle}
    >
      {children}
    </motion.span>
  )
}
