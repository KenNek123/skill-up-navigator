import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { BrandLogo } from './ui/BrandLogo'
import { QuestionCard } from './ui/QuestionCard'
import { AnswerCard } from './ui/AnswerCard'
import { CTAButton } from './ui/CTAButton'
import { ProgressHeader } from './ui/ProgressHeader'
import type { Question, QuestionAnswer } from '../questionnaire/questionnaire.types'

interface QuestionStepperProps {
  questions: Question[]
  onComplete: (answers: QuestionAnswer[]) => void
}

export function QuestionStepper({ questions, onComplete }: QuestionStepperProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<QuestionAnswer[]>([])
  const [direction, setDirection] = useState(0)

  const currentQuestion = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100
  const isLastQuestion = currentIndex === questions.length - 1

  const currentAnswer = answers.find((a) => a.questionId === currentQuestion.id)

  const canProceed = () => {
    if (!currentQuestion.required) return true
    if (!currentAnswer) return false

    if (currentQuestion.type === 'multiple') {
      return Array.isArray(currentAnswer.value) && currentAnswer.value.length > 0
    }

    return currentAnswer.value !== '' && currentAnswer.value !== undefined
  }

  const handleAnswer = (value: string | string[] | number) => {
    const newAnswers = answers.filter((a) => a.questionId !== currentQuestion.id)
    newAnswers.push({
      questionId: currentQuestion.id,
      value,
    })
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (!canProceed()) return

    if (isLastQuestion) {
      onComplete(answers)
    } else {
      setDirection(1)
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentIndex > 0) {
      setDirection(-1)
      setCurrentIndex((prev) => prev - 1)
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && canProceed()) {
        handleNext()
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        handleBack()
      } else if (e.key === 'ArrowRight' && canProceed()) {
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, answers])

  const handleSingleChoice = (value: string) => {
    handleAnswer(value)
  }

  const handleMultipleChoice = (value: string) => {
    const current = (currentAnswer?.value as string[]) || []
    const newValue = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    handleAnswer(newValue)
  }

  const handleScale = (value: number) => {
    handleAnswer(value)
  }

  const handleText = (value: string) => {
    handleAnswer(value)
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] bg-gradient-to-b from-[#0a0e1a] via-[#0f1420] to-[#0a0e1a]">
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0a0e1a]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <BrandLogo size="sm" />
          </a>
          <ProgressHeader current={currentIndex + 1} total={questions.length} progress={progress} />
        </div>
      </div>

      <div className="pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQuestion.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
            >
              <div className="space-y-8">
                <QuestionCard
                  question={currentQuestion.textVi}
                  questionEn={currentQuestion.text}
                  index={currentIndex}
                />

                {currentQuestion.type === 'single' && currentQuestion.options && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, idx) => (
                      <AnswerCard
                        key={option.value}
                        label={option.labelVi}
                        labelEn={option.label}
                        selected={currentAnswer?.value === option.value}
                        onSelect={() => handleSingleChoice(option.value)}
                        index={idx}
                      />
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'multiple' && currentQuestion.options && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, idx) => (
                      <AnswerCard
                        key={option.value}
                        label={option.labelVi}
                        labelEn={option.label}
                        selected={
                          Array.isArray(currentAnswer?.value) &&
                          currentAnswer.value.includes(option.value)
                        }
                        onSelect={() => handleMultipleChoice(option.value)}
                        index={idx}
                      />
                    ))}
                  </div>
                )}

                {currentQuestion.type === 'scale' && currentQuestion.scaleRange && (
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8">
                    <div className="space-y-6">
                      <div className="flex justify-between text-sm text-white/60">
                        <span>{currentQuestion.scaleRange.minLabel}</span>
                        <span>{currentQuestion.scaleRange.maxLabel}</span>
                      </div>
                      <input
                        type="range"
                        min={currentQuestion.scaleRange.min}
                        max={currentQuestion.scaleRange.max}
                        value={(currentAnswer?.value as number) ?? 50}
                        onChange={(e) => handleScale(Number(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                      />
                      <div className="text-center">
                        <span className="text-4xl font-bold text-gradient">
                          {(currentAnswer?.value as number) ?? 50}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {currentQuestion.type === 'text' && (
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                    <textarea
                      value={(currentAnswer?.value as string) ?? ''}
                      onChange={(e) => handleText(e.target.value)}
                      placeholder="Nhập câu trả lời của bạn..."
                      className="w-full bg-transparent border-none text-white placeholder-white/40 focus:outline-none resize-none min-h-32"
                      autoFocus
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-6">
                  <CTAButton
                    onClick={handleBack}
                    variant="ghost"
                    disabled={currentIndex === 0}
                  >
                    <ArrowLeft size={20} />
                    Quay lại
                  </CTAButton>

                  <CTAButton
                    onClick={handleNext}
                    variant="primary"
                    disabled={!canProceed()}
                  >
                    {isLastQuestion ? 'Xem kết quả' : 'Tiếp tục'}
                    <ArrowRight size={20} />
                  </CTAButton>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
