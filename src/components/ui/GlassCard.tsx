import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  hover?: boolean
  className?: string
}

export function GlassCard({ children, hover = false, className = '', ...props }: GlassCardProps) {
  return (
    <motion.div
      className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl ${className}`}
      whileHover={hover ? { scale: 1.02, borderColor: 'rgba(34, 211, 238, 0.3)' } : undefined}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}
