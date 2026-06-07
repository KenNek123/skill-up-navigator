import type {
  Career,
  DimensionKey,
  EvidenceScoreBreakdown,
  HumanProfile,
  ScoreBreakdown,
} from './types'
import { dimensionLabels } from '../data/careers'

export type ExplainabilityReport = {
  strengths: DimensionStrength[]
  gaps: DimensionGap[]
  reasons: MatchReason[]
  evidence: EvidenceTrace[]
}

export type DimensionStrength = {
  dimension: DimensionKey
  dimensionLabel: string
  userScore: number
  careerRequirement: number
  delta: number
  explanation: string
}

export type DimensionGap = {
  dimension: DimensionKey
  dimensionLabel: string
  userScore: number
  careerRequirement: number
  delta: number
  explanation: string
  improvement: string
}

export type MatchReason = {
  category: 'dimension' | 'evidence' | 'preference' | 'market' | 'learning'
  weight: number
  score: number
  explanation: string
}

export type EvidenceTrace = {
  evidenceType: 'domain' | 'skill' | 'tool' | 'experience' | 'education' | 'interest'
  matched: string[]
  impact: number
  explanation: string
}

const getDimensionEntries = (career: Career) =>
  Object.entries(career.dna) as Array<[DimensionKey, number]>

export const explainCareerMatch = (
  profile: HumanProfile,
  career: Career,
  scoreBreakdown: ScoreBreakdown,
): ExplainabilityReport => {
  const strengths = buildStrengths(profile, career, scoreBreakdown)
  const gaps = buildGaps(profile, career, scoreBreakdown)
  const reasons = buildReasons(scoreBreakdown)
  const evidence = buildEvidenceTrace(scoreBreakdown.evidence)

  return { strengths, gaps, reasons, evidence }
}

const buildStrengths = (
  profile: HumanProfile,
  career: Career,
  _scoreBreakdown: ScoreBreakdown,
): DimensionStrength[] => {
  const entries = getDimensionEntries(career)
  const ranked = entries
    .map(([dimension, required]) => ({
      dimension,
      dimensionLabel: dimensionLabels[dimension].vi,
      userScore: profile.dimensions[dimension],
      careerRequirement: required,
      delta: profile.dimensions[dimension] - required,
    }))
    .filter((item) => item.delta >= 0)
    .sort((a, b) => b.delta - a.delta || b.careerRequirement - a.careerRequirement)
    .slice(0, 3)

  return ranked.map((item) => ({
    ...item,
    explanation: buildStrengthExplanation(item.dimension, item.userScore, item.careerRequirement, item.delta),
  }))
}

const buildStrengthExplanation = (
  dimension: DimensionKey,
  userScore: number,
  required: number,
  delta: number,
): string => {
  if (delta >= 20) {
    return `Bạn có ${dimensionLabels[dimension].vi.toLowerCase()} rất mạnh (${userScore}/100), vượt xa yêu cầu (${required}/100). Đây là thế mạnh cốt lõi.`
  }
  if (delta >= 10) {
    return `Bạn đạt ${userScore}/100 ở ${dimensionLabels[dimension].vi.toLowerCase()}, cao hơn mức cần thiết (${required}/100).`
  }
  return `Bạn có ${dimensionLabels[dimension].vi.toLowerCase()} phù hợp (${userScore}/100) với yêu cầu nghề nghiệp (${required}/100).`
}

const buildGaps = (
  profile: HumanProfile,
  career: Career,
  _scoreBreakdown: ScoreBreakdown,
): DimensionGap[] => {
  const entries = getDimensionEntries(career)
  const ranked = entries
    .map(([dimension, required]) => ({
      dimension,
      dimensionLabel: dimensionLabels[dimension].vi,
      userScore: profile.dimensions[dimension],
      careerRequirement: required,
      delta: profile.dimensions[dimension] - required,
    }))
    .filter((item) => item.delta < -5)
    .sort((a, b) => a.delta - b.delta)
    .slice(0, 3)

  return ranked.map((item) => ({
    ...item,
    explanation: buildGapExplanation(item.dimension, item.userScore, item.careerRequirement, item.delta),
    improvement: buildImprovementSuggestion(item.dimension, career),
  }))
}

const buildGapExplanation = (
  dimension: DimensionKey,
  userScore: number,
  required: number,
  delta: number,
): string => {
  const gap = Math.abs(delta)
  if (gap >= 20) {
    return `Khoảng cách lớn: ${dimensionLabels[dimension].vi} của bạn (${userScore}/100) thấp hơn đáng kể so với yêu cầu (${required}/100).`
  }
  if (gap >= 10) {
    return `${dimensionLabels[dimension].vi} của bạn (${userScore}/100) cần cải thiện để đạt mức yêu cầu (${required}/100).`
  }
  return `${dimensionLabels[dimension].vi} của bạn (${userScore}/100) hơi thấp so với mức tối ưu (${required}/100).`
}

const buildImprovementSuggestion = (dimension: DimensionKey, career: Career): string => {
  const suggestions: Record<DimensionKey, string> = {
    logic: `Luyện tập giải thuật, logic puzzle và tư duy có hệ thống qua các bài toán ${career.category.toLowerCase()}.`,
    analyticalThinking: `Thực hành phân tích dữ liệu, case study và đọc báo cáo phân tích trong ngành ${career.category}.`,
    communication: `Tập viết tài liệu kỹ thuật, trình bày ý tưởng và luyện kỹ năng thuyết trình cho ${career.category}.`,
    leadership: `Tham gia dẫn dắt dự án nhỏ, mentoring hoặc làm team lead trong các hoạt động liên quan ${career.category}.`,
    adaptability: `Thử các phương pháp mới, làm việc trong môi trường thay đổi nhanh và học công nghệ mới.`,
    creativity: `Thực hành brainstorming, thiết kế giải pháp sáng tạo và tham gia các dự án đổi mới trong ${career.category}.`,
    technicalAffinity: `Học các công cụ kỹ thuật cốt lõi: ${career.starterSkills.slice(0, 3).join(', ')}.`,
    collaboration: `Tham gia dự án nhóm, làm việc cross-functional và thực hành kỹ năng làm việc nhóm.`,
    learningAgility: `Thử học một kỹ năng mới mỗi tháng, đọc tài liệu kỹ thuật và tham gia khóa học chuyên sâu.`,
    decisionMaking: `Luyện ra quyết định dựa trên dữ liệu, phân tích trade-off và thực hành qua case study.`,
    riskTolerance: `Thử các dự án có độ rủi ro hợp lý, làm startup hoặc freelance để quen với bất định.`,
    motivation: `Tìm mục tiêu rõ ràng, tham gia cộng đồng ${career.category} và xác định động lực cá nhân.`,
  }

  return suggestions[dimension]
}

const buildReasons = (scoreBreakdown: ScoreBreakdown): MatchReason[] => {
  const reasons: MatchReason[] = []

  reasons.push({
    category: 'evidence',
    weight: 0.3,
    score: scoreBreakdown.evidenceFit,
    explanation: `Bằng chứng từ CV/kinh nghiệm đạt ${scoreBreakdown.evidenceFit}/100. ${
      scoreBreakdown.evidenceFit >= 70
        ? 'Hồ sơ của bạn có nhiều tín hiệu phù hợp với nghề này.'
        : scoreBreakdown.evidenceFit >= 50
          ? 'Có một số bằng chứng phù hợp, nhưng cần thêm dự án hoặc kinh nghiệm cụ thể.'
          : 'CV chưa có đủ bằng chứng trực tiếp. Hãy bổ sung dự án và kết quả định lượng.'
    }`,
  })

  reasons.push({
    category: 'dimension',
    weight: 0.2,
    score: scoreBreakdown.compatibility,
    explanation: `Mã năng lực nghề đạt ${scoreBreakdown.compatibility}/100. ${
      scoreBreakdown.compatibility >= 75
        ? 'Điểm mạnh của bạn phù hợp tự nhiên với yêu cầu nghề nghiệp.'
        : scoreBreakdown.compatibility >= 60
          ? 'Năng lực của bạn tương thích ở mức khá với nghề này.'
          : 'Một số năng lực cần cải thiện để phù hợp hơn với nghề này.'
    }`,
  })

  reasons.push({
    category: 'preference',
    weight: 0.1,
    score: scoreBreakdown.motivationFit,
    explanation: `Động lực và sở thích làm việc đạt ${scoreBreakdown.motivationFit}/100. ${
      scoreBreakdown.motivationFit >= 70
        ? 'Nghề này phù hợp với những gì bạn tìm kiếm trong sự nghiệp.'
        : 'Có một số điểm không khớp với sở thích làm việc của bạn.'
    }`,
  })

  reasons.push({
    category: 'learning',
    weight: 0.12,
    score: scoreBreakdown.learningPotential,
    explanation: `Tiềm năng học hỏi đạt ${scoreBreakdown.learningPotential}/100. ${
      scoreBreakdown.learningPotential >= 75
        ? 'Bạn có khả năng học tập và thích nghi tốt với nghề này.'
        : scoreBreakdown.learningPotential >= 60
          ? 'Bạn có thể học được nghề này với nỗ lực phù hợp.'
          : `Đường cong học tập có thể thách thức (learning curve: ${scoreBreakdown.career.learningCurve}/100).`
    }`,
  })

  reasons.push({
    category: 'market',
    weight: 0.09,
    score: scoreBreakdown.opportunity,
    explanation: `Cơ hội thị trường đạt ${scoreBreakdown.opportunity}/100. ${
      scoreBreakdown.opportunity >= 80
        ? 'Nhu cầu thị trường rất cao và cạnh tranh hợp lý.'
        : scoreBreakdown.opportunity >= 65
          ? 'Thị trường có cơ hội tốt nhưng cạnh tranh ở mức trung bình.'
          : 'Thị trường có cạnh tranh cao hoặc nhu cầu không quá mạnh.'
    }`,
  })

  return reasons.sort((a, b) => b.score - a.score || b.weight - a.weight)
}

const buildEvidenceTrace = (evidence: EvidenceScoreBreakdown): EvidenceTrace[] => {
  const traces: EvidenceTrace[] = []

  if (evidence.matchedEvidence.length > 0) {
    traces.push({
      evidenceType: 'domain',
      matched: evidence.matchedEvidence.slice(0, 5),
      impact: evidence.domainMatch,
      explanation: `Miền kinh nghiệm: ${evidence.domainMatch}/100. Khớp: ${evidence.matchedEvidence.slice(0, 3).join(', ')}.`,
    })
  }

  if (evidence.strengths.length > 0) {
    const skillEvidence = evidence.strengths.filter((s) => s.includes('Kỹ năng'))
    if (skillEvidence.length > 0) {
      traces.push({
        evidenceType: 'skill',
        matched: skillEvidence,
        impact: evidence.skillMatch,
        explanation: `Kỹ năng: ${evidence.skillMatch}/100. ${skillEvidence[0]}.`,
      })
    }

    const toolEvidence = evidence.strengths.filter((s) => s.includes('Công cụ'))
    if (toolEvidence.length > 0) {
      traces.push({
        evidenceType: 'tool',
        matched: toolEvidence,
        impact: evidence.toolMatch,
        explanation: `Công cụ: ${evidence.toolMatch}/100. ${toolEvidence[0]}.`,
      })
    }

    const expEvidence = evidence.strengths.filter((s) => s.includes('Kinh nghiệm') || s.includes('dự án'))
    if (expEvidence.length > 0) {
      traces.push({
        evidenceType: 'experience',
        matched: expEvidence,
        impact: evidence.experienceMatch,
        explanation: `Kinh nghiệm: ${evidence.experienceMatch}/100. ${expEvidence[0]}.`,
      })
    }
  }

  if (traces.length === 0) {
    traces.push({
      evidenceType: 'domain',
      matched: [],
      impact: evidence.evidenceFit,
      explanation: 'CV chưa có đủ bằng chứng trực tiếp. Cần bổ sung dự án, kết quả định lượng hoặc kinh nghiệm cụ thể.',
    })
  }

  return traces
}
