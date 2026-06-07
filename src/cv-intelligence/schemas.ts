import { z } from 'zod'

const cleanString = (value: unknown): string => {
  if (typeof value !== 'string') return ''
  return value.normalize('NFC').replace(/\s+/g, ' ').trim()
}

const cleanStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return Array.from(
    new Set(
      value
        .map((item) => cleanString(item))
        .filter((item) => item.length > 0)
        .map((item) => item.slice(0, 120))
    )
  )
}

const scoreSchema = z.coerce.number().min(0).max(100).int()

export const educationEntrySchema = z.object({
  degree: z.string().transform(cleanString),
  major: z.string().transform(cleanString),
  institution: z.string().transform(cleanString),
  graduationYear: z.string().optional().transform((v) => (v ? cleanString(v) : undefined)),
})

export const experienceEntrySchema = z.object({
  company: z.string().transform(cleanString),
  role: z.string().transform(cleanString),
  duration: z.string().transform(cleanString),
  industry: z.string().transform(cleanString),
})

export const projectEntrySchema = z.object({
  name: z.string().transform(cleanString),
  description: z.string().transform(cleanString),
  tools: z.array(z.string()).transform(cleanStringArray),
  industry: z.string().transform(cleanString),
})

export const skillEvidenceSchema = z.object({
  hard: z.array(z.string()).transform(cleanStringArray),
  soft: z.array(z.string()).transform(cleanStringArray),
  technical: z.array(z.string()).transform(cleanStringArray),
  business: z.array(z.string()).transform(cleanStringArray),
})

export const structuredCvEvidenceSchema = z.object({
  education: z
    .array(educationEntrySchema)
    .transform((arr) => arr.filter((item) => item.degree || item.major || item.institution))
    .transform((arr) => arr.slice(0, 6)),
  experience: z
    .array(experienceEntrySchema)
    .transform((arr) => arr.filter((item) => item.company || item.role || item.industry))
    .transform((arr) => arr.slice(0, 10)),
  skills: skillEvidenceSchema,
  tools: z.array(z.string()).transform((v) => cleanStringArray(v).slice(0, 20)),
  certifications: z.array(z.string()).transform((v) => cleanStringArray(v).slice(0, 12)),
  languages: z.array(z.string()).transform((v) => cleanStringArray(v).slice(0, 8)),
  projects: z
    .array(projectEntrySchema)
    .transform((arr) => arr.filter((item) => item.name || item.description))
    .transform((arr) => arr.slice(0, 8)),
  industries: z.array(z.string()).transform((v) => cleanStringArray(v).slice(0, 12)),
  interests: z.array(z.string()).transform((v) => cleanStringArray(v).slice(0, 10)),
  achievements: z.array(z.string()).transform((v) => cleanStringArray(v).slice(0, 10)),
})

export const dimensionsSchema = z.object({
  logic: scoreSchema.default(60),
  analyticalThinking: scoreSchema.default(60),
  communication: scoreSchema.default(60),
  leadership: scoreSchema.default(55),
  adaptability: scoreSchema.default(60),
  creativity: scoreSchema.default(55),
  technicalAffinity: scoreSchema.default(55),
  collaboration: scoreSchema.default(60),
  learningAgility: scoreSchema.default(60),
  decisionMaking: scoreSchema.default(55),
  riskTolerance: scoreSchema.default(50),
  motivation: scoreSchema.default(60),
})

export const workStyleSchema = z.enum([
  'structured',
  'ambiguous',
  'peopleFirst',
  'deepWork',
  'builder',
  'advisor',
])

export const preferencesSchema = z.object({
  workStyles: z.array(workStyleSchema).default(['structured', 'deepWork']),
})

export const cvProfileSchema = z.object({
  name: z.string().transform((v) => cleanString(v) || 'Nguoi dung'),
  headline: z.string().transform((v) => cleanString(v) || 'Ho so duoc trich xuat tu CV'),
  dimensions: dimensionsSchema,
  preferences: preferencesSchema,
  evidence: z
    .array(z.string())
    .transform((v) => cleanStringArray(v).slice(0, 5))
    .default([]),
  structuredEvidence: structuredCvEvidenceSchema,
})

export const careerSignalsSchema = z.object({
  technicalDepth: scoreSchema,
  leadershipPotential: scoreSchema,
  communicationStrength: scoreSchema,
  businessExposure: scoreSchema,
  analyticalThinking: scoreSchema,
  creativeAbility: scoreSchema,
  learningAgility: scoreSchema,
  projectComplexity: scoreSchema,
  domainExpertise: scoreSchema,
  growthPotential: scoreSchema,
})

export type EducationEntry = z.infer<typeof educationEntrySchema>
export type ExperienceEntry = z.infer<typeof experienceEntrySchema>
export type ProjectEntry = z.infer<typeof projectEntrySchema>
export type SkillEvidence = z.infer<typeof skillEvidenceSchema>
export type StructuredCvEvidence = z.infer<typeof structuredCvEvidenceSchema>
export type Dimensions = z.infer<typeof dimensionsSchema>
export type Preferences = z.infer<typeof preferencesSchema>
export type CvProfile = z.infer<typeof cvProfileSchema>
export type CareerSignals = z.infer<typeof careerSignalsSchema>
