import type { DimensionKey, WorkStyle } from '../engine/types'

export type QuestionCategory =
  | 'education'
  | 'experience'
  | 'skills'
  | 'tools'
  | 'projects'
  | 'analyticalThinking'
  | 'creativity'
  | 'communication'
  | 'leadership'
  | 'technicalAptitude'
  | 'businessAptitude'
  | 'learningAgility'
  | 'decisionMaking'
  | 'socialPreference'
  | 'workStyle'
  | 'careerMotivation'

export type QuestionType = 'single' | 'multiple' | 'scale' | 'text'

export type QuestionOption = {
  value: string
  label: string
  labelVi: string
  dimensionImpact?: Partial<Record<DimensionKey, number>>
  workStyleSignal?: WorkStyle[]
  preferenceSignal?: {
    remote?: number
    stability?: number
    growth?: number
    socialImpact?: number
    income?: number
    autonomy?: number
  }
}

export type Question = {
  id: string
  category: QuestionCategory
  type: QuestionType
  text: string
  textVi: string
  options?: QuestionOption[]
  scaleRange?: { min: number; max: number; minLabel: string; maxLabel: string }
  required: boolean
  flowA: boolean
  flowB: boolean
}

export type QuestionAnswer = {
  questionId: string
  value: string | string[] | number
}

export type QuestionSession = {
  sessionId: string
  flow: 'A' | 'B'
  answers: QuestionAnswer[]
  startedAt: Date
  completedAt?: Date
}
