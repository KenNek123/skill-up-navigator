import type { HumanProfile, Career, ScoreBreakdown } from '../engine/types'

const clamp = (value: number, min = 0, max = 100): number => {
  return Math.max(min, Math.min(max, Math.round(value)))
}

export type EmployabilityBreakdown = {
  employability: number
  userFit: number
  skillReadiness: number
  marketDemand: number
  futureGrowth: number
  skillGap: number
  tierRating: 'A' | 'B' | 'C'
  entryLevelSuitable: boolean
}

const calculateUserFit = (score: ScoreBreakdown): number => {
  return clamp(
    score.compatibility * 0.4 +
      score.evidenceFit * 0.35 +
      score.motivationFit * 0.15 +
      score.confidence * 0.1
  )
}

const calculateSkillReadiness = (score: ScoreBreakdown): number => {
  return clamp(
    score.evidence.skillMatch * 0.4 +
      score.evidence.toolMatch * 0.25 +
      score.evidence.experienceMatch * 0.2 +
      score.learningPotential * 0.15
  )
}

const calculateMarketDemand = (career: Career): number => {
  const labor = career.intelligence?.laborMarket

  if (!labor) {
    return clamp(
      career.market.demand * 0.5 +
        (100 - career.market.competition) * 0.3 +
        career.market.growthOutlook * 0.2
    )
  }

  return clamp(
    labor.currentDemand * 0.35 +
      labor.talentShortage * 0.25 +
      labor.hiringTrends * 0.2 +
      labor.industryMomentum * 0.2
  )
}

const calculateFutureGrowth = (career: Career): number => {
  const labor = career.intelligence?.laborMarket
  const futureWork = career.intelligence?.futureOfWork

  const baseGrowth = clamp(
    career.longTermGrowth * 0.5 +
      career.market.growthOutlook * 0.3 +
      (100 - career.aiRisk.automationRisk) * 0.2
  )

  if (!labor || !futureWork) {
    return baseGrowth
  }

  return clamp(
    baseGrowth * 0.5 +
      labor.futureDemand * 0.25 +
      (100 - futureWork.automationRisk) * 0.15 +
      futureWork.aiImpact * 0.1
  )
}

const calculateSkillGap = (score: ScoreBreakdown): number => {
  const gapFactors = [
    score.evidence.domainMatch < 50 ? 20 : 0,
    score.evidence.skillMatch < 50 ? 25 : 0,
    score.evidence.toolMatch < 50 ? 15 : 0,
    score.evidence.experienceMatch < 40 ? 20 : 0,
    score.advanced.transitionDifficulty > 70 ? 15 : 0,
  ]

  const totalGap = gapFactors.reduce((sum, factor) => sum + factor, 0)
  return clamp(totalGap)
}

const determineCareerTier = (career: Career): 'A' | 'B' | 'C' => {
  const labor = career.intelligence?.laborMarket
  const demandScore = labor
    ? (labor.currentDemand + labor.futureDemand + labor.talentShortage) / 3
    : (career.market.demand + career.market.growthOutlook) / 2

  if (demandScore >= 75 && career.market.competition < 70) {
    return 'A'
  }

  if (demandScore >= 60 || (demandScore >= 50 && career.market.competition < 60)) {
    return 'B'
  }

  return 'C'
}

const isEntryLevelSuitable = (profile: HumanProfile, career: Career): boolean => {
  const experienceCount = profile.structuredEvidence.experience.length
  const seniorRoles = ['cto', 'principal', 'head of', 'director', 'chief', 'vp']
  const isSeniorRole = seniorRoles.some((keyword) =>
    career.title.toLowerCase().includes(keyword)
  )

  if (experienceCount === 0 && isSeniorRole) {
    return false
  }

  if (experienceCount < 2 && career.learningCurve > 80) {
    return false
  }

  const hasStrongEvidence =
    profile.structuredEvidence.projects.length > 2 ||
    profile.structuredEvidence.certifications.length > 1 ||
    profile.dimensions.technicalAffinity > 80

  if (isSeniorRole && !hasStrongEvidence) {
    return false
  }

  return true
}

export const calculateEmployability = (
  profile: HumanProfile,
  score: ScoreBreakdown
): EmployabilityBreakdown => {
  const userFit = calculateUserFit(score)
  const skillReadiness = calculateSkillReadiness(score)
  const marketDemand = calculateMarketDemand(score.career)
  const futureGrowth = calculateFutureGrowth(score.career)
  const skillGap = calculateSkillGap(score)

  const employabilityRaw =
    (userFit * 0.3 + skillReadiness * 0.25 + marketDemand * 0.25 + futureGrowth * 0.2) /
    (1 + skillGap * 0.008)

  const tierRating = determineCareerTier(score.career)
  const entryLevelSuitable = isEntryLevelSuitable(profile, score.career)

  const tierBonus = tierRating === 'A' ? 5 : tierRating === 'B' ? 2 : -3
  const entrySuitabilityPenalty = !entryLevelSuitable ? 10 : 0

  const employability = clamp(employabilityRaw + tierBonus - entrySuitabilityPenalty)

  return {
    employability,
    userFit,
    skillReadiness,
    marketDemand,
    futureGrowth,
    skillGap,
    tierRating,
    entryLevelSuitable,
  }
}
