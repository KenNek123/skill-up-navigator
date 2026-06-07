import { motion } from 'framer-motion'

interface ProgressHeaderProps {
  current: number
  total: number
  progress: number
}

export function ProgressHeader({ current, total, progress }: ProgressHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-space/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-sm font-medium text-white/70">
          Câu hỏi {current} / {total}
        </div>
        <div className="flex-1 mx-8 h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-teal-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <div className="text-sm font-medium text-cyan-400">{Math.round(progress)}%</div>
      </div>
    </div>
  )
}
