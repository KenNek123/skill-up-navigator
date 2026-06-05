import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { careers } from '../src/data/careers'
import { rankCareers, scoreCareer } from '../src/engine/scoring'
import type { HumanProfile } from '../src/engine/types'

const baseDimensions: HumanProfile['dimensions'] = {
  logic: 66,
  analyticalThinking: 72,
  communication: 88,
  leadership: 64,
  adaptability: 80,
  creativity: 86,
  technicalAffinity: 52,
  collaboration: 84,
  learningAgility: 78,
  decisionMaking: 74,
  riskTolerance: 58,
  motivation: 82,
}

const marketingProfile: HumanProfile = {
  name: 'Marketing CV',
  headline: 'Digital marketing specialist with ads and content experience',
  dimensions: baseDimensions,
  preferences: {
    remote: 70,
    stability: 62,
    growth: 82,
    socialImpact: 55,
    income: 70,
    autonomy: 72,
    workStyles: ['peopleFirst', 'ambiguous', 'builder'],
  },
  evidence: ['Managed Meta Ads and Google Ads campaigns', 'Built content calendar and SEO blog plan'],
  structuredEvidence: {
    education: [{ degree: 'Bachelor', major: 'Marketing', institution: 'University', graduationYear: '2023' }],
    experience: [{ company: 'Retail Brand', role: 'Digital Marketing Executive', duration: '2 years', industry: 'Marketing' }],
    skills: {
      hard: ['campaign planning', 'SEO', 'content planning'],
      soft: ['communication', 'collaboration'],
      technical: ['Google Analytics'],
      business: ['customer insight', 'brand strategy', 'funnel analysis'],
    },
    tools: ['Google Ads', 'Meta Ads', 'Google Analytics', 'HubSpot', 'Excel'],
    certifications: ['Google Ads Search'],
    languages: ['Vietnamese', 'English'],
    projects: [
      {
        name: 'SEO relaunch',
        description: 'Improved blog CTR and conversion',
        tools: ['Google Analytics'],
        industry: 'Marketing',
      },
    ],
    industries: ['Marketing', 'Retail', 'Communications'],
    interests: ['growth marketing', 'brand strategy'],
    achievements: ['Improved campaign conversion rate'],
  },
}

describe('career scoring evidence model', () => {
  it('prioritizes marketing careers for a marketing CV over unrelated AI roles', () => {
    const ranked = rankCareers(marketingProfile, careers)
    const topThreeCategories = ranked.slice(0, 3).map((item) => item.career.category)
    const aiRole = ranked.find((item) => item.career.id === 'ai-implementation-specialist')

    assert.deepEqual(topThreeCategories, [
      'Marketing & Communications',
      'Marketing & Communications',
      'Marketing & Communications',
    ])
    assert.ok(aiRole, 'Expected seed AI implementation role to exist')
    assert.ok(ranked[0].overall > aiRole.overall)
    assert.ok(ranked[0].evidenceFit > aiRole.evidenceFit)
  })

  it('applies a mismatch penalty when AI recommendation lacks domain and skill evidence', () => {
    const aiRole = careers.find((career) => career.id === 'ai-implementation-specialist')
    assert.ok(aiRole, 'Expected seed AI implementation role to exist')

    const scored = scoreCareer(marketingProfile, aiRole)

    assert.ok(scored.evidence.domainMatch < 50)
    assert.ok(scored.evidence.skillMatch < 50)
    assert.ok(scored.evidence.mismatchPenalty > 0)
    assert.ok(scored.confidence < 70)
  })
})
