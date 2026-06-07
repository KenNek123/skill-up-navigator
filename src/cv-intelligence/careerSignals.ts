import type { StructuredCvEvidence } from './schemas'

export type CareerSignals = {
  technicalDepth: number
  leadershipPotential: number
  communicationStrength: number
  businessExposure: number
  analyticalThinking: number
  creativeAbility: number
  learningAgility: number
  projectComplexity: number
  domainExpertise: number
  growthPotential: number
}

const clamp = (value: number, min = 0, max = 100): number => {
  return Math.max(min, Math.min(max, Math.round(value)))
}

const countEvidence = (evidence: StructuredCvEvidence): number => {
  return (
    evidence.education.length +
    evidence.experience.length +
    evidence.projects.length +
    evidence.tools.length +
    evidence.certifications.length +
    evidence.achievements.length +
    evidence.skills.technical.length +
    evidence.skills.business.length +
    evidence.skills.hard.length
  )
}

const hasTechnicalIndicators = (evidence: StructuredCvEvidence): boolean => {
  const technicalKeywords = [
    'engineer',
    'developer',
    'programmer',
    'architect',
    'technical',
    'software',
    'code',
    'coding',
  ]
  const allText = [
    ...evidence.experience.map((e) => e.role.toLowerCase()),
    ...evidence.projects.map((p) => p.description.toLowerCase()),
    ...evidence.industries.map((i) => i.toLowerCase()),
  ].join(' ')

  return technicalKeywords.some((keyword) => allText.includes(keyword))
}

const hasLeadershipIndicators = (evidence: StructuredCvEvidence): boolean => {
  const leadershipKeywords = [
    'lead',
    'manager',
    'head',
    'director',
    'chief',
    'owner',
    'team lead',
    'coordinator',
    'mentor',
  ]
  const allText = [
    ...evidence.experience.map((e) => e.role.toLowerCase()),
    ...evidence.achievements.map((a) => a.toLowerCase()),
  ].join(' ')

  return leadershipKeywords.some((keyword) => allText.includes(keyword))
}

const hasBusinessIndicators = (evidence: StructuredCvEvidence): boolean => {
  const businessDomains = [
    'business',
    'marketing',
    'sales',
    'finance',
    'operations',
    'product',
    'strategy',
    'consulting',
  ]
  return evidence.industries.some((industry) =>
    businessDomains.some((domain) => industry.toLowerCase().includes(domain))
  )
}

const hasCreativeIndicators = (evidence: StructuredCvEvidence): boolean => {
  const creativeKeywords = [
    'design',
    'creative',
    'content',
    'marketing',
    'brand',
    'ux',
    'ui',
    'visual',
  ]
  const allText = [
    ...evidence.experience.map((e) => e.role.toLowerCase()),
    ...evidence.skills.business.map((s) => s.toLowerCase()),
    ...evidence.tools.map((t) => t.toLowerCase()),
  ].join(' ')

  return creativeKeywords.some((keyword) => allText.includes(keyword))
}

export const computeCareerSignals = (evidence: StructuredCvEvidence): CareerSignals => {
  const totalEvidence = countEvidence(evidence)
  const evidenceRichness = Math.min(100, totalEvidence * 8)

  const technicalSkillCount = evidence.skills.technical.length
  const technicalToolCount = evidence.tools.length
  const hasTechRole = hasTechnicalIndicators(evidence)
  const technicalDepth = clamp(
    (technicalSkillCount * 8 + technicalToolCount * 6 + (hasTechRole ? 20 : 0)) * 1.2
  )

  const hasLeadRole = hasLeadershipIndicators(evidence)
  const experienceCount = evidence.experience.length
  const achievementCount = evidence.achievements.length
  const leadershipPotential = clamp(
    (hasLeadRole ? 30 : 0) + experienceCount * 8 + achievementCount * 6 + evidence.skills.soft.length * 4
  )

  const languageCount = evidence.languages.length
  const hasCommRole = evidence.skills.soft.some((s) =>
    ['communication', 'presentation', 'writing', 'public speaking'].some((keyword) =>
      s.toLowerCase().includes(keyword)
    )
  )
  const communicationStrength = clamp(
    languageCount * 12 + (hasCommRole ? 25 : 0) + evidence.skills.soft.length * 3
  )

  const hasBusinessRole = hasBusinessIndicators(evidence)
  const businessSkillCount = evidence.skills.business.length
  const businessExposure = clamp(
    (hasBusinessRole ? 30 : 0) + businessSkillCount * 8 + evidence.industries.length * 5
  )

  const hasDataSkills = evidence.skills.technical.some((s) =>
    ['sql', 'python', 'analysis', 'analytics', 'data', 'statistics'].some((keyword) =>
      s.toLowerCase().includes(keyword)
    )
  )
  const analyticalThinking = clamp(
    (hasDataSkills ? 25 : 0) + evidence.skills.technical.length * 4 + evidence.projects.length * 6
  )

  const hasCreativeRole = hasCreativeIndicators(evidence)
  const creativeAbility = clamp(
    (hasCreativeRole ? 30 : 0) + evidence.projects.length * 8 + evidence.interests.length * 5
  )

  const certificationCount = evidence.certifications.length
  const interestCount = evidence.interests.length
  const learningAgility = clamp(
    certificationCount * 10 + interestCount * 6 + (evidenceRichness > 60 ? 20 : 0)
  )

  const projectCount = evidence.projects.length
  const complexityIndicators = evidence.projects.filter(
    (p) => p.tools.length > 2 || p.description.length > 80
  ).length
  const projectComplexity = clamp(projectCount * 10 + complexityIndicators * 8)

  const industryCount = evidence.industries.length
  const experienceYears = evidence.experience.length
  const domainExpertise = clamp(
    industryCount * 10 + experienceYears * 8 + (industryCount > 0 && experienceYears > 2 ? 15 : 0)
  )

  const growthPotential = clamp(
    (learningAgility * 0.3 +
      evidenceRichness * 0.25 +
      projectComplexity * 0.2 +
      analyticalThinking * 0.15 +
      technicalDepth * 0.1) *
      1.1
  )

  return {
    technicalDepth,
    leadershipPotential,
    communicationStrength,
    businessExposure,
    analyticalThinking,
    creativeAbility,
    learningAgility,
    projectComplexity,
    domainExpertise,
    growthPotential,
  }
}
