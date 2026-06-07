import { GlassCard } from './GlassCard'

interface QuestionCardProps {
  question: string
  questionEn?: string
  index: number
}

export function QuestionCard({ question, questionEn, index }: QuestionCardProps) {
  return (
    <GlassCard
      className="p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-white leading-relaxed">{question}</h2>
        {questionEn && <p className="text-base text-white/50 font-light">{questionEn}</p>}
      </div>
    </GlassCard>
  )
}
