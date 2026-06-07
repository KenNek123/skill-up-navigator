import { useState } from 'react'
import { LandingPage } from './components/LandingPage'
import { QuestionStepper } from './components/QuestionStepper'
import { ResultPage } from './components/ResultPage'
import { getQuestionsByFlow } from './questionnaire/questionBank'
import { mapAnswersToProfile } from './questionnaire/mapper'
import { rankCareers } from './engine/scoring'
import { careers } from './data/careers'
import type { QuestionAnswer } from './questionnaire/questionnaire.types'
import type { HumanProfile, StructuredCvEvidence, DimensionKey, WorkStyle } from './engine/types'

type AppState = 'landing' | 'questions' | 'results'

type ParsedCvResponse = {
  profile?: {
    name?: string
    headline?: string
    dimensions?: Partial<Record<DimensionKey, number>>
    preferences?: {
      workStyles?: WorkStyle[]
    }
    evidence?: string[]
    structuredEvidence?: StructuredCvEvidence
  }
  error?: string
  model?: string
}

function App() {
  const [state, setState] = useState<AppState>('landing')
  const [profile, setProfile] = useState<HumanProfile | null>(null)
  const [ranked, setRanked] = useState<ReturnType<typeof rankCareers> | null>(null)
  const [cvData, setCvData] = useState<ParsedCvResponse['profile'] | null>(null)

  const handleStart = () => {
    setState('questions')
  }

  const handleCvParsed = (parsedData: ParsedCvResponse['profile']) => {
    setCvData(parsedData)
  }

  const handleComplete = (answers: QuestionAnswer[]) => {
    let generatedProfile = mapAnswersToProfile(answers, 'B')

    if (cvData) {
      generatedProfile = {
        ...generatedProfile,
        name: cvData.name ?? generatedProfile.name,
        headline: cvData.headline ?? generatedProfile.headline,
        dimensions: {
          ...generatedProfile.dimensions,
          ...cvData.dimensions,
        },
        preferences: {
          ...generatedProfile.preferences,
          workStyles:
            cvData.preferences?.workStyles && cvData.preferences.workStyles.length > 0
              ? cvData.preferences.workStyles
              : generatedProfile.preferences.workStyles,
        },
        evidence:
          cvData.evidence && cvData.evidence.length > 0
            ? cvData.evidence
            : generatedProfile.evidence,
        structuredEvidence: cvData.structuredEvidence ?? generatedProfile.structuredEvidence,
      }
    }

    const rankedCareers = rankCareers(generatedProfile, careers)

    setProfile(generatedProfile)
    setRanked(rankedCareers)
    setState('results')
  }

  const handleRestart = () => {
    setProfile(null)
    setRanked(null)
    setCvData(null)
    setState('landing')
  }

  const questions = getQuestionsByFlow('B')

  return (
    <>
      {state === 'landing' && <LandingPage onStart={handleStart} onCvParsed={handleCvParsed} />}
      {state === 'questions' && (
        <QuestionStepper questions={questions} onComplete={handleComplete} />
      )}
      {state === 'results' && profile && ranked && (
        <ResultPage profile={profile} ranked={ranked} onRestart={handleRestart} />
      )}
    </>
  )
}

export default App
