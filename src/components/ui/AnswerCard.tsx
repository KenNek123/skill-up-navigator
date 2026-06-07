import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface AnswerCardProps {
  label: string
  labelEn?: string
  selected: boolean
  onSelect: () => void
  index: number
}

export function AnswerCard({ label, labelEn, selected, onSelect, index }: AnswerCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-300 ${
        selected
          ? 'bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border-cyan-400 shadow-lg shadow-cyan-500/25'
          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
      }`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start gap-4">
        <div
          className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
            selected ? 'bg-cyan-400 border-cyan-400' : 'border-white/30'
          }`}
        >
          {selected && <Check size={14} className="text-[#0a0e1a]" strokeWidth={3} />}
        </div>
        <div className="flex-1 space-y-1">
          <div className="text-base font-medium text-white">{label}</div>
          {labelEn && <div className="text-sm text-white/50">{labelEn}</div>}
        </div>
      </div>
    </motion.button>
  )
}
