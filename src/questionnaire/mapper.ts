import type { QuestionAnswer } from './questionnaire.types'
import type { DimensionScores, HumanProfile, StructuredCvEvidence, WorkStyle } from '../engine/types'
import { questions } from './questionBank'
import { emptyStructuredEvidence } from '../data/careers'

type DimensionAccumulator = Record<keyof DimensionScores, number[]>

const initDimensionAccumulator = (): DimensionAccumulator => ({
  logic: [],
  analyticalThinking: [],
  communication: [],
  leadership: [],
  adaptability: [],
  creativity: [],
  technicalAffinity: [],
  collaboration: [],
  learningAgility: [],
  decisionMaking: [],
  riskTolerance: [],
  motivation: [],
})

const averageOrBase = (values: number[], base: number) =>
  values.length === 0 ? base : Math.round(values.reduce((sum, v) => sum + v, 0) / values.length)

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value))

export const mapAnswersToProfile = (answers: QuestionAnswer[], flow: 'A' | 'B'): HumanProfile => {
  const dimensionAcc = initDimensionAccumulator()
  const workStyleSet = new Set<WorkStyle>()
  const preferenceSignals = {
    remote: [] as number[],
    stability: [] as number[],
    growth: [] as number[],
    socialImpact: [] as number[],
    income: [] as number[],
    autonomy: [] as number[],
  }

  const evidence: string[] = []
  const structuredEvidence: StructuredCvEvidence = emptyStructuredEvidence()

  const answerMap = new Map(answers.map((a) => [a.questionId, a]))

  for (const answer of answers) {
    const question = questions.find((q) => q.id === answer.questionId)
    if (!question) continue

    if (question.type === 'scale' && typeof answer.value === 'number') {
      if (question.id === 'remote_preference') {
        preferenceSignals.remote.push(answer.value)
      } else if (question.id === 'data_comfort') {
        dimensionAcc.analyticalThinking.push(50 + answer.value * 0.4)
        dimensionAcc.logic.push(50 + answer.value * 0.35)
      } else if (question.id === 'learning_speed') {
        dimensionAcc.learningAgility.push(50 + answer.value * 0.4)
        dimensionAcc.adaptability.push(50 + answer.value * 0.2)
      }
      continue
    }

    const selectedValues = Array.isArray(answer.value)
      ? answer.value
      : typeof answer.value === 'string'
        ? [answer.value]
        : []

    for (const value of selectedValues) {
      const option = question.options?.find((opt) => opt.value === value)
      if (!option) continue

      if (option.dimensionImpact) {
        for (const [dim, impact] of Object.entries(option.dimensionImpact)) {
          const key = dim as keyof DimensionScores
          dimensionAcc[key].push(impact)
        }
      }

      if (option.workStyleSignal) {
        option.workStyleSignal.forEach((ws) => workStyleSet.add(ws))
      }

      if (option.preferenceSignal) {
        for (const [pref, signal] of Object.entries(option.preferenceSignal)) {
          const key = pref as keyof typeof preferenceSignals
          if (signal !== undefined) {
            preferenceSignals[key].push(signal)
          }
        }
      }
    }

    if (question.type === 'text' && typeof answer.value === 'string' && answer.value.trim()) {
      if (question.id === 'edu_major') {
        const major = answer.value.trim()
        structuredEvidence.education.push({
          degree: answerMap.get('edu_degree')?.value as string || 'Unknown',
          major,
          institution: 'University',
          graduationYear: new Date().getFullYear().toString(),
        })
        evidence.push(`Học chuyên ngành ${major}`)
      } else if (question.id === 'tools_used') {
        const tools = answer.value.split(',').map((t) => t.trim()).filter(Boolean)
        structuredEvidence.tools.push(...tools)
        evidence.push(`Sử dụng các công cụ: ${tools.slice(0, 3).join(', ')}`)
      }
    }

    if (question.id === 'exp_years' && typeof answer.value === 'string') {
      const yearsMap: Record<string, string> = {
        '0': 'Chưa có kinh nghiệm',
        '0-1': 'Dưới 1 năm kinh nghiệm',
        '1-3': '1-3 năm kinh nghiệm',
        '3-5': '3-5 năm kinh nghiệm',
        '5-10': '5-10 năm kinh nghiệm',
        '10+': 'Hơn 10 năm kinh nghiệm',
      }
      evidence.push(yearsMap[answer.value] || answer.value)

      if (answer.value !== '0' && answer.value !== '0-1') {
        structuredEvidence.experience.push({
          company: 'Previous Company',
          role: 'Professional',
          duration: answer.value,
          industry: 'General',
        })
      }
    }

    if (question.id === 'exp_industries' && Array.isArray(answer.value)) {
      structuredEvidence.industries.push(...answer.value)
      evidence.push(`Kinh nghiệm trong các ngành: ${answer.value.slice(0, 3).join(', ')}`)
    }

    if (question.id === 'skills_technical' && Array.isArray(answer.value)) {
      const techSkills = answer.value.filter((v) => v !== 'none')
      if (techSkills.length > 0) {
        structuredEvidence.skills.technical.push(...techSkills)
        evidence.push(`Kỹ năng kỹ thuật: ${techSkills.slice(0, 3).join(', ')}`)
      }
    }

    if (question.id === 'projects_completed' && typeof answer.value === 'string') {
      const projectsMap: Record<string, number> = {
        '0': 0,
        '1-2': 2,
        '3-5': 4,
        '6-10': 8,
        '10+': 12,
      }
      const projectCount = projectsMap[answer.value] || 0
      if (projectCount > 0) {
        evidence.push(`Đã hoàn thành khoảng ${answer.value} dự án`)
        for (let i = 0; i < Math.min(projectCount, 3); i++) {
          structuredEvidence.projects.push({
            name: `Project ${i + 1}`,
            description: 'Project experience',
            tools: structuredEvidence.tools.slice(0, 2),
            industry: structuredEvidence.industries[0] || 'General',
          })
        }
      }
    }

    if (question.id === 'career_goals' && Array.isArray(answer.value)) {
      const goalMap: Record<string, string> = {
        high_income: 'Thu nhập cao',
        work_life_balance: 'Cân bằng công việc-cuộc sống',
        skill_growth: 'Phát triển kỹ năng liên tục',
        social_impact: 'Tạo tác động xã hội',
        leadership: 'Lãnh đạo đội nhóm',
        autonomy: 'Độc lập và tự chủ',
      }
      evidence.push(`Mục tiêu nghề nghiệp: ${answer.value.map((v) => goalMap[v] || v).join(', ')}`)
    }
  }

  const baseDimensions: DimensionScores = {
    logic: 65,
    analyticalThinking: 65,
    communication: 65,
    leadership: 60,
    adaptability: 70,
    creativity: 65,
    technicalAffinity: 60,
    collaboration: 70,
    learningAgility: 70,
    decisionMaking: 65,
    riskTolerance: 55,
    motivation: 70,
  }

  const dimensions: DimensionScores = Object.fromEntries(
    Object.entries(dimensionAcc).map(([dim, impacts]) => {
      const key = dim as keyof DimensionScores
      const base = baseDimensions[key]
      const adjustment = impacts.reduce((sum, v) => sum + v, 0)
      return [key, clamp(base + adjustment, 30, 95)]
    }),
  ) as DimensionScores

  const workStyles = Array.from(workStyleSet).slice(0, 3) as WorkStyle[]
  if (workStyles.length === 0) {
    workStyles.push('structured', 'deepWork')
  }

  const preferences = {
    remote: clamp(averageOrBase(preferenceSignals.remote, 65)),
    stability: clamp(averageOrBase(preferenceSignals.stability, 70)),
    growth: clamp(averageOrBase(preferenceSignals.growth, 75)),
    socialImpact: clamp(averageOrBase(preferenceSignals.socialImpact, 60)),
    income: clamp(averageOrBase(preferenceSignals.income, 70)),
    autonomy: clamp(averageOrBase(preferenceSignals.autonomy, 65)),
    workStyles,
  }

  if (flow === 'B') {
    for (const [dim, impacts] of Object.entries(dimensionAcc)) {
      if (impacts.length === 0) {
        const key = dim as keyof DimensionScores
        dimensions[key] = baseDimensions[key]
      }
    }
  }

  const eduAnswer = answerMap.get('edu_major')
  const eduMajor = typeof eduAnswer?.value === 'string' ? eduAnswer.value : 'General'

  return {
    name: 'User',
    headline: flow === 'A'
      ? `${eduMajor} background với một số kinh nghiệm thực tế`
      : `Học viên định hướng nghề nghiệp`,
    dimensions,
    preferences,
    evidence: evidence.length > 0 ? evidence : ['Hoàn thành bảng câu hỏi định hướng nghề nghiệp'],
    structuredEvidence,
  }
}
