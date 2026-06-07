import { normalizeSkillText } from './skillNormalization'

export type ValidationWarning = {
  field: string
  message: string
  severity: 'high' | 'medium' | 'low'
}

const normalizeForComparison = (text: string): string => {
  return normalizeSkillText(text)
}

const extractAllText = (obj: unknown): string[] => {
  const texts: string[] = []

  const traverse = (value: unknown) => {
    if (typeof value === 'string' && value.trim().length > 0) {
      texts.push(value.trim())
    } else if (Array.isArray(value)) {
      value.forEach(traverse)
    } else if (value && typeof value === 'object') {
      Object.values(value).forEach(traverse)
    }
  }

  traverse(obj)
  return texts
}

export const validateEvidenceIntegrity = (
  cvText: string,
  extractedProfile: unknown
): ValidationWarning[] => {
  const warnings: ValidationWarning[] = []
  const cvNormalized = normalizeForComparison(cvText)
  const extractedTexts = extractAllText(extractedProfile)

  for (const extracted of extractedTexts) {
    const normalizedExtracted = normalizeForComparison(extracted)

    if (normalizedExtracted.length < 2) continue

    if (normalizedExtracted.length > 100) continue

    const words = normalizedExtracted.split(/\s+/).filter((w) => w.length > 2)
    if (words.length === 0) continue

    const hasSignificantOverlap = words.some((word) => {
      if (word.length < 3) return false
      return cvNormalized.includes(word)
    })

    if (!hasSignificantOverlap) {
      warnings.push({
        field: 'structured_evidence',
        message: `Extracted text "${extracted.slice(0, 60)}" has no clear evidence in CV`,
        severity: 'high',
      })
    }
  }

  return warnings
}

export const validateSkillEvidence = (
  cvText: string,
  skills: string[]
): ValidationWarning[] => {
  const warnings: ValidationWarning[] = []
  const cvNormalized = normalizeForComparison(cvText)

  for (const skill of skills) {
    const skillNormalized = normalizeForComparison(skill)

    if (skillNormalized.length < 2) continue

    const skillWords = skillNormalized.split(/\s+/).filter((w) => w.length > 1)

    const hasEvidence = skillWords.some((word) => cvNormalized.includes(word))

    if (!hasEvidence) {
      warnings.push({
        field: 'skills',
        message: `Skill "${skill}" not found in CV`,
        severity: 'high',
      })
    }
  }

  return warnings
}

export const validateNoHallucination = (
  cvText: string,
  extractedProfile: unknown
): { valid: boolean; warnings: ValidationWarning[] } => {
  const allWarnings: ValidationWarning[] = []

  const evidenceWarnings = validateEvidenceIntegrity(cvText, extractedProfile)
  allWarnings.push(...evidenceWarnings)

  const profile = extractedProfile as any
  if (profile?.structuredEvidence?.skills) {
    const allSkills = [
      ...(profile.structuredEvidence.skills.hard || []),
      ...(profile.structuredEvidence.skills.soft || []),
      ...(profile.structuredEvidence.skills.technical || []),
      ...(profile.structuredEvidence.skills.business || []),
    ]
    const skillWarnings = validateSkillEvidence(cvText, allSkills)
    allWarnings.push(...skillWarnings)
  }

  if (profile?.structuredEvidence?.tools) {
    const toolWarnings = validateSkillEvidence(cvText, profile.structuredEvidence.tools)
    allWarnings.push(...toolWarnings)
  }

  const highSeverityCount = allWarnings.filter((w) => w.severity === 'high').length
  const valid = highSeverityCount === 0

  return {
    valid,
    warnings: allWarnings,
  }
}
