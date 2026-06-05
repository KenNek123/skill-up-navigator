import type {
  AdvancedScoreBreakdown,
  Career,
  CareerPreference,
  DimensionKey,
  EvidenceScoreBreakdown,
  HumanProfile,
  ScoreBreakdown,
  StructuredCvEvidence,
  WorkStyle,
} from './types'
import { dimensionLabels } from '../data/careers'

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

const average = (values: number[]) =>
  values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length

const weightedAverage = (items: Array<[number, number]>) => {
  const totalWeight = items.reduce((sum, [, weight]) => sum + weight, 0)
  if (totalWeight === 0) return 0
  return items.reduce((sum, [value, weight]) => sum + value * weight, 0) / totalWeight
}

const weightSimilarity = (userScore: number, requiredScore: number) =>
  Math.max(0, 100 - Math.abs(requiredScore - userScore))

const getDnaEntries = (career: Career) =>
  Object.entries(career.dna) as Array<[DimensionKey, number]>

const normalizeTextCache = new Map<string, string>()

const normalizeText = (value: string) => {
  const cached = normalizeTextCache.get(value)
  if (cached !== undefined) return cached

  const normalized = value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, ' ')
    .trim()
  normalizeTextCache.set(value, normalized)
  return normalized
}

const unique = <T,>(items: T[]) => Array.from(new Set(items))

const compact = (items: Array<string | undefined | null>) =>
  unique(
    items
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .map((item) => item.trim()),
  )

type CareerEvidenceProfile = {
  domains: string[]
  jobFamilies: string[]
  requiredSkills: string[]
  preferredSkills: string[]
  tools: string[]
  educationKeywords: string[]
  experienceKeywords: string[]
}

type FlattenedProfileEvidence = ReturnType<typeof flattenProfileEvidence>

const careerEvidenceCache = new WeakMap<Career, CareerEvidenceProfile>()

const overlapItems = (userItems: string[], targetItems: string[]) => {
  const normalizedUserItems = userItems.map((item) => ({
    original: item,
    normalized: normalizeText(item),
  }))

  return unique(
    targetItems.filter((target) => {
      const normalizedTarget = normalizeText(target)
      return normalizedUserItems.some(
        (item) =>
          item.normalized.includes(normalizedTarget) ||
          normalizedTarget.includes(item.normalized),
      )
    }),
  )
}

const ratioScore = (matches: number, expectedCount: number, fallback = 45) => {
  if (expectedCount === 0) return fallback
  return clamp((matches / expectedCount) * 100)
}

const getCareerEvidenceProfile = (career: Career): CareerEvidenceProfile => {
  const cached = careerEvidenceCache.get(career)
  if (cached) return cached

  const graph = career.intelligence?.graph
  const intelligenceSkills = career.intelligence?.skills.map((skill) => skill.name) ?? []
  const education = career.intelligence?.education

  const profile = {
    domains: compact([
      ...(career.evidenceProfile?.domains ?? []),
      career.category,
      career.title,
      career.titleVi,
      ...(graph?.careerClusters ?? []),
      ...(graph?.industryFamilies ?? []),
    ]),
    jobFamilies: compact([
      ...(career.evidenceProfile?.jobFamilies ?? []),
      career.title,
      career.titleVi,
      ...(graph?.parentCareers ?? []),
      ...(graph?.generalizations ?? []),
    ]),
    requiredSkills: compact([
      ...(career.evidenceProfile?.requiredSkills ?? []),
      ...career.starterSkills,
      ...intelligenceSkills.slice(0, 4),
    ]),
    preferredSkills: compact([
      ...(career.evidenceProfile?.preferredSkills ?? []),
      ...intelligenceSkills,
      ...(graph?.skillOverlaps ?? []),
    ]),
    tools: compact(career.evidenceProfile?.tools ?? []),
    educationKeywords: compact([
      ...(career.evidenceProfile?.educationKeywords ?? []),
      ...(education?.degrees ?? []),
      ...(education?.certifications ?? []),
    ]),
    experienceKeywords: compact([
      ...(career.evidenceProfile?.experienceKeywords ?? []),
      career.title,
      career.category,
      ...(graph?.transitionCareers ?? []),
      ...(graph?.adjacentCareers ?? []),
    ]),
  }

  careerEvidenceCache.set(career, profile)
  return profile
}

const flattenProfileEvidence = (evidence: StructuredCvEvidence) => {
  const educationText = evidence.education.flatMap((item) => [
    item.degree,
    item.major,
    item.institution,
    item.graduationYear,
  ])
  const experienceText = evidence.experience.flatMap((item) => [
    item.company,
    item.role,
    item.duration,
    item.industry,
  ])
  const projectText = evidence.projects.flatMap((item) => [
    item.name,
    item.description,
    item.industry,
    ...item.tools,
  ])
  const skills = [
    ...evidence.skills.hard,
    ...evidence.skills.soft,
    ...evidence.skills.technical,
    ...evidence.skills.business,
  ]

  return {
    domains: compact([
      ...evidence.industries,
      ...evidence.interests,
      ...evidence.experience.map((item) => item.industry),
      ...evidence.projects.map((item) => item.industry),
    ]),
    skills: compact(skills),
    tools: compact([...evidence.tools, ...evidence.projects.flatMap((item) => item.tools)]),
    education: compact(educationText),
    experience: compact([...experienceText, ...projectText, ...evidence.achievements]),
    interests: compact([...evidence.interests, ...evidence.achievements]),
    all: compact([
      ...educationText,
      ...experienceText,
      ...projectText,
      ...skills,
      ...evidence.tools,
      ...evidence.certifications,
      ...evidence.languages,
      ...evidence.industries,
      ...evidence.interests,
      ...evidence.achievements,
    ]),
  }
}

const humanReadableMatches = (
  label: string,
  matches: string[],
  fallback: string | null = null,
) => {
  if (matches.length > 0) return [`${label}: ${matches.slice(0, 4).join(', ')}`]
  return fallback ? [fallback] : []
}

export const scoreEvidenceFit = (
  profile: HumanProfile,
  career: Career,
  profileEvidence: FlattenedProfileEvidence = flattenProfileEvidence(profile.structuredEvidence),
): EvidenceScoreBreakdown => {
  const careerEvidence = getCareerEvidenceProfile(career)
  const domainMatches = overlapItems(profileEvidence.domains, careerEvidence.domains)
  const requiredSkillMatches = overlapItems(profileEvidence.skills, careerEvidence.requiredSkills)
  const preferredSkillMatches = overlapItems(profileEvidence.skills, careerEvidence.preferredSkills)
  const toolMatches = overlapItems(profileEvidence.tools, careerEvidence.tools)
  const educationMatches = overlapItems(profileEvidence.education, careerEvidence.educationKeywords)
  const experienceMatches = overlapItems(profileEvidence.experience, careerEvidence.experienceKeywords)
  const interestMatches = overlapItems(profileEvidence.interests, careerEvidence.domains)
  const allEvidenceMatches = overlapItems(profileEvidence.all, [
    ...careerEvidence.domains,
    ...careerEvidence.jobFamilies,
    ...careerEvidence.requiredSkills,
    ...careerEvidence.preferredSkills,
    ...careerEvidence.tools,
  ])

  const requiredSkillBase = Math.min(6, Math.max(3, careerEvidence.requiredSkills.length))
  const preferredSkillBase = Math.min(6, Math.max(3, careerEvidence.preferredSkills.length))
  const skillMatch = clamp(
    ratioScore(requiredSkillMatches.length, requiredSkillBase, 42) * 0.68 +
      ratioScore(preferredSkillMatches.length, preferredSkillBase, 48) * 0.32,
  )
  const domainMatch = ratioScore(domainMatches.length, Math.min(4, Math.max(2, careerEvidence.domains.length)), 38)
  const experienceMatch = ratioScore(
    experienceMatches.length,
    Math.min(4, Math.max(2, careerEvidence.experienceKeywords.length)),
    42,
  )
  const educationMatch = ratioScore(
    educationMatches.length,
    Math.min(4, Math.max(2, careerEvidence.educationKeywords.length)),
    52,
  )
  const toolMatch =
    careerEvidence.tools.length === 0
      ? 55
      : ratioScore(toolMatches.length, Math.min(4, Math.max(2, careerEvidence.tools.length)), 45)
  const interestMatch = ratioScore(interestMatches.length, Math.min(3, Math.max(1, careerEvidence.domains.length)), 45)

  const mismatchPenalty = clamp(
    (domainMatch < 34 ? 20 : 0) +
      (skillMatch < 32 ? 16 : 0) +
      (experienceMatch < 28 ? 10 : 0) +
      (career.category.includes('AI') && domainMatch < 45 && skillMatch < 45 ? 18 : 0) +
      (career.category.includes('Technology') && profile.dimensions.technicalAffinity < 55 && skillMatch < 45 ? 12 : 0),
  )

  const evidenceFit = clamp(
    weightedAverage([
      [domainMatch, 0.28],
      [skillMatch, 0.24],
      [experienceMatch, 0.17],
      [educationMatch, 0.08],
      [toolMatch, 0.1],
      [interestMatch, 0.08],
      [Math.min(100, allEvidenceMatches.length * 12), 0.05],
    ]) - mismatchPenalty,
  )

  const confidence = clamp(
    evidenceFit * 0.58 +
      Math.min(100, profileEvidence.all.length * 5) * 0.16 +
      (domainMatches.length > 0 ? 10 : 0) +
      (requiredSkillMatches.length > 0 ? 8 : 0) +
      (experienceMatches.length > 0 ? 6 : 0),
  )

  const strengths = unique([
    ...humanReadableMatches('Ngành/miền kinh nghiệm', domainMatches),
    ...humanReadableMatches('Kỹ năng đã có', unique([...requiredSkillMatches, ...preferredSkillMatches])),
    ...humanReadableMatches('Công cụ', toolMatches),
    ...humanReadableMatches('Kinh nghiệm/dự án', experienceMatches),
  ]).slice(0, 5)

  const gaps = compact([
    domainMatch < 55 ? `Cần thêm bằng chứng trực tiếp về miền ${careerEvidence.domains.slice(0, 2).join(', ')}` : null,
    skillMatch < 60 ? `Cần bổ sung ${careerEvidence.requiredSkills.slice(0, 3).join(', ')}` : null,
    toolMatch < 55 && careerEvidence.tools.length > 0 ? `Nên làm quen ${careerEvidence.tools.slice(0, 3).join(', ')}` : null,
    experienceMatch < 45 ? 'Cần một case study, thực tập hoặc dự án gần với vai trò này' : null,
  ]).slice(0, 4)

  return {
    domainMatch,
    skillMatch,
    experienceMatch,
    educationMatch,
    toolMatch,
    interestMatch,
    evidenceFit,
    mismatchPenalty,
    confidence,
    matchedEvidence: allEvidenceMatches.slice(0, 8),
    strengths: strengths.length > 0 ? strengths : ['Có một số tín hiệu năng lực chung, nhưng CV cần thêm bằng chứng cụ thể'],
    gaps: gaps.length > 0 ? gaps : ['Khoảng cách chính là chứng minh năng lực bằng dự án hoặc kết quả định lượng'],
  }
}

export const scoreCompatibility = (profile: HumanProfile, career: Career) => {
  const entries = getDnaEntries(career)
  const weightedTotal = entries.reduce((sum, [dimension, required]) => {
    const weight = required / 100
    return sum + weightSimilarity(profile.dimensions[dimension], required) * weight
  }, 0)
  const totalWeight = entries.reduce((sum, [, required]) => sum + required / 100, 0)

  return totalWeight === 0 ? 0 : clamp(weightedTotal / totalWeight)
}

const workStyleFit = (selected: WorkStyle[], target: WorkStyle[]) => {
  if (target.length === 0) return 50
  const overlap = selected.filter((style) => target.includes(style)).length
  return clamp((overlap / target.length) * 100)
}

const preferenceSimilarity = (left: number, right: number) =>
  Math.max(0, 100 - Math.abs(left - right))

export const scoreMotivationFit = (preferences: CareerPreference, career: Career) => {
  const careerProfile = {
    remote: career.market.globalMobility,
    stability: 100 - career.market.competition + career.aiRisk.humanJudgmentNeed / 4,
    growth: career.longTermGrowth,
    socialImpact:
      career.category.includes('Human') ||
      career.category.includes('Security') ||
      career.category.includes('Healthcare') ||
      career.category.includes('Education') ||
      career.category.includes('Climate') ||
      career.category.includes('Non-Profit')
        ? 80
        : 58,
    income: career.market.salaryPotential,
    autonomy:
      career.workStyles.includes('builder') || career.workStyles.includes('ambiguous') ? 82 : 64,
  }

  const numericFit = average([
    preferenceSimilarity(preferences.remote, careerProfile.remote),
    preferenceSimilarity(preferences.stability, careerProfile.stability),
    preferenceSimilarity(preferences.growth, careerProfile.growth),
    preferenceSimilarity(preferences.socialImpact, careerProfile.socialImpact),
    preferenceSimilarity(preferences.income, careerProfile.income),
    preferenceSimilarity(preferences.autonomy, careerProfile.autonomy),
  ])

  return clamp(numericFit * 0.72 + workStyleFit(preferences.workStyles, career.workStyles) * 0.28)
}

export const scoreLearningPotential = (
  profile: HumanProfile,
  career: Career,
  evidence?: EvidenceScoreBreakdown,
) => {
  const readiness = average([
    profile.dimensions.learningAgility,
    profile.dimensions.motivation,
    profile.dimensions.adaptability,
    profile.dimensions.technicalAffinity,
  ])
  const routeHelp = evidence ? evidence.educationMatch * 0.08 + evidence.skillMatch * 0.12 : 0
  const curvePenalty = career.learningCurve * 0.32

  return clamp(readiness * 0.78 + (100 - curvePenalty) * 0.12 + routeHelp)
}

export const scoreOpportunity = (career: Career) => {
  const { demand, competition, growthOutlook, salaryPotential, globalMobility } = career.market
  const classicOpportunity =
    demand * 0.28 +
    (100 - competition) * 0.18 +
    growthOutlook * 0.28 +
    salaryPotential * 0.14 +
    globalMobility * 0.12
  const labor = career.intelligence?.laborMarket

  if (!labor) return clamp(classicOpportunity)

  return clamp(
    classicOpportunity * 0.68 +
      average([
        labor.currentDemand,
        labor.futureDemand,
        labor.talentShortage,
        labor.industryMomentum,
        labor.hiringTrends,
        labor.remoteOpportunities,
        labor.internationalOpportunities,
      ]) *
        0.32,
  )
}

export const scoreAiResilience = (career: Career) => {
  const { exposure, automationRisk, augmentationPotential, humanJudgmentNeed } = career.aiRisk
  const future = career.intelligence?.futureOfWork
  const classicResilience =
    (100 - automationRisk) * 0.36 +
    augmentationPotential * 0.28 +
    humanJudgmentNeed * 0.28 +
    (100 - exposure) * 0.08

  if (!future) return clamp(classicResilience)

  return clamp(
    classicResilience * 0.72 +
      (100 - future.automationRisk) * 0.12 +
      (100 - future.industryDisruption * 0.35) * 0.04 +
      future.aiImpact * 0.05 +
      future.futureSkills.length * 1.4,
  )
}

export const scoreFutureProjection = (career: Career) =>
  clamp(
    career.longTermGrowth * 0.42 +
      scoreOpportunity(career) * 0.34 +
      scoreAiResilience(career) * 0.24,
  )

const scoreSkillDemand = (career: Career) =>
  career.intelligence?.skills
    ? clamp(average(career.intelligence.skills.map((skill) => skill.demand)))
    : scoreOpportunity(career)

const scoreSkillFutureRelevance = (career: Career) =>
  career.intelligence?.skills
    ? clamp(average(career.intelligence.skills.map((skill) => skill.futureRelevance)))
    : career.longTermGrowth

const scoreSkillDifficulty = (career: Career) =>
  career.intelligence?.skills
    ? clamp(average(career.intelligence.skills.map((skill) => skill.difficulty)))
    : career.learningCurve

const graphBreadth = (career: Career) => {
  const graph = career.intelligence?.graph
  if (!graph) return 55

  const connectionCount =
    graph.adjacentCareers.length +
    graph.alternativeCareers.length +
    graph.transitionCareers.length +
    graph.upgradePaths.length +
    graph.pivotPaths.length +
    graph.specializations.length +
    graph.migrationPaths.length

  return clamp(connectionCount * 5)
}

const learningRouteQuality = (career: Career) => {
  const education = career.intelligence?.education
  if (!education) return 58

  return clamp(
    education.learningPriorities.length * 8 +
      education.fastestRoutes.length * 9 +
      education.costEfficientRoutes.length * 8 +
      education.effectiveRoutes.length * 10 +
      education.certifications.length * 4 +
      education.learningSequences.length * 3,
  )
}

const regionalOpportunityScore = (career: Career) => {
  const regional = career.intelligence?.laborMarket.regionalOpportunities
  if (!regional) return career.market.globalMobility

  return clamp(average(Object.values(regional).filter((value): value is number => typeof value === 'number')))
}

const scoreMeaningFit = (profile: HumanProfile, career: Career) => {
  const impactSignal =
    career.category.includes('Healthcare') ||
    career.category.includes('Education') ||
    career.category.includes('Climate') ||
    career.category.includes('Government') ||
    career.category.includes('Non-Profit')
      ? 88
      : career.category.includes('Security') || career.category.includes('Research')
        ? 78
        : 62

  return clamp(
    preferenceSimilarity(profile.preferences.socialImpact, impactSignal) * 0.62 +
      profile.dimensions.motivation * 0.22 +
      career.aiRisk.humanJudgmentNeed * 0.16,
  )
}

const scoreSatisfaction = (
  profile: HumanProfile,
  career: Career,
  compatibility: number,
  motivationFit: number,
) => {
  const workStyleScore = workStyleFit(profile.preferences.workStyles, career.workStyles)
  const autonomyFit = preferenceSimilarity(
    profile.preferences.autonomy,
    career.workStyles.includes('ambiguous') || career.workStyles.includes('builder') ? 82 : 62,
  )

  return clamp(
    compatibility * 0.32 +
      motivationFit * 0.32 +
      workStyleScore * 0.2 +
      autonomyFit * 0.1 +
      profile.dimensions.motivation * 0.06,
  )
}

const scoreBurnoutRisk = (
  profile: HumanProfile,
  career: Career,
  compatibility: number,
  evidence?: EvidenceScoreBreakdown,
) => {
  const ambiguityLoad = career.workStyles.includes('ambiguous') ? 14 : 0
  const learningPressure = Math.max(0, career.learningCurve - profile.dimensions.learningAgility) * 0.55
  const mismatchPressure = Math.max(0, 72 - compatibility) * 0.26 + Math.max(0, 64 - (evidence?.evidenceFit ?? 64)) * 0.28
  const riskLoad = Math.max(0, career.aiRisk.exposure - profile.dimensions.adaptability) * 0.2
  const resilience = average([
    profile.dimensions.adaptability,
    profile.dimensions.motivation,
    profile.dimensions.decisionMaking,
  ])

  return clamp(42 + ambiguityLoad + learningPressure + mismatchPressure + riskLoad - resilience * 0.24)
}

const scoreTransitionDifficulty = (
  profile: HumanProfile,
  career: Career,
  compatibility: number,
  evidence?: EvidenceScoreBreakdown,
) => {
  const learningGap = Math.max(0, career.learningCurve - profile.dimensions.learningAgility)
  const technicalRequirement = career.dna.technicalAffinity ?? 55
  const technicalGap =
    technicalRequirement > profile.dimensions.technicalAffinity
      ? technicalRequirement - profile.dimensions.technicalAffinity
      : 0
  const evidenceGap = Math.max(0, 62 - (evidence?.evidenceFit ?? 62)) * 0.36
  const graphHelp = graphBreadth(career) * 0.16
  const routeHelp = learningRouteQuality(career) * 0.14

  return clamp(
    100 - compatibility * 0.34 + learningGap * 0.36 + technicalGap * 0.22 + evidenceGap - graphHelp - routeHelp,
  )
}

const scoreAdvanced = (
  profile: HumanProfile,
  career: Career,
  compatibility: number,
  evidence: EvidenceScoreBreakdown,
  motivationFit: number,
  learningPotential: number,
  opportunity: number,
  aiResilience: number,
  futureProjection: number,
): AdvancedScoreBreakdown => {
  const labor = career.intelligence?.laborMarket
  const marketMomentum = labor
    ? clamp(
        average([
          labor.currentDemand,
          labor.futureDemand,
          labor.growthRate,
          labor.industryMomentum,
          labor.hiringTrends,
        ]),
      )
    : opportunity
  const skillDemand = scoreSkillDemand(career)
  const skillFutureRelevance = scoreSkillFutureRelevance(career)
  const skillDifficulty = scoreSkillDifficulty(career)
  const routeQuality = learningRouteQuality(career)
  const graphScore = graphBreadth(career)
  const regionalScore = regionalOpportunityScore(career)
  const satisfaction = scoreSatisfaction(profile, career, compatibility, motivationFit)
  const burnoutRisk = scoreBurnoutRisk(profile, career, compatibility, evidence)
  const transitionDifficulty = scoreTransitionDifficulty(profile, career, compatibility, evidence)
  const meaningAndPurpose = scoreMeaningFit(profile, career)
  const entrepreneurialOpportunity = labor
    ? clamp(
        average([
          labor.startupOpportunities,
          labor.freelanceOpportunities,
          labor.contractOpportunities,
          career.market.globalMobility,
          profile.dimensions.riskTolerance,
        ]),
      )
    : clamp((career.market.globalMobility + profile.dimensions.riskTolerance + career.longTermGrowth) / 3)

  const careerStability = labor
    ? clamp(
        labor.currentDemand * 0.3 +
          labor.futureDemand * 0.28 +
          (100 - labor.talentSurplus) * 0.2 +
          career.aiRisk.humanJudgmentNeed * 0.22,
      )
    : clamp((opportunity + aiResilience + (100 - career.market.competition)) / 3)

  const automationResistance = clamp(100 - career.aiRisk.automationRisk)
  const aiDisruptionResistance = clamp(aiResilience * 0.72 + skillFutureRelevance * 0.28)
  const globalCompetitiveness = clamp(
    regionalScore * 0.26 +
      career.market.globalMobility * 0.18 +
      skillDemand * 0.18 +
      evidence.evidenceFit * 0.18 +
      profile.dimensions.communication * 0.1 +
      profile.dimensions.learningAgility * 0.1,
  )
  const growthPotential = clamp(
    career.longTermGrowth * 0.34 +
      marketMomentum * 0.26 +
      skillFutureRelevance * 0.16 +
      routeQuality * 0.1 +
      evidence.skillMatch * 0.14,
  )
  const careerLongevity = clamp(
    futureProjection * 0.28 +
      aiDisruptionResistance * 0.24 +
      careerStability * 0.18 +
      graphScore * 0.14 +
      evidence.domainMatch * 0.16,
  )
  const careerResilience = clamp(
    aiResilience * 0.28 +
      careerStability * 0.2 +
      graphScore * 0.12 +
      profile.dimensions.adaptability * 0.12 +
      skillFutureRelevance * 0.1 +
      evidence.evidenceFit * 0.18,
  )
  const learningCurveFit = clamp(
    learningPotential * 0.48 +
      (100 - transitionDifficulty) * 0.16 +
      routeQuality * 0.12 +
      (100 - skillDifficulty) * 0.08 +
      evidence.skillMatch * 0.16,
  )
  const adaptabilityFit = clamp(
    profile.dimensions.adaptability * 0.32 +
      profile.dimensions.learningAgility * 0.24 +
      graphScore * 0.14 +
      career.aiRisk.augmentationPotential * 0.14 +
      evidence.interestMatch * 0.16,
  )
  const futureSuccess = clamp(
    weightedAverage([
      [evidence.evidenceFit, 0.24],
      [compatibility, 0.18],
      [learningCurveFit, 0.16],
      [growthPotential, 0.15],
      [careerResilience, 0.13],
      [satisfaction, 0.08],
      [globalCompetitiveness, 0.06],
    ]),
  )
  const potential = clamp(
    weightedAverage([
      [futureSuccess, 0.26],
      [evidence.confidence, 0.2],
      [learningPotential, 0.18],
      [motivationFit, 0.14],
      [adaptabilityFit, 0.12],
      [profile.dimensions.motivation, 0.1],
    ]),
  )

  return {
    potential,
    futureSuccess,
    learningCurveFit,
    adaptabilityFit,
    careerLongevity,
    careerResilience,
    careerSatisfaction: satisfaction,
    burnoutRisk,
    marketOpportunity: marketMomentum,
    growthPotential,
    globalCompetitiveness,
    entrepreneurialOpportunity,
    futureProof: clamp(
      futureProjection * 0.28 +
        aiDisruptionResistance * 0.24 +
        skillFutureRelevance * 0.18 +
        careerLongevity * 0.14 +
        evidence.skillMatch * 0.16,
    ),
    automationResistance,
    aiDisruptionResistance,
    careerStability,
    transitionDifficulty,
    promotionPotential: clamp(
      profile.dimensions.leadership * 0.16 +
        profile.dimensions.communication * 0.14 +
        growthPotential * 0.22 +
        graphScore * 0.14 +
        career.market.salaryPotential * 0.2 +
        evidence.experienceMatch * 0.14,
    ),
    incomeGrowthPotential: clamp(
      career.market.salaryPotential * 0.34 +
        growthPotential * 0.22 +
        globalCompetitiveness * 0.18 +
        skillDemand * 0.12 +
        evidence.skillMatch * 0.14,
    ),
    personalFulfillment: clamp(
      satisfaction * 0.38 +
        meaningAndPurpose * 0.2 +
        evidence.interestMatch * 0.14 +
        preferenceSimilarity(profile.preferences.income, career.market.salaryPotential) * 0.1 +
        preferenceSimilarity(profile.preferences.remote, career.market.globalMobility) * 0.08 +
        (100 - burnoutRisk) * 0.1,
    ),
    meaningAndPurpose,
  }
}

const topDimensions = (profile: HumanProfile, career: Career, mode: 'strengths' | 'gaps') => {
  const ranked = getDnaEntries(career)
    .map(([dimension, required]) => ({
      dimension,
      delta: profile.dimensions[dimension] - required,
      required,
    }))
    .sort((a, b) =>
      mode === 'strengths'
        ? b.delta - a.delta || b.required - a.required
        : a.delta - b.delta || b.required - a.required,
    )

  return ranked.slice(0, 3).map((item) => item.dimension)
}

const buildExplanation = (
  profile: HumanProfile,
  career: Career,
  compatibility: number,
  evidence: EvidenceScoreBreakdown,
  opportunity: number,
  aiResilience: number,
  futureProjection: number,
  advanced: AdvancedScoreBreakdown,
) => {
  const strengths = topDimensions(profile, career, 'strengths')
  const dnaText = strengths
    .map((dimension) => `${dimensionLabels[dimension].vi}: ${profile.dimensions[dimension]}`)
    .join(', ')
  const learningPriorities = career.intelligence?.education.learningPriorities.slice(0, 3).join(', ')

  return [
    `Vì sao phù hợp: điểm bằng chứng đạt ${evidence.evidenceFit}/100, gồm domain ${evidence.domainMatch}, kỹ năng ${evidence.skillMatch}, kinh nghiệm ${evidence.experienceMatch}, công cụ ${evidence.toolMatch}.`,
    `Bằng chứng từ CV: ${evidence.matchedEvidence.length > 0 ? evidence.matchedEvidence.slice(0, 5).join(', ') : 'CV chưa cung cấp đủ tín hiệu trực tiếp; cần bổ sung dự án hoặc kết quả định lượng.'}`,
    `Điểm mạnh: ${evidence.strengths.slice(0, 3).join('; ')}. Mã năng lực nghề đạt ${compatibility}/100 với ${dnaText}.`,
    `Khoảng cách: ${evidence.gaps.slice(0, 3).join('; ')}${learningPriorities ? `. Nên ưu tiên học ${learningPriorities}` : ''}.`,
    `Độ tin cậy ${evidence.confidence}/100. Cơ hội thị trường ${opportunity}/100, an toàn trước AI ${aiResilience}/100, triển vọng dài hạn ${futureProjection}/100, transition difficulty ${advanced.transitionDifficulty}/100.`,
  ]
}

export const scoreCareer = (
  profile: HumanProfile,
  career: Career,
  profileEvidence: FlattenedProfileEvidence = flattenProfileEvidence(profile.structuredEvidence),
): ScoreBreakdown => {
  const compatibility = scoreCompatibility(profile, career)
  const evidence = scoreEvidenceFit(profile, career, profileEvidence)
  const motivationFit = scoreMotivationFit(profile.preferences, career)
  const learningPotential = scoreLearningPotential(profile, career, evidence)
  const opportunity = scoreOpportunity(career)
  const aiResilience = scoreAiResilience(career)
  const futureProjection = scoreFutureProjection(career)
  const advanced = scoreAdvanced(
    profile,
    career,
    compatibility,
    evidence,
    motivationFit,
    learningPotential,
    opportunity,
    aiResilience,
    futureProjection,
  )

  const overall = clamp(
    evidence.evidenceFit * 0.3 +
      compatibility * 0.2 +
      motivationFit * 0.1 +
      learningPotential * 0.12 +
      opportunity * 0.09 +
      aiResilience * 0.06 +
      futureProjection * 0.05 +
      advanced.futureSuccess * 0.05 +
      (100 - advanced.burnoutRisk) * 0.03 -
      evidence.mismatchPenalty * 0.12,
  )

  return {
    career,
    compatibility,
    evidenceFit: evidence.evidenceFit,
    motivationFit,
    learningPotential,
    opportunity,
    aiResilience,
    futureProjection,
    overall,
    confidence: evidence.confidence,
    strengths: topDimensions(profile, career, 'strengths'),
    gaps: topDimensions(profile, career, 'gaps'),
    explanation: buildExplanation(
      profile,
      career,
      compatibility,
      evidence,
      opportunity,
      aiResilience,
      futureProjection,
      advanced,
    ),
    evidence,
    advanced,
  }
}

export const rankCareers = (profile: HumanProfile, careerList: Career[]) => {
  const profileEvidence = flattenProfileEvidence(profile.structuredEvidence)

  return careerList
    .map((career) => scoreCareer(profile, career, profileEvidence))
    .sort(
      (left, right) =>
        right.overall - left.overall ||
        right.evidenceFit - left.evidenceFit ||
        right.confidence - left.confidence ||
        right.advanced.futureSuccess - left.advanced.futureSuccess ||
        left.career.title.localeCompare(right.career.title),
    )
}
