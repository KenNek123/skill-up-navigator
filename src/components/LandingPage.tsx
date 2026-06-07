import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Compass, Target, TrendingUp } from 'lucide-react'
import { BrandLogo } from './ui/BrandLogo'
import { CTAButton } from './ui/CTAButton'
import { GlassCard } from './ui/GlassCard'

interface LandingPageProps {
  onStart: () => void
}

export function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#0a0e1a] bg-gradient-to-b from-[#0a0e1a] via-[#0f1420] to-[#0a0e1a]">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0e1a]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <span className="text-sm font-medium text-white/90">AI Career Navigator</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" className="text-white/70 hover:text-white transition-colors">
              Giới thiệu
            </a>
            <a href="#process" className="text-white/70 hover:text-white transition-colors">
              Quy trình
            </a>
            <a href="#faq" className="text-white/70 hover:text-white transition-colors">
              FAQ
            </a>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <BrandLogo size="xl" animated className="mx-auto mb-8" />
          </motion.div>

          <motion.h1
            className="text-5xl md:text-6xl font-bold text-white leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Khám phá hướng đi phù hợp
            <br />
            <span className="text-gradient">cho tương lai của bạn</span>
          </motion.h1>

          <motion.p
            className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Hệ thống AI giúp bạn hiểu rõ điểm mạnh, tiềm năng và những lựa chọn nghề nghiệp phù
            hợp với chính mình.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <CTAButton onClick={onStart} variant="primary" size="lg">
              <Compass size={20} />
              Bắt đầu chuyến đi
            </CTAButton>
          </motion.div>
        </div>
      </section>

      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-3xl font-bold text-center text-white mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Tại sao chọn AI Career Navigator
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: 'Phân tích chính xác',
                desc: 'Đánh giá toàn diện điểm mạnh và tiềm năng của bạn',
              },
              {
                icon: TrendingUp,
                title: 'Dựa trên dữ liệu',
                desc: 'Kết quả được tính toán từ thuật toán khoa học đáng tin cậy',
              },
              {
                icon: CheckCircle2,
                title: 'Lộ trình rõ ràng',
                desc: 'Gợi ý cụ thể giúp bạn phát triển sự nghiệp hiệu quả',
              },
            ].map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <GlassCard hover className="p-8 h-full">
                  <feature.icon className="w-12 h-12 text-cyan-400 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/60">{feature.desc}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="process" className="py-20 px-6 bg-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            className="text-3xl font-bold text-center text-white mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Quy trình hoạt động
          </motion.h2>

          <div className="space-y-6">
            {[
              { step: 1, title: 'Trả lời câu hỏi', desc: 'Hoàn thành bài đánh giá trong 10-15 phút' },
              { step: 2, title: 'Phân tích kết quả', desc: 'Hệ thống xử lý và tính toán phù hợp' },
              { step: 3, title: 'Nhận gợi ý', desc: 'Xem báo cáo chi tiết và lộ trình phát triển' },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15 }}
              >
                <GlassCard className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{item.title}</h3>
                      <p className="text-white/60">{item.desc}</p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            className="text-3xl font-bold text-center text-white mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Câu hỏi thường gặp
          </motion.h2>

          <div className="space-y-4">
            {[
              {
                q: 'Mất bao lâu để hoàn thành đánh giá?',
                a: 'Thường mất khoảng 10-15 phút để trả lời tất cả câu hỏi.',
              },
              {
                q: 'Kết quả có chính xác không?',
                a: 'Kết quả dựa trên thuật toán khoa học và dữ liệu thị trường lao động thực tế.',
              },
              {
                q: 'Có mất phí không?',
                a: 'Dịch vụ hoàn toàn miễn phí cho người dùng cá nhân.',
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <GlassCard className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">{item.q}</h3>
                  <p className="text-white/60">{item.a}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-6">Sẵn sàng khám phá tương lai?</h2>
            <p className="text-xl text-white/70 mb-8">
              Bắt đầu hành trình định hướng nghề nghiệp của bạn ngay hôm nay.
            </p>
            <CTAButton onClick={onStart} variant="primary" size="lg">
              <ArrowRight size={20} />
              Bắt đầu ngay
            </CTAButton>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
