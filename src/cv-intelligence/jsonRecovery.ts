export const extractJsonFromMarkdown = (text: string): string => {
  let cleaned = text.trim()

  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '')

  const jsonStart = cleaned.indexOf('{')
  const jsonEnd = cleaned.lastIndexOf('}')

  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
    throw new Error('No valid JSON object found in response')
  }

  return cleaned.slice(jsonStart, jsonEnd + 1)
}

export const repairCommonJsonErrors = (jsonString: string): string => {
  let repaired = jsonString

  repaired = repaired.replace(/,(\s*[}\]])/g, '$1')

  repaired = repaired.replace(/([}\]])(\s*)([{\[])/g, '$1,$2$3')

  repaired = repaired.replace(/:\s*'([^']*)'/g, ':"$1"')

  repaired = repaired.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')

  return repaired
}

export const tryParseJson = <T = unknown>(text: string): T => {
  const attempts = [
    () => JSON.parse(text),
    () => JSON.parse(extractJsonFromMarkdown(text)),
    () => JSON.parse(repairCommonJsonErrors(text)),
    () => JSON.parse(repairCommonJsonErrors(extractJsonFromMarkdown(text))),
  ]

  for (const attempt of attempts) {
    try {
      return attempt()
    } catch {
      continue
    }
  }

  throw new Error('Failed to parse JSON after all recovery attempts')
}

export type JsonRecoveryResult<T> =
  | { success: true; data: T; warnings: string[] }
  | { success: false; error: string; partialData?: Partial<T> }

export const safeParseJson = <T = unknown>(text: string): JsonRecoveryResult<T> => {
  const warnings: string[] = []

  if (!text || !text.trim()) {
    return {
      success: false,
      error: 'Empty response from AI',
    }
  }

  if (text.includes('```')) {
    warnings.push('Response contained markdown code fences')
  }

  try {
    const data = tryParseJson<T>(text)
    return {
      success: true,
      data,
      warnings,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown parsing error'
    return {
      success: false,
      error: message,
    }
  }
}
