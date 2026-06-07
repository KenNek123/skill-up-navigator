import { motion } from 'framer-motion'

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animated?: boolean
  className?: string
}

export function BrandLogo({ size = 'md', animated = false, className = '' }: BrandLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32',
  }

  const LogoElement = animated ? motion.img : 'img'
  const animationProps = animated
    ? {
        animate: { y: [0, -10, 0] },
        transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' as const },
      }
    : {}

  return (
    <LogoElement
      src="/logo.svg"
      alt="AI Career Navigator"
      className={`${sizeClasses[size]} ${className}`}
      style={{
        filter: 'drop-shadow(0 0 12px rgba(34, 211, 238, 0.4))',
      }}
      {...animationProps}
    />
  )
}
