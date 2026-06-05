import {
  ArrowRight,
  BarChart3,
  Brain,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Cpu,
  FileText,
  Gauge,
  GitBranch,
  Layers3,
  LineChart,
  LockKeyhole,
  Map,
  Network,
  Route,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  UploadCloud,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import './App.css'
import { MetricPill } from './components/MetricPill'
import { ScoreBar } from './components/ScoreBar'
import { careers, demoProfile, dimensionLabels } from './data/careers'
import { rankCareers } from './engine/scoring'
import type { DimensionKey, HumanProfile, StructuredCvEvidence, WorkStyle } from './engine/types'

const dimensionOrder = Object.keys(dimensionLabels) as DimensionKey[]
const DISPLAYED_CAREER_COUNT = 5
const AUDIT_ROW_COUNT = 120

const workStyleOptions: Array<{ id: WorkStyle; vi: string; en: string }> = [
  { id: 'structured', vi: 'Có cấu trúc', en: 'Structured' },
  { id: 'ambiguous', vi: 'Mở và biến động', en: 'Ambiguous' },
  { id: 'peopleFirst', vi: 'Làm việc với con người', en: 'People-first' },
  { id: 'deepWork', vi: 'Tập trung sâu', en: 'Deep Work' },
  { id: 'builder', vi: 'Xây dựng sản phẩm', en: 'Builder' },
  { id: 'advisor', vi: 'Tư vấn quyết định', en: 'Advisor' },
]

const categoryLabels: Record<string, string> = {
  'Data & Decision Intelligence': 'Dữ liệu và ra quyết định',
  'Business Systems': 'Hệ thống kinh doanh',
  'Product Strategy': 'Chiến lược sản phẩm',
  'AI Transformation': 'Chuyển đổi AI',
  'Human Insight': 'Hiểu người dùng',
  'Security & Trust': 'An toàn và tin cậy',
}

const glossaryItems = [
  {
    term: 'Evidence Fit',
    vi: 'Mức nghề khớp với bằng chứng thật trong CV: ngành, kỹ năng, công cụ, kinh nghiệm, học vấn và dự án.',
  },
  {
    term: 'Career DNA',
    vi: 'Mã năng lực của nghề: nghề đó cần những điểm mạnh nào và cần mạnh đến mức nào.',
  },
  {
    term: 'AI Resilience',
    vi: 'Mức nghề vẫn còn giá trị khi AI phát triển vì còn cần phán đoán, giao tiếp hoặc trách nhiệm con người.',
  },
  {
    term: 'Confidence',
    vi: 'Độ tin cậy của đề xuất, cao hơn khi CV có nhiều tín hiệu trực tiếp thay vì chỉ điểm tính cách chung.',
  },
]

const cloneStructuredEvidence = (evidence: StructuredCvEvidence): StructuredCvEvidence => ({
  education: evidence.education.map((item) => ({ ...item })),
  experience: evidence.experience.map((item) => ({ ...item })),
  skills: {
    hard: [...evidence.skills.hard],
    soft: [...evidence.skills.soft],
    technical: [...evidence.skills.technical],
    business: [...evidence.skills.business],
  },
  tools: [...evidence.tools],
  certifications: [...evidence.certifications],
  languages: [...evidence.languages],
  projects: evidence.projects.map((item) => ({ ...item, tools: [...item.tools] })),
  industries: [...evidence.industries],
  interests: [...evidence.interests],
  achievements: [...evidence.achievements],
})

const cloneProfile = (): HumanProfile => ({
  ...demoProfile,
  dimensions: { ...demoProfile.dimensions },
  preferences: {
    ...demoProfile.preferences,
    workStyles: [...demoProfile.preferences.workStyles],
  },
  evidence: [...demoProfile.evidence],
  structuredEvidence: cloneStructuredEvidence(demoProfile.structuredEvidence),
})

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

const parseCvResponse = async (response: Response) => {
  const text = await response.text()

  if (!text.trim()) {
    throw new Error(
      'API chưa trả dữ liệu. Nếu đang chạy local, hãy dùng npx vercel dev thay vì npm run dev để bật /api/parse-cv.',
    )
  }

  try {
    return JSON.parse(text) as ParsedCvResponse
  } catch {
    throw new Error(
      response.ok
        ? 'API trả về dữ liệu không đúng định dạng JSON.'
        : `API lỗi ${response.status}: ${text.slice(0, 160)}`,
    )
  }
}

const compact = (items: string[]) => items.filter((item) => item.trim()).slice(0, 8)

const totalStructuredSignals = (evidence: StructuredCvEvidence) =>
  evidence.education.length +
  evidence.experience.length +
  evidence.projects.length +
  evidence.tools.length +
  evidence.certifications.length +
  evidence.languages.length +
  evidence.industries.length +
  evidence.interests.length +
  evidence.achievements.length +
  evidence.skills.hard.length +
  evidence.skills.soft.length +
  evidence.skills.technical.length +
  evidence.skills.business.length

function App() {
  const [profile, setProfile] = useState<HumanProfile>(cloneProfile)
  const pathname = window.location.pathname
  const ranked = useMemo(() => rankCareers(profile, careers), [profile])

  if (pathname === '/judge') {
    return <JudgePage profile={profile} />
  }

  const top = ranked[0]

  return (
    <main className="app-shell">
      <TopNav />
      <section className="hero-panel" aria-labelledby="hero-title">
        <div className="hero-panel__copy">
          <p className="eyebrow">Hệ điều hành định hướng nghề nghiệp</p>
          <h1 id="hero-title">Skill-Up Navigator</h1>
          <p className="hero-panel__lead">
            Hệ thống đọc CV thành bằng chứng có cấu trúc, so khớp ngành nghề theo kỹ năng, công cụ,
            kinh nghiệm và học vấn, rồi giải thích vì sao mỗi nghề xuất hiện.
          </p>
          <div className="hero-panel__actions">
            <a className="primary-action" href="#recommendations">
              <Target aria-hidden="true" size={18} />
              Xem đề xuất
            </a>
            <a className="ghost-action" href="/judge">
              <FileText aria-hidden="true" size={18} />
              Chế độ giám khảo
            </a>
          </div>
        </div>
        <div className="hero-system" aria-label="Tóm tắt điểm định hướng nghề nghiệp">
          <div className="system-ring">
            <span>{top.overall}</span>
            <small>Phù hợp tổng thể</small>
          </div>
          <div className="system-lines">
            <ScoreBar label="Khớp bằng chứng CV" value={top.evidenceFit} tone="blue" />
            <ScoreBar label="Độ tin cậy" value={top.confidence} tone="ink" />
            <ScoreBar label="An toàn trước AI" value={top.aiResilience} tone="green" />
          </div>
        </div>
      </section>

      <section className="metrics-strip" aria-label="Các tín hiệu chính của hệ thống">
        <MetricPill icon={Brain} label="Bằng chứng CV" value={`${totalStructuredSignals(profile.structuredEvidence)} tín hiệu`} />
        <MetricPill icon={BriefcaseBusiness} label="Mã nghề nghiệp" value={`${careers.length} nghề`} />
        <MetricPill icon={ShieldCheck} label="Giải thích" value="Có truy vết" />
      </section>

      <section className="workspace-grid">
        <ProfilePanel profile={profile} setProfile={setProfile} />
        <RecommendationPanel profile={profile} ranked={ranked} />
      </section>
    </main>
  )
}

function TopNav() {
  return (
    <header className="top-nav">
      <a className="brand" href="/">
        <span className="brand__mark">SN</span>
        <span>
          <strong>Skill-Up Navigator</strong>
          <small>Hệ điều hành nghề nghiệp</small>
        </span>
      </a>
      <nav aria-label="Điều hướng chính">
        <a href="#profile">Hồ sơ</a>
        <a href="#recommendations">Kết quả</a>
        <a href="/judge">Giám khảo</a>
      </nav>
    </header>
  )
}

function ProfilePanel({
  profile,
  setProfile,
}: {
  profile: HumanProfile
  setProfile: (profile: HumanProfile) => void
}) {
  const [uploadState, setUploadState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [uploadMessage, setUploadMessage] = useState(
    'Tải CV lên để trích xuất học vấn, kinh nghiệm, kỹ năng, công cụ, chứng chỉ, dự án và tín hiệu ngành.',
  )

  const setDimension = (dimension: DimensionKey, value: number) => {
    setProfile({
      ...profile,
      dimensions: {
        ...profile.dimensions,
        [dimension]: value,
      },
    })
  }

  const setPreference = (key: keyof HumanProfile['preferences'], value: number) => {
    setProfile({
      ...profile,
      preferences: {
        ...profile.preferences,
        [key]: value,
      },
    })
  }

  const toggleWorkStyle = (style: WorkStyle) => {
    const current = profile.preferences.workStyles
    const next = current.includes(style)
      ? current.filter((item) => item !== style)
      : [...current, style]

    setProfile({
      ...profile,
      preferences: {
        ...profile.preferences,
        workStyles: next,
      },
    })
  }

  const handleCvUpload = async (file: File) => {
    if (file.size > 4 * 1024 * 1024) {
      setUploadState('error')
      setUploadMessage('File quá lớn. Vui lòng dùng file dưới 4MB.')
      return
    }

    setUploadState('loading')
    setUploadMessage('Đang đọc CV bằng Gemini. Đề xuất nghề vẫn do engine deterministic tính từ bằng chứng đã trích xuất.')

    try {
      const dataUrl = await readFileAsDataUrl(file)
      const base64 = dataUrl.split(',')[1]
      const result = await fetch('/api/parse-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type || 'text/plain',
          data: base64,
        }),
      })
      const parsed = await parseCvResponse(result)

      if (!result.ok || !parsed.profile) {
        throw new Error(toFriendlyUploadError(parsed.error ?? 'Không đọc được CV.'))
      }

      setProfile({
        ...profile,
        name: parsed.profile.name ?? profile.name,
        headline: parsed.profile.headline ?? profile.headline,
        dimensions: {
          ...profile.dimensions,
          ...parsed.profile.dimensions,
        },
        preferences: {
          ...profile.preferences,
          workStyles:
            parsed.profile.preferences?.workStyles && parsed.profile.preferences.workStyles.length > 0
              ? parsed.profile.preferences.workStyles
              : profile.preferences.workStyles,
        },
        evidence:
          parsed.profile.evidence && parsed.profile.evidence.length > 0
            ? parsed.profile.evidence
            : profile.evidence,
        structuredEvidence: parsed.profile.structuredEvidence
          ? cloneStructuredEvidence(parsed.profile.structuredEvidence)
          : profile.structuredEvidence,
      })

      setUploadState('success')
      setUploadMessage(
        `Đã đọc CV và cập nhật bằng chứng nghề nghiệp. Kết quả đã được tính lại.${
          parsed.model ? ` Model: ${parsed.model}.` : ''
        }`,
      )
    } catch (error) {
      setUploadState('error')
      setUploadMessage(error instanceof Error ? error.message : 'Không đọc được CV.')
    }
  }

  const evidence = profile.structuredEvidence
  const skillPreview = compact([
    ...evidence.skills.technical,
    ...evidence.skills.business,
    ...evidence.skills.hard,
    ...evidence.skills.soft,
  ])

  return (
    <section className="panel profile-panel" id="profile" aria-labelledby="profile-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Hồ sơ bằng chứng</p>
          <h2 id="profile-title">Năng lực và CV</h2>
        </div>
        <SlidersHorizontal aria-hidden="true" size={20} />
      </div>

      <div className="identity-block">
        <strong>{profile.name}</strong>
        <span>{profile.headline}</span>
      </div>

      <label className="upload-zone">
        <UploadCloud aria-hidden="true" size={22} />
        <span>
          Đọc CV tự động
          <small>
            AI chỉ trích xuất dữ liệu. Engine xếp hạng nghề bằng công thức có thể kiểm tra lại.
          </small>
        </span>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          disabled={uploadState === 'loading'}
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) {
              void handleCvUpload(file)
            }
            event.currentTarget.value = ''
          }}
        />
      </label>
      <p className="upload-status" data-state={uploadState}>
        {uploadMessage}
      </p>

      <EvidenceSummary evidence={evidence} skillPreview={skillPreview} />

      <div className="slider-stack">
        {dimensionOrder.map((dimension) => {
          const label = dimensionLabels[dimension]
          return (
            <label className="range-control" key={dimension}>
              <span>
                {label.vi} <em>({label.en})</em>
              </span>
              <strong>{profile.dimensions[dimension]}</strong>
              <input
                type="range"
                min="0"
                max="100"
                value={profile.dimensions[dimension]}
                onChange={(event) => setDimension(dimension, Number(event.target.value))}
              />
            </label>
          )
        })}
      </div>

      <div className="preference-block">
        <h3>Ưu tiên nghề nghiệp</h3>
        <div className="mini-sliders">
          <PreferenceSlider
            label="Mức phù hợp làm từ xa"
            value={profile.preferences.remote}
            onChange={(value) => setPreference('remote', value)}
          />
          <PreferenceSlider
            label="Độ ổn định mong muốn"
            value={profile.preferences.stability}
            onChange={(value) => setPreference('stability', value)}
          />
          <PreferenceSlider
            label="Tốc độ tăng trưởng mong muốn"
            value={profile.preferences.growth}
            onChange={(value) => setPreference('growth', value)}
          />
          <PreferenceSlider
            label="Mức tự chủ trong công việc"
            value={profile.preferences.autonomy}
            onChange={(value) => setPreference('autonomy', value)}
          />
        </div>
      </div>

      <div className="style-grid" aria-label="Lựa chọn phong cách làm việc">
        {workStyleOptions.map((option) => (
          <button
            type="button"
            className="chip-button"
            aria-pressed={profile.preferences.workStyles.includes(option.id)}
            key={option.id}
            onClick={() => toggleWorkStyle(option.id)}
          >
            <CheckCircle2 aria-hidden="true" size={15} />
            <span>{option.vi}</span>
            <em>{option.en}</em>
          </button>
        ))}
      </div>
    </section>
  )
}

function EvidenceSummary({
  evidence,
  skillPreview,
}: {
  evidence: StructuredCvEvidence
  skillPreview: string[]
}) {
  return (
    <section className="evidence-card" aria-label="Bằng chứng trích xuất từ CV">
      <div>
        <strong>Ngành</strong>
        <span>{compact(evidence.industries).join(', ') || 'Chưa có tín hiệu ngành'}</span>
      </div>
      <div>
        <strong>Kỹ năng</strong>
        <span>{skillPreview.join(', ') || 'Chưa có kỹ năng cụ thể'}</span>
      </div>
      <div>
        <strong>Công cụ</strong>
        <span>{compact(evidence.tools).join(', ') || 'Chưa có công cụ'}</span>
      </div>
      <div>
        <strong>Kinh nghiệm</strong>
        <span>
          {evidence.experience
            .slice(0, 3)
            .map((item) => [item.role, item.company].filter(Boolean).join(' - '))
            .join(', ') || 'Chưa có kinh nghiệm'}
        </span>
      </div>
    </section>
  )
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => resolve(String(reader.result)))
    reader.addEventListener('error', () => reject(new Error('Không đọc được file trên trình duyệt.')))
    reader.readAsDataURL(file)
  })
}

function toFriendlyUploadError(message: string) {
  if (message.toLowerCase().includes('high demand') || message.includes('503')) {
    return 'Google Gemini đang quá tải tạm thời. Hãy thử lại sau vài phút hoặc đổi GEMINI_MODEL trong .env.local sang model khác.'
  }

  if (message.toLowerCase().includes('api key') || message.toLowerCase().includes('permission')) {
    return 'API key chưa đúng hoặc chưa có quyền dùng Gemini API. Kiểm tra GOOGLE_API_KEY trong .env.local.'
  }

  if (message.toLowerCase().includes('not found') && message.toLowerCase().includes('model')) {
    return 'Model Gemini hiện tại không dùng được. Hãy đổi GEMINI_MODEL trong .env.local, ví dụ gemini-2.0-flash.'
  }

  return message
}

function PreferenceSlider({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="mini-range">
      <span>{label}</span>
      <strong>{value}</strong>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}

function RecommendationPanel({
  profile,
  ranked,
}: {
  profile: HumanProfile
  ranked: ReturnType<typeof rankCareers>
}) {
  const top = ranked[0]
  const displayedCareers = ranked.slice(0, DISPLAYED_CAREER_COUNT)

  return (
    <section
      className="panel recommendation-panel"
      id="recommendations"
      aria-labelledby="recommendation-title"
    >
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Hệ thống hỗ trợ quyết định</p>
          <h2 id="recommendation-title">Khuyến nghị nghề nghiệp</h2>
        </div>
        <Gauge aria-hidden="true" size={20} />
      </div>

      <article className="top-career-card">
        <div className="career-score">
          <span>{top.overall}</span>
          <small>/100</small>
        </div>
        <div>
          <p className="eyebrow">Phù hợp nhất hiện tại</p>
          <h3>{top.career.titleVi}</h3>
          <p className="career-title-en">{top.career.title}</p>
        </div>
      </article>

      <div className="explain-grid">
        <ScoreBar label="Khớp bằng chứng CV" value={top.evidenceFit} tone="blue" />
        <ScoreBar label="Khớp ngành" value={top.evidence.domainMatch} tone="blue" />
        <ScoreBar label="Khớp kỹ năng" value={top.evidence.skillMatch} tone="green" />
        <ScoreBar label="Khớp kinh nghiệm" value={top.evidence.experienceMatch} tone="ink" />
        <ScoreBar label="Khớp công cụ" value={top.evidence.toolMatch} tone="amber" />
        <ScoreBar label="Độ tin cậy" value={top.confidence} tone="ink" />
        <ScoreBar label="Career DNA" value={top.compatibility} tone="blue" />
        <ScoreBar label="Cơ hội thị trường" value={top.opportunity} tone="amber" />
        <ScoreBar label="An toàn trước AI" value={top.aiResilience} tone="green" />
      </div>

      <section className="glossary-card" aria-labelledby="glossary-title">
        <h3 id="glossary-title">Từ điển nhanh</h3>
        <div className="term-list">
          {glossaryItems.map((item) => (
            <p key={item.term}>
              <strong>{item.term}</strong>
              <span>{item.vi}</span>
            </p>
          ))}
        </div>
      </section>

      <div className="explanation-list">
        {top.explanation.map((item) => (
          <p key={item}>
            <ChevronRight aria-hidden="true" size={16} />
            {item}
          </p>
        ))}
      </div>

      <div className="skill-gap-row">
        <div>
          <h3>Điểm mạnh có bằng chứng</h3>
          {top.evidence.strengths.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <div>
          <h3>Khoảng cách cần bù</h3>
          {top.evidence.gaps.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>

      <section className="career-list" aria-label="Danh sách nghề được xếp hạng">
        {displayedCareers.map((item, index) => (
          <article className="career-row" key={item.career.id}>
            <div className="rank-number">{index + 1}</div>
            <div>
              <h3>{item.career.titleVi}</h3>
              <p className="career-title-en">{item.career.title}</p>
              <p>{item.career.summary}</p>
              <div className="career-tags">
                <span>{categoryLabels[item.career.category] ?? item.career.category}</span>
                <span>Bằng chứng {item.evidenceFit}</span>
                <span>Tin cậy {item.confidence}</span>
                <span>AI {item.aiResilience}</span>
              </div>
            </div>
            <strong>{item.overall}</strong>
          </article>
        ))}
      </section>

      <section className="next-plan" aria-labelledby="next-plan-title">
        <div className="panel-heading panel-heading--small">
          <div>
            <p className="eyebrow">Kế hoạch hành động</p>
            <h2 id="next-plan-title">30 ngày tiếp theo</h2>
          </div>
          <Map aria-hidden="true" size={20} />
        </div>
        <div className="milestone-list">
          {top.career.nextMilestones.map((milestone) => (
            <p key={milestone}>
              <ArrowRight aria-hidden="true" size={16} />
              {milestone}
            </p>
          ))}
        </div>
        <p className="method-note">
          Kết quả được tính từ hồ sơ hiện tại của {profile.name}. Nếu thông tin đầu vào giống nhau,
          hệ thống sẽ tạo lại cùng một kết quả.
        </p>
      </section>
    </section>
  )
}

function JudgePage({ profile }: { profile: HumanProfile }) {
  const ranked = rankCareers(profile, careers)
  const auditRows = ranked.slice(0, AUDIT_ROW_COUNT)

  return (
    <main className="app-shell judge-shell">
      <TopNav />
      <section className="judge-hero">
        <p className="eyebrow">Chế độ giám khảo</p>
        <h1>Phương pháp trong 5 phút</h1>
        <p>
          AI có thể đọc CV, nhưng không được trực tiếp chọn nghề. Engine chấm điểm bằng các lớp
          bằng chứng: domain, kỹ năng, kinh nghiệm, học vấn, công cụ, sở thích, khả năng học, thị
          trường, triển vọng tương lai và khả năng chống chịu trước AI.
        </p>
      </section>

      <section className="architecture-flow" aria-label="Kiến trúc hệ thống">
        {[
          ['Người dùng', Users],
          ['CV có cấu trúc', FileText],
          ['Khớp domain', Network],
          ['Khớp kỹ năng', BarChart3],
          ['Khớp kinh nghiệm', BriefcaseBusiness],
          ['Career DNA', GitBranch],
          ['Động lực cá nhân', Sparkles],
          ['Khả năng học', LineChart],
          ['Tín hiệu thị trường', Target],
          ['Rủi ro AI', Cpu],
          ['Giải thích kết quả', Route],
          ['Xếp hạng đề xuất', Gauge],
        ].map(([label, Icon]) => {
          const FlowIcon = Icon as typeof Users
          return (
            <div className="flow-node" key={label as string}>
              <FlowIcon aria-hidden="true" size={18} />
              <span>{label as string}</span>
            </div>
          )
        })}
      </section>

      <section className="judge-grid">
        <MethodCard
          icon={FileText}
          title="Bằng chứng CV"
          body="Parser trích xuất học vấn, kinh nghiệm, kỹ năng, công cụ, chứng chỉ, ngôn ngữ, dự án và ngành. Những tín hiệu này được chấm riêng trước khi tính tổng."
          formula="Evidence Fit = domain*.28 + skill*.24 + experience*.17 + education*.08 + tool*.10 + interest*.08 + extra*.05 - mismatchPenalty"
        />
        <MethodCard
          icon={GitBranch}
          title="Mã năng lực nghề"
          body="Career DNA vẫn được dùng, nhưng không còn đủ để đẩy một nghề lên cao nếu CV thiếu bằng chứng ngành hoặc kỹ năng trực tiếp."
          formula="Compatibility = weighted avg(100 - abs(user_dimension - required_dimension))"
        />
        <MethodCard
          icon={Cpu}
          title="Cân bằng AI"
          body="Các nghề AI hoặc công nghệ bị phạt khi CV thiếu domain, kỹ năng hoặc công cụ liên quan. AI resilience không được phép áp đảo compatibility và evidence."
          formula="Mismatch penalty includes weak-domain and weak-skill penalties for AI/technology recommendations"
        />
        <MethodCard
          icon={Gauge}
          title="Logic đề xuất"
          body="Điểm tổng hợp ưu tiên bằng chứng và mức khớp nghề. Cơ hội thị trường chỉ là một lớp hỗ trợ, không phải động cơ xếp hạng chính."
          formula="Overall = evidence*.30 + DNA*.20 + motivation*.10 + learning*.12 + opportunity*.09 + AI*.06 + future*.05 + futureSuccess*.05 + resilience*.03"
        />
      </section>

      <section className="data-sources">
        <div className="panel-heading panel-heading--small">
          <div>
            <p className="eyebrow">Nguồn dữ liệu</p>
            <h2>Nguồn tham chiếu</h2>
          </div>
          <Layers3 aria-hidden="true" size={20} />
        </div>
        <div className="source-list">
          <a href="https://www.onetonline.org/" target="_blank" rel="noreferrer">
            O*NET Online
            <span>Năng lực, kỹ năng, nhiệm vụ và hoạt động công việc theo nghề.</span>
          </a>
          <a href="https://www.bls.gov/ooh/" target="_blank" rel="noreferrer">
            BLS Occupational Outlook Handbook
            <span>Triển vọng việc làm, mức lương, yêu cầu đào tạo và bối cảnh công việc.</span>
          </a>
          <a
            href="https://www.oecd.org/en/topics/artificial-intelligence.html"
            target="_blank"
            rel="noreferrer"
          >
            OECD AI & Labour Market Research
            <span>Nghiên cứu về AI, thay đổi kỹ năng và tác động lên thị trường lao động.</span>
          </a>
        </div>
      </section>

      <section className="audit-table" aria-labelledby="audit-title">
        <div className="panel-heading panel-heading--small">
          <div>
            <p className="eyebrow">Kiểm tra tính lặp lại</p>
            <h2 id="audit-title">Bảng điểm mẫu</h2>
          </div>
          <LockKeyhole aria-hidden="true" size={20} />
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Nghề</th>
                <th>Bằng chứng</th>
                <th>Domain</th>
                <th>Kỹ năng</th>
                <th>Kinh nghiệm</th>
                <th>Career DNA</th>
                <th>Tin cậy</th>
                <th>Tổng</th>
              </tr>
            </thead>
            <tbody>
              {auditRows.map((item) => (
                <tr key={item.career.id}>
                  <td>{item.career.titleVi}</td>
                  <td>{item.evidenceFit}</td>
                  <td>{item.evidence.domainMatch}</td>
                  <td>{item.evidence.skillMatch}</td>
                  <td>{item.evidence.experienceMatch}</td>
                  <td>{item.compatibility}</td>
                  <td>{item.confidence}</td>
                  <td>{item.overall}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}

function MethodCard({
  icon: Icon,
  title,
  body,
  formula,
}: {
  icon: typeof Brain
  title: string
  body: string
  formula: string
}) {
  return (
    <article className="method-card">
      <Icon aria-hidden="true" size={20} />
      <h2>{title}</h2>
      <p>{body}</p>
      <code>{formula}</code>
    </article>
  )
}

export default App
