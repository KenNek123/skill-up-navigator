import { motion } from 'framer-motion'
import {
  TrendingUp,
  Target,
  Award,
  Clock,
  DollarSign,
  Users,
  Briefcase,
  BookOpen,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import { BrandLogo } from './ui/BrandLogo'
import { GlassCard } from './ui/GlassCard'
import { CTAButton } from './ui/CTAButton'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'
import type { HumanProfile } from '../engine/types'
import type { rankCareers } from '../engine/scoring'

interface ResultPageProps {
  profile: HumanProfile
  ranked: ReturnType<typeof rankCareers>
  onRestart?: () => void
}

export function ResultPage({ profile, ranked, onRestart }: ResultPageProps) {
  const topCareer = ranked[0]
  const top5Careers = ranked.slice(0, 5)

  const radarData = [
    { skill: 'Phân tích', value: profile.dimensions.analyticalThinking },
    { skill: 'Sáng tạo', value: profile.dimensions.creativity },
    { skill: 'Giao tiếp', value: profile.dimensions.communication },
    { skill: 'Lãnh đạo', value: profile.dimensions.leadership },
    { skill: 'Kỹ thuật', value: profile.dimensions.technicalAffinity },
    { skill: 'Học hỏi', value: profile.dimensions.learningAgility },
  ]

  return (
    <div className="min-h-screen bg-[#0a0e1a] bg-gradient-to-b from-[#0a0e1a] via-[#0f1420] to-[#0a0e1a]">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0e1a]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <span className="text-sm font-medium text-white/90">AI Career Navigator</span>
          </a>
          {onRestart && (
            <CTAButton onClick={onRestart} variant="ghost" size="sm">
              Làm lại đánh giá
            </CTAButton>
          )}
        </div>
      </nav>

      <div className="pt-28 pb-20 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Hero Result Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <GlassCard className="p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-teal-500/10" />
              <div className="relative z-10 space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/20 border border-cyan-400/30">
                  <Award className="w-5 h-5 text-cyan-400" />
                  <span className="text-sm font-medium text-cyan-400">Nghề phù hợp nhất</span>
                </div>
                <h1 className="text-5xl font-bold text-white">{topCareer.career.titleVi}</h1>
                <p className="text-xl text-white/60">{topCareer.career.title}</p>
                <div className="flex items-center justify-center gap-8 pt-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gradient">{topCareer.overall}</div>
                    <div className="text-sm text-white/60 mt-1">Độ phù hợp</div>
                  </div>
                  <div className="w-px h-12 bg-white/10" />
                  <div className="text-center">
                    <div className="text-4xl font-bold text-cyan-400">{topCareer.confidence}</div>
                    <div className="text-sm text-white/60 mt-1">Độ tin cậy</div>
                  </div>
                  <div className="w-px h-12 bg-white/10" />
                  <div className="text-center">
                    <div className="text-4xl font-bold text-teal-400">{topCareer.aiResilience}</div>
                    <div className="text-sm text-white/60 mt-1">An toàn AI</div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Score Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Phân tích chi tiết</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <ScoreCard
                icon={Target}
                label="Khớp bằng chứng CV"
                value={topCareer.evidenceFit}
                color="cyan"
              />
              <ScoreCard
                icon={TrendingUp}
                label="Career DNA"
                value={topCareer.compatibility}
                color="teal"
              />
              <ScoreCard
                icon={Award}
                label="Cơ hội thị trường"
                value={topCareer.opportunity}
                color="cyan"
              />
            </div>
          </motion.div>

          {/* Skills Radar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-2 gap-6"
          >
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Năng lực tổng quan</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="skill" stroke="rgba(255,255,255,0.5)" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="rgba(255,255,255,0.3)" />
                  <Radar
                    name="Điểm số"
                    dataKey="value"
                    stroke="#22d3ee"
                    fill="#22d3ee"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </GlassCard>

            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold text-white mb-6">Điểm mạnh nổi bật</h3>
              <div className="space-y-3">
                {topCareer.evidence.strengths.slice(0, 5).map((strength, idx) => (
                  <motion.div
                    key={strength}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    <span className="text-white/80">{strength}</span>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Top 5 Careers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Top 5 nghề phù hợp</h2>
            <div className="space-y-4">
              {top5Careers.map((career, idx) => (
                <CareerCard key={career.career.id} career={career} rank={idx + 1} />
              ))}
            </div>
          </motion.div>

          {/* Roadmap */}
          {topCareer.career.intelligence && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">Lộ trình phát triển</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <RoadmapPhase
                  title="30 ngày đầu"
                  milestones={topCareer.career.intelligence.roadmap.thirtyDays}
                  icon={Clock}
                />
                <RoadmapPhase
                  title="60 ngày"
                  milestones={topCareer.career.intelligence.roadmap.sixtyDays}
                  icon={Target}
                />
                <RoadmapPhase
                  title="90 ngày"
                  milestones={topCareer.career.intelligence.roadmap.ninetyDays}
                  icon={TrendingUp}
                />
              </div>
            </motion.div>
          )}

          {/* Market Insights */}
          {topCareer.career.intelligence && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">Thị trường lao động</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MarketCard
                  icon={DollarSign}
                  label="Cơ hội remote"
                  value={topCareer.career.intelligence.laborMarket.remoteOpportunities}
                />
                <MarketCard
                  icon={Users}
                  label="Startup"
                  value={topCareer.career.intelligence.laborMarket.startupOpportunities}
                />
                <MarketCard
                  icon={Briefcase}
                  label="Corporate"
                  value={topCareer.career.intelligence.laborMarket.corporateOpportunities}
                />
                <MarketCard
                  icon={BookOpen}
                  label="Nhu cầu tương lai"
                  value={topCareer.career.intelligence.laborMarket.futureDemand}
                />
              </div>
            </motion.div>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center pt-8"
          >
            <GlassCard className="p-12">
              <h2 className="text-2xl font-bold text-white mb-4">
                Sẵn sàng bắt đầu hành trình?
              </h2>
              <p className="text-white/60 mb-8 max-w-2xl mx-auto">
                Kết quả này dựa trên phân tích toàn diện về năng lực và tiềm năng của bạn. Hãy bắt
                đầu từng bước theo lộ trình được đề xuất.
              </p>
              <div className="flex items-center justify-center gap-4">
                {onRestart && (
                  <CTAButton onClick={onRestart} variant="secondary">
                    Làm lại đánh giá
                  </CTAButton>
                )}
                <CTAButton onClick={() => window.print()} variant="primary">
                  <ArrowRight size={20} />
                  Tải báo cáo PDF
                </CTAButton>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function ScoreCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Target
  label: string
  value: number
  color: 'cyan' | 'teal'
}) {
  const colorClasses = {
    cyan: 'from-cyan-500/20 to-cyan-600/20 border-cyan-400/30',
    teal: 'from-teal-500/20 to-teal-600/20 border-teal-400/30',
  }

  return (
    <GlassCard className={`p-6 bg-gradient-to-br ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className={`w-8 h-8 text-${color}-400`} />
        <span className={`text-3xl font-bold text-${color}-400`}>{value}</span>
      </div>
      <div className="text-white/80 font-medium">{label}</div>
    </GlassCard>
  )
}

function CareerCard({
  career,
  rank,
}: {
  career: ReturnType<typeof rankCareers>[0]
  rank: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
    >
      <GlassCard hover className="p-6">
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white font-bold text-xl">
            {rank}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">{career.career.titleVi}</h3>
            <p className="text-sm text-white/50 mb-2">{career.career.title}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-cyan-400">Phù hợp: {career.overall}</span>
              <span className="text-white/40">•</span>
              <span className="text-teal-400">Tin cậy: {career.confidence}</span>
              <span className="text-white/40">•</span>
              <span className="text-white/60">AI: {career.aiResilience}</span>
            </div>
          </div>
          <div className="flex-shrink-0 text-3xl font-bold text-gradient">{career.overall}</div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

function RoadmapPhase({
  title,
  milestones,
  icon: Icon,
}: {
  title: string
  milestones: string[]
  icon: typeof Clock
}) {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-6 h-6 text-cyan-400" />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <ul className="space-y-2">
        {milestones.slice(0, 3).map((milestone, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-white/70">
            <ArrowRight className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <span>{milestone}</span>
          </li>
        ))}
      </ul>
    </GlassCard>
  )
}

function MarketCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof DollarSign
  label: string
  value: number
}) {
  return (
    <GlassCard className="p-6">
      <Icon className="w-8 h-8 text-cyan-400 mb-3" />
      <div className="text-2xl font-bold text-white mb-1">{value}/100</div>
      <div className="text-sm text-white/60">{label}</div>
    </GlassCard>
  )
}
