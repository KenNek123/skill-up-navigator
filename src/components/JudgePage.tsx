import {
  BarChart3,
  Brain,
  BriefcaseBusiness,
  Cpu,
  FileText,
  Gauge,
  GitBranch,
  Layers3,
  LineChart,
  LockKeyhole,
  Network,
  Route,
  Sparkles,
  Target,
  Users,
} from 'lucide-react'
import { careers } from '../data/careers'
import { rankCareers } from '../engine/scoring'
import type { HumanProfile } from '../engine/types'

const AUDIT_ROW_COUNT = 120

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

export function JudgePage({ profile }: { profile: HumanProfile }) {
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
