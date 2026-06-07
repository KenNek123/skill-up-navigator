import { useState } from 'react'
import { LandingPage } from './components/LandingPage'
import { QuestionStepper } from './components/QuestionStepper'
import { ResultPage } from './components/ResultPage'
import { getQuestionsByFlow } from './questionnaire/questionBank'
import { mapAnswersToProfile } from './questionnaire/mapper'
import { rankCareers } from './engine/scoring'
import { careers } from './data/careers'
import type { QuestionAnswer } from './questionnaire/questionnaire.types'
import type { HumanProfile } from './engine/types'

type AppState = 'landing' | 'questions' | 'results'

function App() {
  const [state, setState] = useState<AppState>('landing')
  const [profile, setProfile] = useState<HumanProfile | null>(null)
  const [ranked, setRanked] = useState<ReturnType<typeof rankCareers> | null>(null)

  const handleStart = () => {
    setState('questions')
  }

  const handleComplete = (answers: QuestionAnswer[]) => {
    const generatedProfile = mapAnswersToProfile(answers, 'B')
    const rankedCareers = rankCareers(generatedProfile, careers)

    setProfile(generatedProfile)
    setRanked(rankedCareers)
    setState('results')
  }

  const handleRestart = () => {
    setProfile(null)
    setRanked(null)
    setState('landing')
  }

  const questions = getQuestionsByFlow('B')

  return (
    <>
      {state === 'landing' && <LandingPage onStart={handleStart} />}
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
