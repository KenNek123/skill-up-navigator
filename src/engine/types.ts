export type DimensionKey =
  | 'logic'
  | 'analyticalThinking'
  | 'communication'
  | 'leadership'
  | 'adaptability'
  | 'creativity'
  | 'technicalAffinity'
  | 'collaboration'
  | 'learningAgility'
  | 'decisionMaking'
  | 'riskTolerance'
  | 'motivation'

export type DimensionScores = Record<DimensionKey, number>

export type WorkStyle =
  | 'structured'
  | 'ambiguous'
  | 'peopleFirst'
  | 'deepWork'
  | 'builder'
  | 'advisor'

export type CareerPreference = {
  remote: number
  stability: number
  growth: number
  socialImpact: number
  income: number
  autonomy: number
  workStyles: WorkStyle[]
}

export type EducationEntry = {
  degree: string
  major: string
  institution: string
  graduationYear?: string
}

export type ExperienceEntry = {
  company: string
  role: string
  duration: string
  industry: string
}

export type ProjectEntry = {
  name: string
  description: string
  tools: string[]
  industry: string
}

export type SkillEvidence = {
  hard: string[]
  soft: string[]
  technical: string[]
  business: string[]
}

export type StructuredCvEvidence = {
  education: EducationEntry[]
  experience: ExperienceEntry[]
  skills: SkillEvidence
  tools: string[]
  certifications: string[]
  languages: string[]
  projects: ProjectEntry[]
  industries: string[]
  interests: string[]
  achievements: string[]
}

export type HumanProfile = {
  name: string
  headline: string
  dimensions: DimensionScores
  preferences: CareerPreference
  evidence: string[]
  structuredEvidence: StructuredCvEvidence
}

export type MarketSignal = {
  demand: number
  competition: number
  growthOutlook: number
  salaryPotential: number
  globalMobility: number
}

export type AiRisk = {
  exposure: number
  automationRisk: number
  augmentationPotential: number
  humanJudgmentNeed: number
}

export type RegionKey =
  | 'vietnam'
  | 'asean'
  | 'asiaPacific'
  | 'europe'
  | 'northAmerica'
  | 'middleEast'
  | 'australia'
  | 'globalRemote'

export type SkillCategory =
  | 'hard'
  | 'soft'
  | 'technical'
  | 'transferable'
  | 'future'
  | 'industry'
  | 'leadership'
  | 'business'
  | 'digital'
  | 'ai'
  | 'communication'
  | 'research'
  | 'management'
  | 'creative'
  | 'criticalThinking'

export type SkillIntelligence = {
  name: string
  category: SkillCategory
  difficulty: number
  importance: number
  demand: number
  learningTimeWeeks: number
  careerImpact: number
  futureRelevance: number
}

export type LaborMarketIntelligence = {
  currentDemand: number
  futureDemand: number
  talentShortage: number
  talentSurplus: number
  growthRate: number
  industryMomentum: number
  hiringTrends: number
  globalOpportunities: number
  regionalOpportunities: Partial<Record<RegionKey, number>>
  remoteOpportunities: number
  freelanceOpportunities: number
  contractOpportunities: number
  startupOpportunities: number
  corporateOpportunities: number
  governmentOpportunities: number
  internationalOpportunities: number
}

export type EducationIntelligence = {
  degrees: string[]
  alternativeDegrees: string[]
  bootcamps: string[]
  onlineCourses: string[]
  selfTaughtPaths: string[]
  certifications: string[]
  microCredentials: string[]
  professionalLicenses: string[]
  industryQualifications: string[]
  learningTracks: string[]
  learningSequences: string[]
  learningPriorities: string[]
  fastestRoutes: string[]
  costEfficientRoutes: string[]
  effectiveRoutes: string[]
}

export type CareerRoadmap = {
  thirtyDays: string[]
  sixtyDays: string[]
  ninetyDays: string[]
  sixMonths: string[]
  oneYear: string[]
  threeYears: string[]
  fiveYears: string[]
  tenYears: string[]
}

export type CareerSimulation = {
  typicalDay: string[]
  typicalWeek: string[]
  typicalMonth: string[]
  typicalChallenges: string[]
  successMetrics: string[]
  workEnvironment: string[]
  teamStructures: string[]
  meetings: string[]
  responsibilities: string[]
  careerProgression: string[]
}

export type FutureOfWorkIntelligence = {
  aiImpact: number
  automationRisk: number
  industryDisruption: number
  technologyTrends: string[]
  emergingRoles: string[]
  decliningRoles: string[]
  futureOpportunities: string[]
  futureSkills: string[]
  futureCertifications: string[]
  futureIndustries: string[]
  futureMarkets: string[]
  futureBusinessModels: string[]
}

export type EntrepreneurshipIntelligence = {
  startupPaths: string[]
  freelancingPaths: string[]
  agencyPaths: string[]
  consultingPaths: string[]
  creatorBusinessPaths: string[]
  onlineBusinessPaths: string[]
  digitalProductPaths: string[]
  personalBrandPaths: string[]
  sideHustles: string[]
  passiveIncomeOpportunities: string[]
}

export type CareerKnowledgeGraph = {
  parentCareers: string[]
  childCareers: string[]
  adjacentCareers: string[]
  alternativeCareers: string[]
  transitionCareers: string[]
  careerClusters: string[]
  industryFamilies: string[]
  futureEvolutions: string[]
  careerSimilarities: string[]
  skillOverlaps: string[]
  migrationPaths: string[]
  upgradePaths: string[]
  pivotPaths: string[]
  specializations: string[]
  generalizations: string[]
}

export type CareerIntelligence = {
  graph: CareerKnowledgeGraph
  laborMarket: LaborMarketIntelligence
  education: EducationIntelligence
  skills: SkillIntelligence[]
  roadmap: CareerRoadmap
  simulation: CareerSimulation
  futureOfWork: FutureOfWorkIntelligence
  entrepreneurship: EntrepreneurshipIntelligence
  global: Partial<Record<RegionKey, string[]>>
}

export type Career = {
  id: string
  title: string
  titleVi: string
  category: string
  summary: string
  dna: Partial<DimensionScores>
  workStyles: WorkStyle[]
  market: MarketSignal
  aiRisk: AiRisk
  learningCurve: number
  longTermGrowth: number
  starterSkills: string[]
  nextMilestones: string[]
  evidenceProfile?: {
    domains: string[]
    jobFamilies: string[]
    requiredSkills: string[]
    preferredSkills: string[]
    tools: string[]
    educationKeywords: string[]
    experienceKeywords: string[]
  }
  intelligence?: CareerIntelligence
}

export type AdvancedScoreBreakdown = {
  potential: number
  futureSuccess: number
  learningCurveFit: number
  adaptabilityFit: number
  careerLongevity: number
  careerResilience: number
  careerSatisfaction: number
  burnoutRisk: number
  marketOpportunity: number
  growthPotential: number
  globalCompetitiveness: number
  entrepreneurialOpportunity: number
  futureProof: number
  automationResistance: number
  aiDisruptionResistance: number
  careerStability: number
  transitionDifficulty: number
  promotionPotential: number
  incomeGrowthPotential: number
  personalFulfillment: number
  meaningAndPurpose: number
}

export type EvidenceScoreBreakdown = {
  domainMatch: number
  skillMatch: number
  experienceMatch: number
  educationMatch: number
  toolMatch: number
  interestMatch: number
  evidenceFit: number
  mismatchPenalty: number
  confidence: number
  matchedEvidence: string[]
  strengths: string[]
  gaps: string[]
}

export type ScoreBreakdown = {
  career: Career
  compatibility: number
  evidenceFit: number
  motivationFit: number
  learningPotential: number
  opportunity: number
  aiResilience: number
  futureProjection: number
  overall: number
  confidence: number
  strengths: DimensionKey[]
  gaps: DimensionKey[]
  explanation: string[]
  evidence: EvidenceScoreBreakdown
  advanced: AdvancedScoreBreakdown
}
