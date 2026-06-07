import { canonicalizeSkills } from './skillNormalization'
import { cvProfileSchema, type CvProfile } from './schemas'
import { safeParseJson } from './jsonRecovery'
import { validateNoHallucination, type ValidationWarning } from './evidenceValidation'
import { computeCareerSignals } from './careerSignals'

export type ParseResult =
  | {
      success: true
      profile: CvProfile
      signals: ReturnType<typeof computeCareerSignals>
      warnings: ValidationWarning[]
    }
  | {
      success: false
      error: string
      warnings?: ValidationWarning[]
    }

export const parseCvResponse = (rawText: string, cvOriginalText?: string): ParseResult => {
  const jsonResult = safeParseJson(rawText)

  if (!jsonResult.success) {
    return {
      success: false,
      error: jsonResult.error,
    }
  }

  const parseResult = cvProfileSchema.safeParse(jsonResult.data)

  if (!parseResult.success) {
    return {
      success: false,
      error: `Schema validation failed: ${parseResult.error.message}`,
    }
  }

  const profile = parseResult.data

  const normalizedProfile = {
    ...profile,
    structuredEvidence: {
      ...profile.structuredEvidence,
      skills: {
        hard: canonicalizeSkills(profile.structuredEvidence.skills.hard),
        soft: canonicalizeSkills(profile.structuredEvidence.skills.soft),
        technical: canonicalizeSkills(profile.structuredEvidence.skills.technical),
        business: canonicalizeSkills(profile.structuredEvidence.skills.business),
      },
      tools: canonicalizeSkills(profile.structuredEvidence.tools),
    },
  }

  let warnings: ValidationWarning[] = []

  if (cvOriginalText) {
    const validation = validateNoHallucination(cvOriginalText, normalizedProfile)
    warnings = validation.warnings

    if (!validation.valid) {
      const highSeverityWarnings = warnings.filter((w) => w.severity === 'high')
      if (highSeverityWarnings.length > 5) {
        return {
          success: false,
          error: `Too many hallucination warnings: ${highSeverityWarnings.length} high-severity issues detected`,
          warnings,
        }
      }
    }
  }

  const signals = computeCareerSignals(normalizedProfile.structuredEvidence)

  return {
    success: true,
    profile: normalizedProfile,
    signals,
    warnings,
  }
}
