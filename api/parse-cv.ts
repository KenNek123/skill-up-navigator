import type { VercelRequest, VercelResponse } from '@vercel/node'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const localEnv = (() => {
  const envPath = join(process.cwd(), '.env.local')
  if (!existsSync(envPath)) return {}

  return Object.fromEntries(
    readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const index = line.indexOf('=')
        const key = line.slice(0, index).trim()
        const value = line
          .slice(index + 1)
          .trim()
          .replace(/^"(.*)"$/, '$1')
        return [key, value]
      }),
  ) as Record<string, string>
})()

const getEnv = (name: string) => process.env[name] || localEnv[name]

const normalizeModelName = (model: string) => model.replace(/^models\//, '').trim()

const MODEL = normalizeModelName(getEnv('GEMINI_MODEL') ?? 'gemini-flash-lite-latest')
const FALLBACK_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash-lite-001',
  'gemini-flash-latest',
  'gemini-2.0-flash',
  'gemini-2.0-flash-001',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-3-flash-preview',
  'gemini-3.1-flash-lite',
  'gemini-3.1-flash-lite-preview',
]
const MAX_FILE_BYTES = 4 * 1024 * 1024

type GeminiPart = {
  text?: string
  inline_data?: {
    mime_type: string
    data: string
  }
}

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>
    }
  }>
  error?: {
    message?: string
  }
}

type ParsedProfile = {
  name?: string
  headline?: string
  dimensions?: Partial<Record<string, number>>
  preferences?: {
    workStyles?: string[]
  }
  structuredEvidence?: {
    education?: Array<{
      degree?: string
      major?: string
      institution?: string
      graduationYear?: string
    }>
    experience?: Array<{
      company?: string
      role?: string
      duration?: string
      industry?: string
    }>
    skills?: {
      hard?: string[]
      soft?: string[]
      technical?: string[]
      business?: string[]
    }
    tools?: string[]
    certifications?: string[]
    languages?: string[]
    projects?: Array<{
      name?: string
      description?: string
      tools?: string[]
      industry?: string
    }>
    industries?: string[]
    interests?: string[]
    achievements?: string[]
  }
  signals?: Partial<Record<string, number | string[] | string>>
  evidence?: string[]
}

const prompt = `
Ban la CV parsing engine cho Skill-Up Navigator.
Nhiem vu duy nhat: doc CV va tra ve JSON co cau truc de engine deterministic tinh career.
Khong duoc de xuat nghe. Khong duoc tu quyet dinh career.
Khong duoc bia du an, thanh tich, bang cap hoac kinh nghiem.

Tra ve JSON thuan, khong markdown, theo schema:
{
  "name": "string",
  "headline": "string ngan bang tieng Viet",
  "dimensions": {
    "logic": 0-100,
    "analyticalThinking": 0-100,
    "communication": 0-100,
    "leadership": 0-100,
    "adaptability": 0-100,
    "creativity": 0-100,
    "technicalAffinity": 0-100,
    "collaboration": 0-100,
    "learningAgility": 0-100,
    "decisionMaking": 0-100,
    "riskTolerance": 0-100,
    "motivation": 0-100
  },
  "preferences": {
    "workStyles": ["structured" | "ambiguous" | "peopleFirst" | "deepWork" | "builder" | "advisor"]
  },
  "structuredEvidence": {
    "education": [
      {
        "degree": "bang cap, vi du: Cu nhan / Master / Cao dang",
        "major": "nganh hoc",
        "institution": "truong/to chuc dao tao",
        "graduationYear": "nam tot nghiep neu co"
      }
    ],
    "experience": [
      {
        "company": "ten cong ty/to chuc",
        "role": "chuc danh/vai tro",
        "duration": "thoi luong/thoi gian",
        "industry": "nganh cua cong ty hoac cong viec"
      }
    ],
    "skills": {
      "hard": ["ky nang chuyen mon khong thuoc tool"],
      "soft": ["ky nang mem"],
      "technical": ["ky nang ky thuat, data, coding, engineering"],
      "business": ["ky nang kinh doanh, marketing, finance, operations"]
    },
    "tools": ["cong cu/phan mem nen tang, vi du Google Ads, Meta Ads, Salesforce, HubSpot, Excel, Figma, Photoshop, SQL, Python"],
    "certifications": ["chung chi"],
    "languages": ["ngon ngu"],
    "projects": [
      {
        "name": "ten du an",
        "description": "mo ta ngan dua tren CV",
        "tools": ["cong cu dung trong du an"],
        "industry": "nganh lien quan"
      }
    ],
    "industries": ["Marketing", "Finance", "Healthcare", "Manufacturing", "Technology", "Retail"...],
    "interests": ["linh vuc quan tam co bang chung trong CV"],
    "achievements": ["thanh tich, KPI, giai thuong, ket qua dinh luong"]
  },
  "signals": {
    "interests": ["3-8 linh vuc quan tam"],
    "strengths": ["3-8 diem manh"],
    "weaknesses": ["1-5 diem can bo sung neu co bang chung"],
    "values": ["impact" | "income" | "stability" | "autonomy" | "recognition" | "learning" | "creativity" | "service"],
    "learningPreferences": ["course" | "project" | "mentor" | "selfTaught" | "credential" | "research"],
    "personality": ["structured" | "exploratory" | "social" | "independent" | "practical" | "strategic"],
    "remoteWorkPreference": 0-100,
    "travelPreference": 0-100,
    "incomeExpectation": 0-100,
    "workLifeBalancePreference": 0-100,
    "entrepreneurialTendency": 0-100,
    "stressTolerance": 0-100,
    "attentionToDetail": 0-100,
    "systemsThinking": 0-100,
    "timeManagement": 0-100,
    "purposeOrientation": 0-100,
    "geographicFlexibility": 0-100
  },
  "evidence": ["3-5 bang chung ngan tu CV"]
}

Mapping goi y:
- logic: bai toan, lap luan, ky thuat, dinh luong.
- analyticalThinking: phan tich du lieu, nghien cuu, root cause, tai chinh, quy trinh.
- communication: viet, thuyet trinh, teaching, client, stakeholder, ngon ngu.
- leadership: lead team, owner, mentor, project coordination, decision accountability.
- adaptability: doi moi truong, hoc nhanh cong cu moi, xu ly ambiguity.
- creativity: design, content, product idea, campaign, creative problem solving.
- technicalAffinity: coding, tools, data, AI, engineering, systems.
- collaboration: teamwork, cross-functional, community, club, volunteer.
- learningAgility: tu hoc, certification, rapid learning, broad exploration.
- decisionMaking: uu tien, trade-off, planning, ownership.
- riskTolerance: startup, freelance, thi truong moi, competition, uncertainty.
- motivation: consistency, achievement, long-term effort, initiative.

Nguyen tac:
- Neu thieu du lieu, suy luan than trong tu bang chung trong CV.
- Score phai la so nguyen 0-100.
- evidence phai dua tren noi dung CV.
- structuredEvidence phai tach ro skill, tool, industry, project, education va experience. Khong dua generic personality vao day.
- Khong duoc them cong cu, bang cap, cong ty, chung chi, du an neu CV khong co bang chung.
- Neu khong ro mot truong, dung chuoi rong hoac mang rong thay vi bia.
`

const allowedMimeTypes = new Set([
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const clampScore = (value: unknown, fallback: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return fallback
  return Math.max(0, Math.min(100, Math.round(value)))
}

const cleanText = (value: unknown) =>
  typeof value === 'string' ? value.normalize('NFC').replace(/\s+/g, ' ').trim() : ''

const cleanList = (value: unknown, limit = 12) => {
  if (!Array.isArray(value)) return []

  return Array.from(
    new Set(
      value
        .map(cleanText)
        .filter((item) => item.length > 0)
        .map((item) => item.slice(0, 120)),
    ),
  ).slice(0, limit)
}

const getRequestBody = (request: VercelRequest) => {
  if (typeof request.body === 'string') {
    return JSON.parse(request.body) as Record<string, unknown>
  }

  if (request.body && typeof request.body === 'object') {
    return request.body as Record<string, unknown>
  }

  return {}
}

const extractJson = (text: string) => {
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Gemini did not return JSON.')
  }

  return JSON.parse(cleaned.slice(start, end + 1)) as ParsedProfile
}

const normalizeProfile = (input: ParsedProfile) => {
  const current = input.dimensions ?? {}
  const signals = input.signals ?? {}
  const signalScore = (name: string, fallback: number) => clampScore(signals[name], fallback)
  const dimensions = {
    logic: clampScore(current.logic, 60),
    analyticalThinking: clampScore(current.analyticalThinking, signalScore('systemsThinking', 60)),
    communication: clampScore(current.communication, 60),
    leadership: clampScore(current.leadership, 55),
    adaptability: clampScore(current.adaptability, signalScore('geographicFlexibility', 60)),
    creativity: clampScore(current.creativity, 55),
    technicalAffinity: clampScore(current.technicalAffinity, 55),
    collaboration: clampScore(current.collaboration, 60),
    learningAgility: clampScore(current.learningAgility, 60),
    decisionMaking: clampScore(current.decisionMaking, signalScore('timeManagement', 55)),
    riskTolerance: clampScore(current.riskTolerance, signalScore('entrepreneurialTendency', 50)),
    motivation: clampScore(current.motivation, signalScore('purposeOrientation', 60)),
  }

  const allowedStyles = new Set([
    'structured',
    'ambiguous',
    'peopleFirst',
    'deepWork',
    'builder',
    'advisor',
  ])
  const workStyles = (input.preferences?.workStyles ?? [])
    .filter((style): style is string => typeof style === 'string')
    .filter((style) => allowedStyles.has(style))
    .slice(0, 3)
  const evidenceInput = input.structuredEvidence ?? {}
  const normalizedEvidence = {
    education: Array.isArray(evidenceInput.education)
      ? evidenceInput.education
          .map((item) => ({
            degree: cleanText(item.degree),
            major: cleanText(item.major),
            institution: cleanText(item.institution),
            graduationYear: cleanText(item.graduationYear),
          }))
          .filter((item) => item.degree || item.major || item.institution)
          .slice(0, 6)
      : [],
    experience: Array.isArray(evidenceInput.experience)
      ? evidenceInput.experience
          .map((item) => ({
            company: cleanText(item.company),
            role: cleanText(item.role),
            duration: cleanText(item.duration),
            industry: cleanText(item.industry),
          }))
          .filter((item) => item.company || item.role || item.industry)
          .slice(0, 10)
      : [],
    skills: {
      hard: cleanList(evidenceInput.skills?.hard, 16),
      soft: cleanList(evidenceInput.skills?.soft, 12),
      technical: cleanList(evidenceInput.skills?.technical, 16),
      business: cleanList(evidenceInput.skills?.business, 16),
    },
    tools: cleanList(evidenceInput.tools, 20),
    certifications: cleanList(evidenceInput.certifications, 12),
    languages: cleanList(evidenceInput.languages, 8),
    projects: Array.isArray(evidenceInput.projects)
      ? evidenceInput.projects
          .map((item) => ({
            name: cleanText(item.name),
            description: cleanText(item.description),
            tools: cleanList(item.tools, 8),
            industry: cleanText(item.industry),
          }))
          .filter((item) => item.name || item.description)
          .slice(0, 8)
      : [],
    industries: cleanList(evidenceInput.industries, 12),
    interests: cleanList(evidenceInput.interests ?? signals.interests, 10),
    achievements: cleanList(evidenceInput.achievements, 10),
  }

  return {
    name: typeof input.name === 'string' && input.name.trim() ? input.name.trim() : 'Nguoi dung',
    headline:
      typeof input.headline === 'string' && input.headline.trim()
        ? input.headline.trim()
        : 'Ho so duoc trich xuat tu CV',
    dimensions,
    preferences: {
      workStyles: workStyles.length > 0 ? workStyles : ['structured', 'deepWork'],
    },
    evidence: Array.isArray(input.evidence)
      ? input.evidence.filter((item) => typeof item === 'string' && item.trim()).slice(0, 5)
      : [],
    structuredEvidence: normalizedEvidence,
  }
}

const sendError = (response: VercelResponse, status: number, error: string) =>
  response.status(status).json({ error })

const callGemini = async (modelName: string, apiKey: string, parts: GeminiPart[]) => {
  const model = normalizeModelName(modelName)
  const geminiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      }),
    },
  )

  return {
    model,
    ok: geminiResponse.ok,
    status: geminiResponse.status,
    rawResult: await geminiResponse.text(),
  }
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  try {
    if (request.method !== 'POST') {
      response.setHeader('Allow', 'POST')
      return sendError(response, 405, 'Method not allowed.')
    }

    const apiKey = getEnv('GOOGLE_API_KEY')
    if (!apiKey || apiKey.includes('your_google')) {
      return sendError(
        response,
        500,
        'Missing GOOGLE_API_KEY. Add it to .env.local or Vercel Environment Variables.',
      )
    }

    const body = getRequestBody(request)
    const fileName = body.fileName
    const mimeType = body.mimeType
    const data = body.data

    if (typeof data !== 'string' || typeof mimeType !== 'string') {
      return sendError(response, 400, 'Missing file data.')
    }

    if (!allowedMimeTypes.has(mimeType)) {
      return sendError(response, 400, 'Unsupported file type. Please upload PDF, DOC, DOCX or TXT.')
    }

    const byteLength = Buffer.byteLength(data, 'base64')
    if (byteLength > MAX_FILE_BYTES) {
      return sendError(response, 413, 'File is too large. Maximum size is 4MB.')
    }

    const parts: GeminiPart[] = [
      { text: prompt },
      {
        text: `File name: ${typeof fileName === 'string' ? fileName : 'uploaded-cv'}`,
      },
      {
        inline_data: {
          mime_type: mimeType,
          data,
        },
      },
    ]

    const models = Array.from(new Set([MODEL, ...FALLBACK_MODELS]))
    let geminiResult = await callGemini(models[0], apiKey, parts)

    for (const model of models.slice(1)) {
      if (geminiResult.ok || ![404, 429, 503].includes(geminiResult.status)) break
      geminiResult = await callGemini(model, apiKey, parts)
    }

    const rawResult = geminiResult.rawResult
    let result: GeminiResponse

    try {
      result = JSON.parse(rawResult) as GeminiResponse
    } catch {
      return sendError(
        response,
        geminiResult.ok ? 500 : geminiResult.status,
        `Gemini returned non-JSON response from ${geminiResult.model}: ${rawResult.slice(0, 240)}`,
      )
    }

    if (!geminiResult.ok) {
      return sendError(
        response,
        geminiResult.status,
        `${result.error?.message ?? 'Gemini request failed.'} Model used: ${geminiResult.model}.`,
      )
    }

    const text =
      result.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? ''
    const parsed = normalizeProfile(extractJson(text))

    return response.status(200).json({ profile: parsed, model: geminiResult.model })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown API error.'
    return sendError(response, 500, message)
  }
}
