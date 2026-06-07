import type { VercelRequest, VercelResponse } from '@vercel/node'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseCvResponse } from '../src/cv-intelligence/cvParser'
import { withRetry, createApiErrorResponse } from '../src/cv-intelligence/apiReliability'

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
const TIMEOUT_MS = 45000

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

const prompt = `
Ban la CV parsing engine cho Skill-Up Navigator.
Nhiem vu duy nhat: doc CV va tra ve JSON co cau truc de engine deterministic tinh career.
Khong duoc de xuat nghe. Khong duoc tu quyet dinh career.
Khong duoc bia du an, thanh tich, bang cap hoac kinh nghiem.

CHI DUOC TRICH XUAT THONG TIN CO TRONG CV.
NEU MOT KY NANG KHONG CO TRONG CV, KHONG DUOC THEM VAO OUTPUT.

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
  "evidence": ["3-5 bang chung ngan tu CV"]
}

Mapping dimensions:
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
- CHI TRICH XUAT THONG TIN CO TRONG CV.
- Khong duoc them cong cu, bang cap, cong ty, chung chi, du an neu CV khong co bang chung.
- Neu thieu du lieu, suy luan than trong tu bang chung trong CV.
- Score phai la so nguyen 0-100.
- structuredEvidence phai tach ro skill, tool, industry, project, education va experience.
- Neu khong ro mot truong, dung chuoi rong hoac mang rong thay vi bia.
`

const allowedMimeTypes = new Set([
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const getRequestBody = (request: VercelRequest) => {
  if (typeof request.body === 'string') {
    return JSON.parse(request.body) as Record<string, unknown>
  }

  if (request.body && typeof request.body === 'object') {
    return request.body as Record<string, unknown>
  }

  return {}
}

const callGemini = async (
  modelName: string,
  apiKey: string,
  parts: GeminiPart[],
  signal: AbortSignal
) => {
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
      signal,
    }
  )

  return {
    model,
    ok: geminiResponse.ok,
    status: geminiResponse.status,
    rawResult: await geminiResponse.text(),
  }
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed.' })
  }

  const apiKey = getEnv('GOOGLE_API_KEY')
  if (!apiKey || apiKey.includes('your_google')) {
    return response.status(500).json({
      error: 'Missing GOOGLE_API_KEY. Add it to .env.local or Vercel Environment Variables.',
    })
  }

  const body = getRequestBody(request)
  const fileName = body.fileName
  const mimeType = body.mimeType
  const data = body.data

  if (typeof data !== 'string' || typeof mimeType !== 'string') {
    return response.status(400).json({ error: 'Missing file data.' })
  }

  if (!allowedMimeTypes.has(mimeType)) {
    return response
      .status(400)
      .json({ error: 'Unsupported file type. Please upload PDF, DOC, DOCX or TXT.' })
  }

  const byteLength = Buffer.byteLength(data, 'base64')
  if (byteLength > MAX_FILE_BYTES) {
    return response.status(413).json({ error: 'File is too large. Maximum size is 4MB.' })
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

  const result = await withRetry(
    async (signal) => {
      for (const model of models) {
        try {
          const geminiResult = await callGemini(model, apiKey, parts, signal)

          if (!geminiResult.ok) {
            if (geminiResult.status === 404 || geminiResult.status === 503) {
              continue
            }

            let geminiError: GeminiResponse
            try {
              geminiError = JSON.parse(geminiResult.rawResult) as GeminiResponse
            } catch {
              throw new Error(`Gemini error ${geminiResult.status}: ${geminiResult.rawResult.slice(0, 200)}`)
            }

            throw new Error(
              geminiError.error?.message ?? `Gemini request failed with status ${geminiResult.status}`
            )
          }

          let geminiResponse: GeminiResponse
          try {
            geminiResponse = JSON.parse(geminiResult.rawResult) as GeminiResponse
          } catch {
            throw new Error('Gemini returned non-JSON response')
          }

          const text =
            geminiResponse.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('') ?? ''

          if (!text.trim()) {
            throw new Error('Gemini returned empty response')
          }

          return { text, model: geminiResult.model }
        } catch (error) {
          if (model === models[models.length - 1]) {
            throw error
          }
          continue
        }
      }

      throw new Error('All models failed')
    },
    {
      maxRetries: 2,
      timeoutMs: TIMEOUT_MS,
      baseDelayMs: 1500,
    }
  )

  if (!result.success) {
    const errorResponse = createApiErrorResponse(result.error)
    return response.status(errorResponse.status).json(errorResponse.body)
  }

  const cvTextBuffer = Buffer.from(data, 'base64')
  const cvText = cvTextBuffer.toString('utf-8').slice(0, 50000)
  const parseResult = parseCvResponse(result.data.text, cvText)

  if (!parseResult.success) {
    return response.status(500).json({
      error: parseResult.error,
      warnings: parseResult.warnings,
    })
  }

  const warningMessages = parseResult.warnings
    .filter((w) => w.severity === 'high')
    .map((w) => w.message)

  return response.status(200).json({
    profile: parseResult.profile,
    signals: parseResult.signals,
    model: result.data.model,
    warnings: warningMessages.length > 0 ? warningMessages : undefined,
  })
}
