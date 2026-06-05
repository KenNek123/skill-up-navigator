import type {
  AiRisk,
  Career,
  CareerIntelligence,
  CareerKnowledgeGraph,
  DimensionKey,
  DimensionScores,
  EducationIntelligence,
  LaborMarketIntelligence,
  MarketSignal,
  RegionKey,
  SkillCategory,
  SkillIntelligence,
  WorkStyle,
} from '../engine/types'

type DimensionVector = Partial<DimensionScores>

type SectorBlueprint = {
  id: string
  title: string
  titleVi: string
  category: string
  summaryVi: string
  dna: DimensionVector
  workStyles: WorkStyle[]
  market: MarketSignal
  aiRisk: AiRisk
  learningCurve: number
  longTermGrowth: number
  coreSkills: string[]
  regions: RegionKey[]
}

type RoleBlueprint = {
  id: string
  title: string
  titleVi: string
  verbVi: string
  dna: DimensionVector
  workStyles: WorkStyle[]
  marketBias: number
  aiAutomationBias: number
  skills: string[]
}

type SpecializationBlueprint = {
  id: string
  title: string
  titleVi: string
  dna: DimensionVector
  marketBias: number
  aiAugmentationBias: number
  skills: string[]
}

const dimensionKeys: DimensionKey[] = [
  'logic',
  'analyticalThinking',
  'communication',
  'leadership',
  'adaptability',
  'creativity',
  'technicalAffinity',
  'collaboration',
  'learningAgility',
  'decisionMaking',
  'riskTolerance',
  'motivation',
]

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

const unique = <T,>(items: T[]) => Array.from(new Set(items))

const mergeWorkStyles = (...groups: WorkStyle[][]) =>
  unique(groups.flat()).slice(0, 3) as WorkStyle[]

const averageDefined = (values: Array<number | undefined>, fallback: number) => {
  const defined = values.filter((value): value is number => typeof value === 'number')
  return defined.length === 0
    ? fallback
    : defined.reduce((sum, value) => sum + value, 0) / defined.length
}

const mergeDna = (
  sector: DimensionVector,
  role: DimensionVector,
  specialization: DimensionVector,
): DimensionVector => {
  const merged: DimensionVector = {}

  for (const key of dimensionKeys) {
    const value = averageDefined([sector[key], role[key], specialization[key]], 0)
    if (value > 0) {
      merged[key] = clamp(value)
    }
  }

  return merged
}

const dominantDimensions = (dna: DimensionVector) =>
  (Object.entries(dna) as Array<[DimensionKey, number]>)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)
    .map(([dimension]) => dimension)

const nudgeMarket = (
  market: MarketSignal,
  roleBias: number,
  specializationBias: number,
): MarketSignal => ({
  demand: clamp(market.demand + roleBias + specializationBias),
  competition: clamp(market.competition + Math.round(roleBias / 3) - Math.round(specializationBias / 4)),
  growthOutlook: clamp(market.growthOutlook + specializationBias),
  salaryPotential: clamp(market.salaryPotential + Math.round((roleBias + specializationBias) / 2)),
  globalMobility: clamp(market.globalMobility + Math.round(specializationBias / 3)),
})

const nudgeAiRisk = (
  aiRisk: AiRisk,
  roleAutomationBias: number,
  specializationAugmentationBias: number,
): AiRisk => ({
  exposure: clamp(aiRisk.exposure + specializationAugmentationBias),
  automationRisk: clamp(aiRisk.automationRisk + roleAutomationBias),
  augmentationPotential: clamp(aiRisk.augmentationPotential + specializationAugmentationBias),
  humanJudgmentNeed: clamp(aiRisk.humanJudgmentNeed - Math.round(roleAutomationBias / 3)),
})

const toId = (parts: string[]) =>
  parts
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const sectorBlueprints: SectorBlueprint[] = [
  {
    id: 'technology',
    title: 'Technology',
    titleVi: 'Cong nghe',
    category: 'Technology',
    summaryVi: 'xay dung, van hanh va cai tien san pham so, nen tang va he sinh thai cong nghe',
    dna: { logic: 84, analyticalThinking: 82, technicalAffinity: 90, learningAgility: 86, adaptability: 78 },
    workStyles: ['deepWork', 'builder', 'structured'],
    market: { demand: 88, competition: 66, growthOutlook: 90, salaryPotential: 86, globalMobility: 88 },
    aiRisk: { exposure: 82, automationRisk: 34, augmentationPotential: 92, humanJudgmentNeed: 78 },
    learningCurve: 76,
    longTermGrowth: 90,
    coreSkills: ['software systems', 'cloud fundamentals', 'product thinking'],
    regions: ['vietnam', 'asean', 'asiaPacific', 'northAmerica', 'europe', 'globalRemote'],
  },
  {
    id: 'engineering',
    title: 'Engineering',
    titleVi: 'Ky thuat',
    category: 'Engineering',
    summaryVi: 'thiet ke, toi uu va dam bao do tin cay cua he thong vat ly, so va cong nghiep',
    dna: { logic: 88, analyticalThinking: 86, technicalAffinity: 84, decisionMaking: 78, collaboration: 72 },
    workStyles: ['structured', 'deepWork', 'builder'],
    market: { demand: 80, competition: 55, growthOutlook: 76, salaryPotential: 78, globalMobility: 72 },
    aiRisk: { exposure: 62, automationRisk: 28, augmentationPotential: 78, humanJudgmentNeed: 84 },
    learningCurve: 80,
    longTermGrowth: 78,
    coreSkills: ['engineering design', 'quality assurance', 'systems modeling'],
    regions: ['vietnam', 'asean', 'asiaPacific', 'middleEast', 'australia'],
  },
  {
    id: 'business',
    title: 'Business',
    titleVi: 'Kinh doanh',
    category: 'Business',
    summaryVi: 'phan tich thi truong, mo hinh doanh thu, khach hang va van hanh de tao tang truong',
    dna: { communication: 82, analyticalThinking: 78, decisionMaking: 80, leadership: 76, adaptability: 78 },
    workStyles: ['peopleFirst', 'advisor', 'ambiguous'],
    market: { demand: 78, competition: 68, growthOutlook: 75, salaryPotential: 80, globalMobility: 70 },
    aiRisk: { exposure: 68, automationRisk: 36, augmentationPotential: 80, humanJudgmentNeed: 80 },
    learningCurve: 60,
    longTermGrowth: 76,
    coreSkills: ['business analysis', 'market research', 'stakeholder management'],
    regions: ['vietnam', 'asean', 'asiaPacific', 'northAmerica', 'europe'],
  },
  {
    id: 'finance',
    title: 'Finance',
    titleVi: 'Tai chinh',
    category: 'Finance',
    summaryVi: 'quan ly von, rui ro, dau tu, ke hoach tai chinh va hieu qua kinh doanh',
    dna: { logic: 86, analyticalThinking: 90, decisionMaking: 78, riskTolerance: 70, communication: 70 },
    workStyles: ['structured', 'deepWork', 'advisor'],
    market: { demand: 76, competition: 70, growthOutlook: 72, salaryPotential: 88, globalMobility: 74 },
    aiRisk: { exposure: 72, automationRisk: 42, augmentationPotential: 82, humanJudgmentNeed: 76 },
    learningCurve: 72,
    longTermGrowth: 76,
    coreSkills: ['financial modeling', 'risk analysis', 'regulatory literacy'],
    regions: ['vietnam', 'asean', 'asiaPacific', 'northAmerica', 'europe', 'middleEast'],
  },
  {
    id: 'healthcare',
    title: 'Healthcare',
    titleVi: 'Y te',
    category: 'Healthcare',
    summaryVi: 'cham soc suc khoe, cai thien ket qua dieu tri, van hanh y te va an toan benh nhan',
    dna: { analyticalThinking: 80, communication: 82, collaboration: 86, decisionMaking: 84, motivation: 86 },
    workStyles: ['peopleFirst', 'structured', 'advisor'],
    market: { demand: 86, competition: 50, growthOutlook: 84, salaryPotential: 78, globalMobility: 66 },
    aiRisk: { exposure: 58, automationRisk: 20, augmentationPotential: 76, humanJudgmentNeed: 94 },
    learningCurve: 84,
    longTermGrowth: 86,
    coreSkills: ['clinical reasoning', 'patient communication', 'healthcare compliance'],
    regions: ['vietnam', 'asean', 'asiaPacific', 'northAmerica', 'europe', 'australia'],
  },
  {
    id: 'education',
    title: 'Education',
    titleVi: 'Giao duc',
    category: 'Education',
    summaryVi: 'thiet ke hoc tap, huong dan nguoi hoc, danh gia tien bo va phat trien nang luc',
    dna: { communication: 88, creativity: 74, collaboration: 82, adaptability: 78, motivation: 84 },
    workStyles: ['peopleFirst', 'structured', 'advisor'],
    market: { demand: 72, competition: 58, growthOutlook: 70, salaryPotential: 60, globalMobility: 66 },
    aiRisk: { exposure: 62, automationRisk: 30, augmentationPotential: 82, humanJudgmentNeed: 86 },
    learningCurve: 62,
    longTermGrowth: 72,
    coreSkills: ['instructional design', 'assessment design', 'learner coaching'],
    regions: ['vietnam', 'asean', 'asiaPacific', 'northAmerica', 'globalRemote'],
  },
  {
    id: 'research',
    title: 'Research',
    titleVi: 'Nghien cuu',
    category: 'Research',
    summaryVi: 'dat cau hoi, thiet ke phuong phap, phan tich bang chung va tao tri thuc moi',
    dna: { analyticalThinking: 92, logic: 86, learningAgility: 88, creativity: 78, motivation: 82 },
    workStyles: ['deepWork', 'structured', 'advisor'],
    market: { demand: 68, competition: 64, growthOutlook: 76, salaryPotential: 70, globalMobility: 78 },
    aiRisk: { exposure: 72, automationRisk: 26, augmentationPotential: 88, humanJudgmentNeed: 84 },
    learningCurve: 86,
    longTermGrowth: 80,
    coreSkills: ['research design', 'evidence synthesis', 'academic writing'],
    regions: ['vietnam', 'asiaPacific', 'northAmerica', 'europe', 'australia', 'globalRemote'],
  },
  {
    id: 'creative-arts',
    title: 'Creative Arts',
    titleVi: 'Nghe thuat sang tao',
    category: 'Creative Arts',
    summaryVi: 'tao y tuong, tac pham, trai nghiem va ngon ngu hinh anh co gia tri cam xuc',
    dna: { creativity: 92, communication: 76, adaptability: 80, motivation: 82, riskTolerance: 72 },
    workStyles: ['ambiguous', 'builder', 'deepWork'],
    market: { demand: 62, competition: 78, growthOutlook: 68, salaryPotential: 66, globalMobility: 74 },
    aiRisk: { exposure: 78, automationRisk: 44, augmentationPotential: 88, humanJudgmentNeed: 76 },
    learningCurve: 66,
    longTermGrowth: 72,
    coreSkills: ['visual storytelling', 'creative direction', 'portfolio development'],
    regions: ['vietnam', 'asean', 'asiaPacific', 'northAmerica', 'europe', 'globalRemote'],
  },
  {
    id: 'media-entertainment',
    title: 'Media & Entertainment',
    titleVi: 'Truyen thong va giai tri',
    category: 'Media',
    summaryVi: 'san xuat noi dung, quan tri kenh, cau chuyen thuong hieu va trai nghiem khan gia',
    dna: { creativity: 84, communication: 86, adaptability: 84, collaboration: 78, motivation: 76 },
    workStyles: ['ambiguous', 'peopleFirst', 'builder'],
    market: { demand: 70, competition: 78, growthOutlook: 74, salaryPotential: 68, globalMobility: 78 },
    aiRisk: { exposure: 78, automationRisk: 46, augmentationPotential: 88, humanJudgmentNeed: 72 },
    learningCurve: 58,
    longTermGrowth: 76,
    coreSkills: ['content strategy', 'audience analytics', 'production workflow'],
    regions: ['vietnam', 'asean', 'asiaPacific', 'northAmerica', 'globalRemote'],
  },
  {
    id: 'manufacturing',
    title: 'Manufacturing',
    titleVi: 'San xuat',
    category: 'Manufacturing',
    summaryVi: 'toi uu san xuat, chat luong, chuoi cung ung va cong nghe nha may',
    dna: { logic: 80, analyticalThinking: 78, technicalAffinity: 76, collaboration: 74, decisionMaking: 76 },
    workStyles: ['structured', 'builder', 'advisor'],
    market: { demand: 78, competition: 50, growthOutlook: 72, salaryPotential: 70, globalMobility: 62 },
    aiRisk: { exposure: 60, automationRisk: 48, augmentationPotential: 74, humanJudgmentNeed: 72 },
    learningCurve: 64,
    longTermGrowth: 72,
    coreSkills: ['lean operations', 'quality systems', 'process improvement'],
    regions: ['vietnam', 'asean', 'asiaPacific', 'middleEast'],
  },
  {
    id: 'government-public-service',
    title: 'Government & Public Service',
    titleVi: 'Nha nuoc va dich vu cong',
    category: 'Government',
    summaryVi: 'thiet ke chinh sach, van hanh dich vu cong, tuan thu va tao tac dong xa hoi',
    dna: { communication: 78, decisionMaking: 78, collaboration: 84, leadership: 76, motivation: 82 },
    workStyles: ['structured', 'peopleFirst', 'advisor'],
    market: { demand: 68, competition: 54, growthOutlook: 62, salaryPotential: 58, globalMobility: 52 },
    aiRisk: { exposure: 50, automationRisk: 26, augmentationPotential: 68, humanJudgmentNeed: 90 },
    learningCurve: 58,
    longTermGrowth: 68,
    coreSkills: ['policy analysis', 'public administration', 'stakeholder coordination'],
    regions: ['vietnam', 'asean', 'asiaPacific', 'europe', 'northAmerica'],
  },
  {
    id: 'law',
    title: 'Law',
    titleVi: 'Phap ly',
    category: 'Law',
    summaryVi: 'dien giai quy dinh, quan tri rui ro phap ly, dam phan va bao ve loi ich hop phap',
    dna: { logic: 86, analyticalThinking: 88, communication: 86, decisionMaking: 82, motivation: 78 },
    workStyles: ['structured', 'advisor', 'deepWork'],
    market: { demand: 70, competition: 72, growthOutlook: 66, salaryPotential: 84, globalMobility: 58 },
    aiRisk: { exposure: 74, automationRisk: 34, augmentationPotential: 82, humanJudgmentNeed: 92 },
    learningCurve: 82,
    longTermGrowth: 72,
    coreSkills: ['legal research', 'contract analysis', 'argument writing'],
    regions: ['vietnam', 'asean', 'asiaPacific', 'northAmerica', 'europe'],
  },
  {
    id: 'agriculture',
    title: 'Agriculture',
    titleVi: 'Nong nghiep',
    category: 'Agriculture',
    summaryVi: 'nang cao nang suat, chat luong, ben vung va cong nghe trong san xuat nong nghiep',
    dna: { analyticalThinking: 74, adaptability: 82, technicalAffinity: 70, decisionMaking: 76, motivation: 80 },
    workStyles: ['builder', 'structured', 'advisor'],
    market: { demand: 74, competition: 48, growthOutlook: 72, salaryPotential: 60, globalMobility: 54 },
    aiRisk: { exposure: 48, automationRisk: 38, augmentationPotential: 70, humanJudgmentNeed: 80 },
    learningCurve: 62,
    longTermGrowth: 74,
    coreSkills: ['crop systems', 'agritech tools', 'sustainability practices'],
    regions: ['vietnam', 'asean', 'asiaPacific', 'australia'],
  },
  {
    id: 'environment-climate',
    title: 'Environmental & Climate Sciences',
    titleVi: 'Moi truong va khi hau',
    category: 'Climate Industry',
    summaryVi: 'do luong, giam thieu va thich ung voi tac dong moi truong, khi hau va tai nguyen',
    dna: { analyticalThinking: 84, technicalAffinity: 76, motivation: 88, collaboration: 78, adaptability: 82 },
    workStyles: ['advisor', 'structured', 'peopleFirst'],
    market: { demand: 80, competition: 52, growthOutlook: 88, salaryPotential: 70, globalMobility: 76 },
    aiRisk: { exposure: 58, automationRisk: 24, augmentationPotential: 78, humanJudgmentNeed: 86 },
    learningCurve: 76,
    longTermGrowth: 88,
    coreSkills: ['climate risk', 'environmental data', 'sustainability reporting'],
    regions: ['vietnam', 'asean', 'asiaPacific', 'europe', 'northAmerica', 'australia'],
  },
  {
    id: 'hospitality-tourism',
    title: 'Hospitality & Tourism',
    titleVi: 'Du lich va dich vu',
    category: 'Hospitality',
    summaryVi: 'thiet ke trai nghiem khach hang, van hanh dich vu va phat trien diem den',
    dna: { communication: 88, collaboration: 82, adaptability: 84, motivation: 76, leadership: 70 },
    workStyles: ['peopleFirst', 'structured', 'advisor'],
    market: { demand: 72, competition: 58, growthOutlook: 74, salaryPotential: 58, globalMobility: 64 },
    aiRisk: { exposure: 44, automationRisk: 30, augmentationPotential: 66, humanJudgmentNeed: 86 },
    learningCurve: 48,
    longTermGrowth: 72,
    coreSkills: ['service operations', 'guest experience', 'destination marketing'],
    regions: ['vietnam', 'asean', 'asiaPacific', 'middleEast', 'europe'],
  },
  {
    id: 'sports',
    title: 'Sports',
    titleVi: 'The thao',
    category: 'Sports',
    summaryVi: 'phat trien van dong vien, su kien, du lieu hieu suat va kinh doanh the thao',
    dna: { motivation: 88, leadership: 76, collaboration: 82, analyticalThinking: 70, adaptability: 82 },
    workStyles: ['peopleFirst', 'structured', 'advisor'],
    market: { demand: 62, competition: 76, growthOutlook: 70, salaryPotential: 62, globalMobility: 62 },
    aiRisk: { exposure: 50, automationRisk: 24, augmentationPotential: 70, humanJudgmentNeed: 88 },
    learningCurve: 64,
    longTermGrowth: 70,
    coreSkills: ['performance analysis', 'coaching methods', 'event operations'],
    regions: ['vietnam', 'asean', 'asiaPacific', 'northAmerica', 'europe'],
  },
  {
    id: 'logistics-transportation',
    title: 'Logistics & Transportation',
    titleVi: 'Logistics va van tai',
    category: 'Logistics',
    summaryVi: 'toi uu dong hang, kho bai, van chuyen, chi phi va do tin cay chuoi cung ung',
    dna: { logic: 80, analyticalThinking: 82, decisionMaking: 78, collaboration: 76, adaptability: 78 },
    workStyles: ['structured', 'advisor', 'builder'],
    market: { demand: 82, competition: 54, growthOutlook: 76, salaryPotential: 70, globalMobility: 68 },
    aiRisk: { exposure: 58, automationRisk: 42, augmentationPotential: 78, humanJudgmentNeed: 74 },
    learningCurve: 58,
    longTermGrowth: 78,
    coreSkills: ['supply chain planning', 'route optimization', 'warehouse systems'],
    regions: ['vietnam', 'asean', 'asiaPacific', 'middleEast', 'europe'],
  },
  {
    id: 'construction',
    title: 'Construction',
    titleVi: 'Xay dung',
    category: 'Construction',
    summaryVi: 'lap ke hoach, thiet ke, thi cong va quan ly rui ro cho du an ha tang va nha o',
    dna: { logic: 78, decisionMaking: 82, leadership: 78, collaboration: 80, technicalAffinity: 74 },
    workStyles: ['structured', 'builder', 'peopleFirst'],
    market: { demand: 76, competition: 50, growthOutlook: 70, salaryPotential: 68, globalMobility: 56 },
    aiRisk: { exposure: 46, automationRisk: 30, augmentationPotential: 66, humanJudgmentNeed: 86 },
    learningCurve: 66,
    longTermGrowth: 72,
    coreSkills: ['project controls', 'site safety', 'construction planning'],
    regions: ['vietnam', 'asean', 'asiaPacific', 'middleEast', 'australia'],
  },
  {
    id: 'energy',
    title: 'Energy',
    titleVi: 'Nang luong',
    category: 'Energy',
    summaryVi: 'quan ly he thong nang luong, chuyen dich xanh, van hanh va dau tu ha tang',
    dna: { analyticalThinking: 84, technicalAffinity: 82, decisionMaking: 78, riskTolerance: 72, logic: 84 },
    workStyles: ['structured', 'advisor', 'builder'],
    market: { demand: 80, competition: 48, growthOutlook: 84, salaryPotential: 82, globalMobility: 70 },
    aiRisk: { exposure: 52, automationRisk: 26, augmentationPotential: 72, humanJudgmentNeed: 86 },
    learningCurve: 78,
    longTermGrowth: 86,
    coreSkills: ['energy systems', 'grid economics', 'renewable operations'],
    regions: ['vietnam', 'asean', 'asiaPacific', 'middleEast', 'europe', 'australia'],
  },
  {
    id: 'mining',
    title: 'Mining',
    titleVi: 'Khai khoang',
    category: 'Mining',
    summaryVi: 'khai thac tai nguyen, an toan, dia chat, van hanh mo va quan tri moi truong',
    dna: { analyticalThinking: 80, technicalAffinity: 78, riskTolerance: 78, decisionMaking: 78, adaptability: 76 },
    workStyles: ['structured', 'builder', 'advisor'],
    market: { demand: 66, competition: 42, growthOutlook: 58, salaryPotential: 78, globalMobility: 60 },
    aiRisk: { exposure: 46, automationRisk: 38, augmentationPotential: 64, humanJudgmentNeed: 82 },
    learningCurve: 72,
    longTermGrowth: 60,
    coreSkills: ['geology basics', 'mine safety', 'resource planning'],
    regions: ['vietnam', 'asiaPacific', 'middleEast', 'australia'],
  },
  {
    id: 'biotechnology',
    title: 'Biotechnology',
    titleVi: 'Cong nghe sinh hoc',
    category: 'Biotechnology',
    summaryVi: 'ket hop sinh hoc, du lieu va ky thuat de phat trien san pham, dieu tri va quy trinh moi',
    dna: { analyticalThinking: 90, logic: 84, technicalAffinity: 86, learningAgility: 88, motivation: 82 },
    workStyles: ['deepWork', 'structured', 'builder'],
    market: { demand: 78, competition: 60, growthOutlook: 88, salaryPotential: 82, globalMobility: 78 },
    aiRisk: { exposure: 66, automationRisk: 24, augmentationPotential: 86, humanJudgmentNeed: 86 },
    learningCurve: 88,
    longTermGrowth: 90,
    coreSkills: ['molecular biology', 'bioinformatics', 'lab validation'],
    regions: ['vietnam', 'asiaPacific', 'northAmerica', 'europe', 'australia'],
  },
  {
    id: 'space-industry',
    title: 'Space Industry',
    titleVi: 'Cong nghiep vu tru',
    category: 'Space Industry',
    summaryVi: 'phat trien ve tinh, du lieu trai dat, he thong hang khong vu tru va dich vu khong gian',
    dna: { logic: 92, analyticalThinking: 90, technicalAffinity: 92, learningAgility: 88, collaboration: 78 },
    workStyles: ['deepWork', 'structured', 'builder'],
    market: { demand: 64, competition: 68, growthOutlook: 86, salaryPotential: 88, globalMobility: 76 },
    aiRisk: { exposure: 58, automationRisk: 18, augmentationPotential: 82, humanJudgmentNeed: 92 },
    learningCurve: 94,
    longTermGrowth: 88,
    coreSkills: ['orbital systems', 'remote sensing', 'mission analysis'],
    regions: ['asiaPacific', 'northAmerica', 'europe', 'australia'],
  },
  {
    id: 'ai-industry',
    title: 'AI Industry',
    titleVi: 'Cong nghiep AI',
    category: 'AI Industry',
    summaryVi: 'xay dung, danh gia va dua AI vao san pham, quy trinh, to chuc va thi truong moi',
    dna: { logic: 88, analyticalThinking: 88, technicalAffinity: 94, learningAgility: 94, adaptability: 88 },
    workStyles: ['ambiguous', 'builder', 'deepWork'],
    market: { demand: 92, competition: 64, growthOutlook: 96, salaryPotential: 92, globalMobility: 92 },
    aiRisk: { exposure: 92, automationRisk: 18, augmentationPotential: 98, humanJudgmentNeed: 82 },
    learningCurve: 86,
    longTermGrowth: 96,
    coreSkills: ['machine learning literacy', 'AI product evaluation', 'model governance'],
    regions: ['vietnam', 'asean', 'asiaPacific', 'northAmerica', 'europe', 'globalRemote'],
  },
  {
    id: 'remote-economy',
    title: 'Remote Economy',
    titleVi: 'Kinh te lam viec tu xa',
    category: 'Remote Economy',
    summaryVi: 'van hanh cong viec, dich vu va san pham co the phan phoi qua thi truong toan cau',
    dna: { communication: 80, adaptability: 84, technicalAffinity: 78, learningAgility: 82, motivation: 78 },
    workStyles: ['deepWork', 'advisor', 'builder'],
    market: { demand: 82, competition: 76, growthOutlook: 84, salaryPotential: 76, globalMobility: 96 },
    aiRisk: { exposure: 78, automationRisk: 40, augmentationPotential: 90, humanJudgmentNeed: 76 },
    learningCurve: 58,
    longTermGrowth: 84,
    coreSkills: ['async collaboration', 'digital delivery', 'remote client management'],
    regions: ['vietnam', 'asean', 'asiaPacific', 'northAmerica', 'europe', 'globalRemote'],
  },
  {
    id: 'creator-economy',
    title: 'Creator Economy',
    titleVi: 'Kinh te nha sang tao',
    category: 'Creator Economy',
    summaryVi: 'xay dung noi dung, cong dong, san pham so, thuong hieu ca nhan va doanh thu truc tiep',
    dna: { creativity: 92, communication: 84, adaptability: 90, riskTolerance: 82, motivation: 86 },
    workStyles: ['ambiguous', 'builder', 'peopleFirst'],
    market: { demand: 74, competition: 86, growthOutlook: 86, salaryPotential: 72, globalMobility: 90 },
    aiRisk: { exposure: 82, automationRisk: 44, augmentationPotential: 92, humanJudgmentNeed: 78 },
    learningCurve: 54,
    longTermGrowth: 86,
    coreSkills: ['audience building', 'content operations', 'monetization strategy'],
    regions: ['vietnam', 'asean', 'asiaPacific', 'northAmerica', 'globalRemote'],
  },
  {
    id: 'freelance-gig-economy',
    title: 'Freelance & Gig Economy',
    titleVi: 'Freelance va gig economy',
    category: 'Freelance Economy',
    summaryVi: 'ban ky nang, quan tri khach hang, lap gia, giao hang va xay dung dong tien doc lap',
    dna: { communication: 80, riskTolerance: 82, adaptability: 86, motivation: 84 },
    workStyles: ['ambiguous', 'advisor', 'builder'],
    market: { demand: 76, competition: 84, growthOutlook: 82, salaryPotential: 70, globalMobility: 92 },
    aiRisk: { exposure: 76, automationRisk: 48, augmentationPotential: 88, humanJudgmentNeed: 72 },
    learningCurve: 52,
    longTermGrowth: 82,
    coreSkills: ['client acquisition', 'proposal writing', 'service packaging'],
    regions: ['vietnam', 'asean', 'asiaPacific', 'globalRemote'],
  },
  {
    id: 'digital-economy',
    title: 'Digital Economy',
    titleVi: 'Kinh te so',
    category: 'Digital Economy',
    summaryVi: 'thuong mai dien tu, nen tang, du lieu, tu dong hoa va mo hinh doanh thu so',
    dna: { analyticalThinking: 82, technicalAffinity: 84, adaptability: 86, decisionMaking: 76, creativity: 76 },
    workStyles: ['builder', 'advisor', 'ambiguous'],
    market: { demand: 86, competition: 72, growthOutlook: 90, salaryPotential: 80, globalMobility: 86 },
    aiRisk: { exposure: 80, automationRisk: 42, augmentationPotential: 92, humanJudgmentNeed: 74 },
    learningCurve: 60,
    longTermGrowth: 90,
    coreSkills: ['digital analytics', 'platform operations', 'growth experimentation'],
    regions: ['vietnam', 'asean', 'asiaPacific', 'northAmerica', 'europe', 'globalRemote'],
  },
  {
    id: 'future-emerging-jobs',
    title: 'Future & Emerging Jobs',
    titleVi: 'Nghe tuong lai va moi noi',
    category: 'Future Jobs',
    summaryVi: 'lam viec o giao diem cua cong nghe, xa hoi, thi truong moi va nhu cau chua dinh hinh',
    dna: { adaptability: 94, learningAgility: 94, creativity: 86, technicalAffinity: 84, riskTolerance: 82 },
    workStyles: ['ambiguous', 'builder', 'advisor'],
    market: { demand: 76, competition: 58, growthOutlook: 94, salaryPotential: 82, globalMobility: 84 },
    aiRisk: { exposure: 78, automationRisk: 22, augmentationPotential: 92, humanJudgmentNeed: 84 },
    learningCurve: 78,
    longTermGrowth: 94,
    coreSkills: ['trend sensing', 'rapid prototyping', 'scenario planning'],
    regions: ['vietnam', 'asean', 'asiaPacific', 'northAmerica', 'europe', 'globalRemote'],
  },
  {
    id: 'startup-entrepreneurship',
    title: 'Startup & Entrepreneurship',
    titleVi: 'Khoi nghiep',
    category: 'Startup Careers',
    summaryVi: 'phat hien van de, tao san pham, go-to-market, huy dong nguon luc va tang truong',
    dna: { leadership: 86, decisionMaking: 86, riskTolerance: 90, creativity: 84, adaptability: 92, motivation: 90 },
    workStyles: ['ambiguous', 'builder', 'peopleFirst'],
    market: { demand: 70, competition: 82, growthOutlook: 88, salaryPotential: 88, globalMobility: 82 },
    aiRisk: { exposure: 78, automationRisk: 24, augmentationPotential: 90, humanJudgmentNeed: 88 },
    learningCurve: 76,
    longTermGrowth: 90,
    coreSkills: ['customer discovery', 'business model design', 'fundraising basics'],
    regions: ['vietnam', 'asean', 'asiaPacific', 'northAmerica', 'globalRemote'],
  },
  {
    id: 'family-business',
    title: 'Family Business',
    titleVi: 'Kinh doanh gia dinh',
    category: 'Family Business Paths',
    summaryVi: 'ke thua, hien dai hoa, quan tri quan he va mo rong doanh nghiep gia dinh',
    dna: { leadership: 78, communication: 82, decisionMaking: 80, adaptability: 78, motivation: 82 },
    workStyles: ['peopleFirst', 'structured', 'builder'],
    market: { demand: 66, competition: 44, growthOutlook: 66, salaryPotential: 70, globalMobility: 48 },
    aiRisk: { exposure: 54, automationRisk: 30, augmentationPotential: 72, humanJudgmentNeed: 86 },
    learningCurve: 52,
    longTermGrowth: 70,
    coreSkills: ['operations modernization', 'succession planning', 'local market strategy'],
    regions: ['vietnam', 'asean', 'asiaPacific'],
  },
  {
    id: 'vocational-trades',
    title: 'Vocational & Trades',
    titleVi: 'Nghe va tay nghe',
    category: 'Trade Careers',
    summaryVi: 'ung dung ky nang thuc hanh, tieu chuan an toan, chat luong va dich vu truc tiep',
    dna: { technicalAffinity: 76, motivation: 82, adaptability: 76, decisionMaking: 72, collaboration: 72 },
    workStyles: ['structured', 'builder', 'peopleFirst'],
    market: { demand: 82, competition: 42, growthOutlook: 72, salaryPotential: 62, globalMobility: 52 },
    aiRisk: { exposure: 38, automationRisk: 26, augmentationPotential: 58, humanJudgmentNeed: 84 },
    learningCurve: 54,
    longTermGrowth: 72,
    coreSkills: ['hands-on diagnostics', 'tool safety', 'service quality'],
    regions: ['vietnam', 'asean', 'asiaPacific', 'australia'],
  },
  {
    id: 'academic-careers',
    title: 'Academic Careers',
    titleVi: 'Hoc thuat',
    category: 'Academic Careers',
    summaryVi: 'giang day, nghien cuu, xuat ban, huong dan va dong gop vao cong dong tri thuc',
    dna: { analyticalThinking: 90, communication: 82, learningAgility: 88, motivation: 86, creativity: 76 },
    workStyles: ['deepWork', 'structured', 'advisor'],
    market: { demand: 60, competition: 76, growthOutlook: 66, salaryPotential: 62, globalMobility: 72 },
    aiRisk: { exposure: 70, automationRisk: 28, augmentationPotential: 86, humanJudgmentNeed: 88 },
    learningCurve: 90,
    longTermGrowth: 70,
    coreSkills: ['academic research', 'teaching design', 'grant writing'],
    regions: ['vietnam', 'asiaPacific', 'northAmerica', 'europe', 'australia'],
  },
  {
    id: 'non-profit-international',
    title: 'Non-Profit & International Development',
    titleVi: 'Phi loi nhuan va phat trien quoc te',
    category: 'Non-Profit Careers',
    summaryVi: 'thiet ke chuong trinh, do luong tac dong, quan tri tai tro va phoi hop da ben',
    dna: { communication: 84, collaboration: 88, motivation: 90, adaptability: 82, leadership: 76 },
    workStyles: ['peopleFirst', 'advisor', 'structured'],
    market: { demand: 64, competition: 62, growthOutlook: 68, salaryPotential: 56, globalMobility: 76 },
    aiRisk: { exposure: 52, automationRisk: 24, augmentationPotential: 70, humanJudgmentNeed: 90 },
    learningCurve: 58,
    longTermGrowth: 70,
    coreSkills: ['program design', 'impact measurement', 'donor communication'],
    regions: ['vietnam', 'asean', 'asiaPacific', 'europe', 'northAmerica', 'middleEast'],
  },
  {
    id: 'military-defense',
    title: 'Military & Defense',
    titleVi: 'Quan su va quoc phong',
    category: 'Military',
    summaryVi: 'lap ke hoach nhiem vu, an ninh, hau can, cong nghe quoc phong va quan tri rui ro',
    dna: { decisionMaking: 88, leadership: 84, riskTolerance: 86, collaboration: 84, adaptability: 82 },
    workStyles: ['structured', 'peopleFirst', 'advisor'],
    market: { demand: 66, competition: 44, growthOutlook: 64, salaryPotential: 64, globalMobility: 42 },
    aiRisk: { exposure: 56, automationRisk: 24, augmentationPotential: 72, humanJudgmentNeed: 94 },
    learningCurve: 76,
    longTermGrowth: 68,
    coreSkills: ['mission planning', 'security operations', 'crisis response'],
    regions: ['vietnam', 'asean', 'asiaPacific', 'northAmerica', 'europe'],
  },
  {
    id: 'cross-border-nomad',
    title: 'Cross-Border & Nomad Careers',
    titleVi: 'Nghe xuyen bien gioi va du muc so',
    category: 'Nomad Careers',
    summaryVi: 'ket hop ky nang so, khach hang quoc te, tu chu dia diem va phap ly xuyen bien gioi',
    dna: { adaptability: 92, communication: 84, riskTolerance: 82, technicalAffinity: 78, motivation: 82 },
    workStyles: ['ambiguous', 'deepWork', 'advisor'],
    market: { demand: 74, competition: 80, growthOutlook: 84, salaryPotential: 76, globalMobility: 98 },
    aiRisk: { exposure: 76, automationRisk: 42, augmentationPotential: 88, humanJudgmentNeed: 76 },
    learningCurve: 56,
    longTermGrowth: 84,
    coreSkills: ['cross-border compliance', 'remote sales', 'international client delivery'],
    regions: ['vietnam', 'asean', 'asiaPacific', 'northAmerica', 'europe', 'globalRemote'],
  },
]

const roleBlueprints: RoleBlueprint[] = [
  {
    id: 'analyst',
    title: 'Analyst',
    titleVi: 'Chuyen vien phan tich',
    verbVi: 'phan tich du lieu, van de va bang chung',
    dna: { analyticalThinking: 90, logic: 84, communication: 70, decisionMaking: 72 },
    workStyles: ['structured', 'deepWork', 'advisor'],
    marketBias: 4,
    aiAutomationBias: 2,
    skills: ['analytics', 'structured problem solving', 'insight communication'],
  },
  {
    id: 'strategist',
    title: 'Strategist',
    titleVi: 'Chuyen gia chien luoc',
    verbVi: 'thiet ke lua chon chien luoc va dinh huong dai han',
    dna: { analyticalThinking: 84, decisionMaking: 88, communication: 82, leadership: 78 },
    workStyles: ['advisor', 'ambiguous', 'peopleFirst'],
    marketBias: 2,
    aiAutomationBias: -6,
    skills: ['strategy design', 'competitive analysis', 'executive storytelling'],
  },
  {
    id: 'manager',
    title: 'Manager',
    titleVi: 'Quan ly',
    verbVi: 'quan ly nguoi, muc tieu, nguon luc va ket qua',
    dna: { leadership: 88, communication: 84, collaboration: 84, decisionMaking: 82 },
    workStyles: ['peopleFirst', 'structured', 'advisor'],
    marketBias: 0,
    aiAutomationBias: -8,
    skills: ['team leadership', 'planning', 'performance management'],
  },
  {
    id: 'engineer',
    title: 'Engineer',
    titleVi: 'Ky su',
    verbVi: 'thiet ke, xay dung va toi uu he thong',
    dna: { logic: 90, technicalAffinity: 90, analyticalThinking: 86, learningAgility: 80 },
    workStyles: ['deepWork', 'builder', 'structured'],
    marketBias: 6,
    aiAutomationBias: -4,
    skills: ['technical design', 'debugging', 'systems thinking'],
  },
  {
    id: 'consultant',
    title: 'Consultant',
    titleVi: 'Tu van',
    verbVi: 'chan doan van de, de xuat giai phap va dong hanh trien khai',
    dna: { communication: 88, analyticalThinking: 82, adaptability: 84, collaboration: 80 },
    workStyles: ['advisor', 'peopleFirst', 'ambiguous'],
    marketBias: 1,
    aiAutomationBias: -4,
    skills: ['client discovery', 'solution design', 'facilitation'],
  },
  {
    id: 'designer',
    title: 'Designer',
    titleVi: 'Nha thiet ke',
    verbVi: 'tao trai nghiem, he thong va giai phap lay nguoi dung lam trung tam',
    dna: { creativity: 90, communication: 78, adaptability: 82, collaboration: 76 },
    workStyles: ['builder', 'ambiguous', 'peopleFirst'],
    marketBias: 0,
    aiAutomationBias: 6,
    skills: ['design thinking', 'prototyping', 'user empathy'],
  },
  {
    id: 'researcher',
    title: 'Researcher',
    titleVi: 'Nha nghien cuu',
    verbVi: 'thiet ke nghien cuu, kiem chung gia thuyet va tong hop tri thuc',
    dna: { analyticalThinking: 94, logic: 86, learningAgility: 90, motivation: 82 },
    workStyles: ['deepWork', 'structured', 'advisor'],
    marketBias: -1,
    aiAutomationBias: -2,
    skills: ['research methods', 'literature review', 'evidence synthesis'],
  },
  {
    id: 'operator',
    title: 'Operations Specialist',
    titleVi: 'Chuyen vien van hanh',
    verbVi: 'thiet ke quy trinh, giam sat van hanh va cai tien hieu suat',
    dna: { decisionMaking: 78, collaboration: 78, analyticalThinking: 76, adaptability: 76 },
    workStyles: ['structured', 'advisor', 'builder'],
    marketBias: 3,
    aiAutomationBias: 4,
    skills: ['process mapping', 'operations metrics', 'continuous improvement'],
  },
  {
    id: 'educator',
    title: 'Educator',
    titleVi: 'Nguoi huan luyen/giao duc',
    verbVi: 'huong dan, thiet ke hoc tap va phat trien nang luc',
    dna: { communication: 90, collaboration: 84, motivation: 86, creativity: 74 },
    workStyles: ['peopleFirst', 'structured', 'advisor'],
    marketBias: -2,
    aiAutomationBias: -2,
    skills: ['learning design', 'coaching', 'assessment'],
  },
  {
    id: 'entrepreneur',
    title: 'Entrepreneur',
    titleVi: 'Nha khoi nghiep',
    verbVi: 'phat hien co hoi, tao san pham va xay dung mo hinh kinh doanh',
    dna: { riskTolerance: 92, adaptability: 92, leadership: 84, creativity: 86, motivation: 90 },
    workStyles: ['ambiguous', 'builder', 'peopleFirst'],
    marketBias: 2,
    aiAutomationBias: -8,
    skills: ['customer discovery', 'go-to-market', 'business modeling'],
  },
]

const specializationBlueprints: SpecializationBlueprint[] = [
  {
    id: 'ai-automation',
    title: 'AI Automation',
    titleVi: 'Tu dong hoa AI',
    dna: { technicalAffinity: 92, learningAgility: 88, analyticalThinking: 84 },
    marketBias: 10,
    aiAugmentationBias: 12,
    skills: ['AI workflow design', 'prompt engineering', 'automation governance'],
  },
  {
    id: 'data-intelligence',
    title: 'Data Intelligence',
    titleVi: 'Tri tue du lieu',
    dna: { analyticalThinking: 92, logic: 86, technicalAffinity: 82 },
    marketBias: 8,
    aiAugmentationBias: 8,
    skills: ['data modeling', 'dashboarding', 'statistical reasoning'],
  },
  {
    id: 'customer-experience',
    title: 'Customer Experience',
    titleVi: 'Trai nghiem khach hang',
    dna: { communication: 88, collaboration: 82, creativity: 76 },
    marketBias: 3,
    aiAugmentationBias: 4,
    skills: ['customer journey mapping', 'service design', 'voice of customer'],
  },
  {
    id: 'risk-compliance',
    title: 'Risk & Compliance',
    titleVi: 'Rui ro va tuan thu',
    dna: { decisionMaking: 84, analyticalThinking: 86, logic: 82, riskTolerance: 74 },
    marketBias: 4,
    aiAugmentationBias: 2,
    skills: ['risk controls', 'compliance mapping', 'audit readiness'],
  },
  {
    id: 'growth-commercial',
    title: 'Growth & Commercial',
    titleVi: 'Tang truong va thuong mai',
    dna: { communication: 82, decisionMaking: 82, adaptability: 84, creativity: 78 },
    marketBias: 6,
    aiAugmentationBias: 6,
    skills: ['growth experiments', 'pricing', 'market positioning'],
  },
  {
    id: 'sustainability',
    title: 'Sustainability',
    titleVi: 'Ben vung',
    dna: { motivation: 88, analyticalThinking: 82, collaboration: 80 },
    marketBias: 7,
    aiAugmentationBias: 4,
    skills: ['ESG reporting', 'impact measurement', 'sustainable operations'],
  },
  {
    id: 'security-trust',
    title: 'Security & Trust',
    titleVi: 'An toan va tin cay',
    dna: { logic: 88, analyticalThinking: 88, technicalAffinity: 86, decisionMaking: 82 },
    marketBias: 8,
    aiAugmentationBias: 6,
    skills: ['threat modeling', 'security controls', 'trust governance'],
  },
  {
    id: 'product-innovation',
    title: 'Product Innovation',
    titleVi: 'Doi moi san pham',
    dna: { creativity: 86, decisionMaking: 82, collaboration: 82, adaptability: 88 },
    marketBias: 5,
    aiAugmentationBias: 8,
    skills: ['product discovery', 'rapid prototyping', 'roadmapping'],
  },
]

const regionalOpportunity = (regions: RegionKey[], score: number) => {
  const allRegions: RegionKey[] = [
    'vietnam',
    'asean',
    'asiaPacific',
    'europe',
    'northAmerica',
    'middleEast',
    'australia',
    'globalRemote',
  ]

  return Object.fromEntries(
    allRegions.map((region) => [region, clamp(score + (regions.includes(region) ? 8 : -8))]),
  ) as Partial<Record<RegionKey, number>>
}

const skillCategoryFor = (skill: string): SkillCategory => {
  const lower = skill.toLowerCase()
  if (lower.includes('ai') || lower.includes('prompt') || lower.includes('automation')) return 'ai'
  if (lower.includes('data') || lower.includes('analytics') || lower.includes('model')) return 'digital'
  if (lower.includes('research') || lower.includes('evidence')) return 'research'
  if (lower.includes('design') || lower.includes('story') || lower.includes('creative')) return 'creative'
  if (lower.includes('leadership') || lower.includes('coaching')) return 'leadership'
  if (lower.includes('client') || lower.includes('communication') || lower.includes('customer')) {
    return 'communication'
  }
  if (lower.includes('strategy') || lower.includes('business') || lower.includes('market')) return 'business'
  if (lower.includes('risk') || lower.includes('compliance') || lower.includes('security')) return 'industry'
  return 'transferable'
}

const buildSkillIntelligence = (
  skillNames: string[],
  importanceBase: number,
  demandBase: number,
  learningCurve: number,
): SkillIntelligence[] =>
  unique(skillNames).map((name, index) => ({
    name,
    category: skillCategoryFor(name),
    difficulty: clamp(learningCurve + index * 3 - 8),
    importance: clamp(importanceBase + index * 2),
    demand: clamp(demandBase + index * 2),
    learningTimeWeeks: clamp(4 + learningCurve / 8 + index * 2),
    careerImpact: clamp(importanceBase + demandBase / 4),
    futureRelevance: clamp(demandBase + 8),
  }))

const buildLaborMarket = (
  sector: SectorBlueprint,
  market: MarketSignal,
): LaborMarketIntelligence => ({
  currentDemand: market.demand,
  futureDemand: clamp((market.demand + market.growthOutlook) / 2 + 6),
  talentShortage: clamp(market.demand - market.competition / 2 + 18),
  talentSurplus: clamp(market.competition - market.demand / 2),
  growthRate: market.growthOutlook,
  industryMomentum: clamp((market.growthOutlook + sector.longTermGrowth) / 2),
  hiringTrends: clamp(market.demand * 0.55 + market.growthOutlook * 0.45),
  globalOpportunities: market.globalMobility,
  regionalOpportunities: regionalOpportunity(sector.regions, market.globalMobility),
  remoteOpportunities: clamp(market.globalMobility + (sector.regions.includes('globalRemote') ? 10 : -4)),
  freelanceOpportunities: clamp(market.globalMobility + market.competition / 4),
  contractOpportunities: clamp(market.demand + 4),
  startupOpportunities: clamp(sector.longTermGrowth + market.salaryPotential / 6),
  corporateOpportunities: clamp(market.demand + market.salaryPotential / 8),
  governmentOpportunities: clamp(sector.category.includes('Government') ? 88 : 48 + market.demand / 5),
  internationalOpportunities: clamp(market.globalMobility + 4),
})

const buildEducation = (
  sector: SectorBlueprint,
  role: RoleBlueprint,
  specialization: SpecializationBlueprint,
): EducationIntelligence => ({
  degrees: [
    `${sector.title} or related degree`,
    'Business, data, engineering or social science foundation depending on entry path',
  ],
  alternativeDegrees: ['Liberal arts with strong portfolio', 'Vocational diploma plus applied projects'],
  bootcamps: [`${specialization.title} bootcamp`, `${role.title} intensive program`],
  onlineCourses: [
    `${sector.title} fundamentals`,
    `${specialization.title} applied course`,
    `${role.title} case-practice course`,
  ],
  selfTaughtPaths: [
    'Build a public portfolio with 3 applied projects',
    'Study one reference book, one course, and one real case per month',
  ],
  certifications: [`Certified ${specialization.title} Practitioner`, `${sector.title} Foundation Certificate`],
  microCredentials: ['AI-assisted workflow badge', 'Data literacy badge', 'Communication for work badge'],
  professionalLicenses:
    sector.category === 'Healthcare' || sector.category === 'Law'
      ? [`Local ${sector.title} professional license`]
      : ['Role-specific license if regulated locally'],
  industryQualifications: [`${sector.title} industry qualification`, `${specialization.title} portfolio review`],
  learningTracks: [
    `${sector.title} basics -> ${role.title} practice -> ${specialization.title} specialization`,
  ],
  learningSequences: [
    'Foundation knowledge',
    'Tools and methods',
    'Portfolio project',
    'Feedback from practitioner',
    'Internship or client simulation',
  ],
  learningPriorities: [
    ...specialization.skills.slice(0, 2),
    ...role.skills.slice(0, 2),
    ...sector.coreSkills.slice(0, 2),
  ],
  fastestRoutes: ['Pick one niche, copy a real workflow, ship a small project in 30 days'],
  costEfficientRoutes: ['Use open courses, public datasets, volunteer projects and mentor feedback'],
  effectiveRoutes: ['Combine course learning, case practice, portfolio proof and practitioner review'],
})

const buildGraph = (
  sector: SectorBlueprint,
  role: RoleBlueprint,
  specialization: SpecializationBlueprint,
): CareerKnowledgeGraph => ({
  parentCareers: [sector.title, role.title],
  childCareers: [
    `${specialization.title} Junior ${role.title}`,
    `${specialization.title} Senior ${role.title}`,
    `${specialization.title} Lead ${role.title}`,
  ],
  adjacentCareers: [
    `${sector.title} ${role.title}`,
    `${specialization.title} Consultant`,
    `${specialization.title} Operations Specialist`,
  ],
  alternativeCareers: [
    `${sector.title} Analyst`,
    `${sector.title} Product Specialist`,
    `${specialization.title} Program Manager`,
  ],
  transitionCareers: [
    `Junior ${role.title}`,
    `${sector.title} Coordinator`,
    `${specialization.title} Associate`,
  ],
  careerClusters: [sector.category, specialization.title, role.title],
  industryFamilies: [sector.title, 'Global Careers', 'Hybrid Jobs'],
  futureEvolutions: [
    `AI-augmented ${role.title}`,
    `${specialization.title} Platform Lead`,
    `${sector.title} Transformation Partner`,
  ],
  careerSimilarities: [
    `Shares analytical and communication patterns with ${specialization.title} consulting`,
    `Shares domain context with ${sector.title} operations`,
  ],
  skillOverlaps: unique([...sector.coreSkills, ...role.skills, ...specialization.skills]).slice(0, 8),
  migrationPaths: [
    `From ${sector.title} coordinator to ${role.title}`,
    `From ${role.title} to ${specialization.title} lead`,
  ],
  upgradePaths: [
    `Add ${specialization.title} depth`,
    'Add leadership responsibility',
    'Add international portfolio proof',
  ],
  pivotPaths: [
    `Pivot to ${specialization.title} consulting`,
    `Pivot to ${sector.title} product or operations`,
  ],
  specializations: [specialization.title, `${specialization.title} Governance`, `${specialization.title} Strategy`],
  generalizations: [sector.title, role.title, 'Business and technology transformation'],
})

const buildRoadmap = (
  sector: SectorBlueprint,
  role: RoleBlueprint,
  specialization: SpecializationBlueprint,
  milestones: string[],
) => ({
  thirtyDays: milestones,
  sixtyDays: [
    `Hoan thien 1 case study ${specialization.titleVi} trong linh vuc ${sector.titleVi}`,
    `Phong van 3 nguoi dang lam ${role.titleVi} de hieu ky nang va tieu chuan dau vao`,
  ],
  ninetyDays: [
    `Xay portfolio 2-3 du an gan voi ${sector.titleVi}`,
    `Ung tuyen internship, freelance nho hoac vai tro associate lien quan`,
  ],
  sixMonths: [
    `Dat chung chi hoac micro-credential ve ${specialization.title}`,
    `Lam mot du an co feedback tu mentor hoac khach hang that`,
  ],
  oneYear: [
    `Co portfolio co the chung minh nang luc ${role.title}`,
    `Nam duoc quy trinh, KPI va cong cu cot loi cua ${sector.title}`,
  ],
  threeYears: [
    `Tro thanh senior ${role.title} trong mot nhanh ${specialization.title}`,
    'Dan dat du an nho va huong dan nguoi moi',
  ],
  fiveYears: [
    `Mo rong sang lead/manager hoac consultant trong ${sector.title}`,
    'Co mang luoi nghe nghiep va uy tin chuyen mon ro rang',
  ],
  tenYears: [
    `Tro thanh expert, founder, advisor hoac leader trong ${sector.title}`,
    'So huu nang luc chuyen doi giua thi truong dia phuong va quoc te',
  ],
})

const buildSimulation = (
  sector: SectorBlueprint,
  role: RoleBlueprint,
  specialization: SpecializationBlueprint,
) => ({
  typicalDay: [
    `Kiem tra muc tieu va so lieu lien quan den ${specialization.title}`,
    `${role.verbVi} trong boi canh ${sector.titleVi}`,
    'Trao doi voi stakeholder va cap nhat viec uu tien',
  ],
  typicalWeek: [
    '1-2 buoi lam sau cho phan tich/giai phap',
    '1 buoi review voi team hoac khach hang',
    'Cap nhat tai lieu, KPI va backlog cong viec',
  ],
  typicalMonth: [
    'Tong ket ket qua va bai hoc',
    'Trinh bay insight hoac ke hoach tiep theo',
    'Cai tien mot quy trinh, cong cu hoac san pham nho',
  ],
  typicalChallenges: [
    'Du lieu hoac yeu cau dau vao chua ro',
    'Can can bang toc do, chat luong va rui ro',
    'Can giao tiep voi nhieu nhom co uu tien khac nhau',
  ],
  successMetrics: [
    'Ket qua do duoc bang KPI',
    'Stakeholder hieu va tin vao khuyen nghi',
    'Quy trinh hoac san pham tot hon qua tung vong lap',
  ],
  workEnvironment: [
    `${sector.title} team`,
    'Hybrid local/global organization',
    'Remote-friendly workflow when tasks can be digitized',
  ],
  teamStructures: ['Cross-functional team', 'Domain expert plus analyst/operator', 'Client or stakeholder group'],
  meetings: ['Planning', 'Review', 'Decision checkpoint', 'Retrospective'],
  responsibilities: [
    `${role.verbVi}`,
    `Cap nhat tri thuc ve ${specialization.titleVi}`,
    'Dam bao ket qua co bang chung va co the hanh dong',
  ],
  careerProgression: [
    'Associate',
    role.title,
    `Senior ${role.title}`,
    `Lead ${role.title}`,
    `Head of ${specialization.title}`,
  ],
})

const buildFutureOfWork = (
  sector: SectorBlueprint,
  role: RoleBlueprint,
  specialization: SpecializationBlueprint,
  aiRisk: AiRisk,
) => ({
  aiImpact: aiRisk.exposure,
  automationRisk: aiRisk.automationRisk,
  industryDisruption: clamp(sector.longTermGrowth + specialization.marketBias),
  technologyTrends: [
    `${specialization.title} platforms`,
    'AI-assisted decision workflows',
    'Data-rich operations and personalization',
  ],
  emergingRoles: [
    `AI-augmented ${role.title}`,
    `${specialization.title} Governance Lead`,
    `${sector.title} Transformation Specialist`,
  ],
  decliningRoles: [
    'Purely manual reporting roles',
    'Routine coordinator roles without domain judgment',
  ],
  futureOpportunities: [
    `Combine ${sector.title} domain knowledge with AI tools`,
    `Serve global remote demand for ${specialization.title}`,
  ],
  futureSkills: unique([...specialization.skills, 'AI tool evaluation', 'data literacy', 'change management']),
  futureCertifications: [`${specialization.title} with AI credential`, 'Responsible AI and data governance'],
  futureIndustries: [sector.title, 'AI Industry', 'Digital Economy'],
  futureMarkets: ['Vietnam', 'ASEAN', 'Global remote markets'],
  futureBusinessModels: ['Consulting package', 'Subscription service', 'AI-enabled digital product'],
})

const buildEntrepreneurship = (
  sector: SectorBlueprint,
  role: RoleBlueprint,
  specialization: SpecializationBlueprint,
) => ({
  startupPaths: [`Build a ${specialization.title} tool for ${sector.title} teams`],
  freelancingPaths: [`Offer ${role.title} service packages for small ${sector.title} clients`],
  agencyPaths: [`Create a boutique ${specialization.title} agency`],
  consultingPaths: [`Advise organizations on ${sector.title} ${specialization.title}`],
  creatorBusinessPaths: [`Publish practical guides about ${specialization.titleVi}`],
  onlineBusinessPaths: [`Sell templates, dashboards or playbooks for ${role.title} work`],
  digitalProductPaths: [`Create a workflow kit for ${sector.title} ${role.title}s`],
  personalBrandPaths: [`Build authority through case studies and teardown posts`],
  sideHustles: [`Run monthly audits for ${specialization.title} readiness`],
  passiveIncomeOpportunities: ['Templates', 'Mini-courses', 'Paid research briefs'],
})

const buildGlobalInsights = (sector: SectorBlueprint, market: MarketSignal) =>
  Object.fromEntries(
    sector.regions.map((region) => [
      region,
      [
        `Opportunity score around ${clamp(market.globalMobility + 6)}/100 for ${sector.title}`,
        'Validate local licensing, language and portfolio expectations before entering',
      ],
    ]),
  ) as Partial<Record<RegionKey, string[]>>

const buildIntelligence = (
  sector: SectorBlueprint,
  role: RoleBlueprint,
  specialization: SpecializationBlueprint,
  market: MarketSignal,
  aiRisk: AiRisk,
  skills: string[],
  milestones: string[],
): CareerIntelligence => ({
  graph: buildGraph(sector, role, specialization),
  laborMarket: buildLaborMarket(sector, market),
  education: buildEducation(sector, role, specialization),
  skills: buildSkillIntelligence(skills, clamp(market.demand), clamp(market.growthOutlook), sector.learningCurve),
  roadmap: buildRoadmap(sector, role, specialization, milestones),
  simulation: buildSimulation(sector, role, specialization),
  futureOfWork: buildFutureOfWork(sector, role, specialization, aiRisk),
  entrepreneurship: buildEntrepreneurship(sector, role, specialization),
  global: buildGlobalInsights(sector, market),
})

const educationKeywordsFor = (sector: SectorBlueprint) =>
  unique([
    sector.title,
    sector.category,
    ...sector.coreSkills,
    sector.category.includes('Technology') || sector.category.includes('AI') ? 'computer science' : '',
    sector.category.includes('Business') || sector.category.includes('Marketing') ? 'business' : '',
    sector.category.includes('Finance') ? 'finance' : '',
    sector.category.includes('Healthcare') ? 'healthcare' : '',
    sector.category.includes('Education') ? 'education' : '',
  ].filter(Boolean))

const buildEvidenceProfile = (
  sector: SectorBlueprint,
  role: RoleBlueprint,
  specialization: SpecializationBlueprint,
  skills: string[],
): Career['evidenceProfile'] => ({
  domains: unique([
    sector.title,
    sector.titleVi,
    sector.category,
    specialization.title,
    specialization.titleVi,
    ...sector.coreSkills,
  ]),
  jobFamilies: unique([role.title, role.titleVi, sector.category, specialization.title]),
  requiredSkills: unique([...role.skills, ...specialization.skills].slice(0, 6)),
  preferredSkills: unique([...skills, ...sector.coreSkills]).slice(0, 10),
  tools: unique([
    ...skills.filter((skill) =>
      /ai|data|dashboard|platform|tool|automation|analytics|cloud|software|system/i.test(skill),
    ),
    sector.category.includes('Marketing') ? 'Google Analytics' : '',
    sector.category.includes('Technology') || sector.category.includes('AI') ? 'Python' : '',
    sector.category.includes('Design') ? 'Figma' : '',
    sector.category.includes('Business') ? 'Excel' : '',
  ].filter(Boolean)),
  educationKeywords: educationKeywordsFor(sector),
  experienceKeywords: unique([
    role.title,
    role.titleVi,
    specialization.title,
    specialization.titleVi,
    sector.title,
    sector.category,
    ...role.skills,
  ]),
})

const buildMilestones = (
  sector: SectorBlueprint,
  role: RoleBlueprint,
  specialization: SpecializationBlueprint,
) => [
  `Lap ban do 5 ky nang cot loi cua ${role.titleVi} trong linh vuc ${sector.titleVi}`,
  `Lam 1 mini-project ve ${specialization.titleVi} va viet case study ngan`,
  `Tim 3 tin tuyen dung quoc te de doi chieu skill gap va cap nhat lo trinh hoc`,
]

const GENERATED_ROLES_PER_SECTOR = 7
const GENERATED_SPECIALIZATIONS_PER_ROLE = 2

const pickRotating = <T,>(items: T[], start: number, count: number) =>
  Array.from({ length: Math.min(count, items.length) }, (_, index) => items[(start + index) % items.length])

const makeGeneratedCareer = (
  sector: SectorBlueprint,
  role: RoleBlueprint,
  specialization: SpecializationBlueprint,
): Career => {
  const dna = mergeDna(sector.dna, role.dna, specialization.dna)
  const market = nudgeMarket(sector.market, role.marketBias, specialization.marketBias)
  const aiRisk = nudgeAiRisk(sector.aiRisk, role.aiAutomationBias, specialization.aiAugmentationBias)
  const skills = unique([...specialization.skills, ...role.skills, ...sector.coreSkills]).slice(0, 8)
  const milestones = buildMilestones(sector, role, specialization)
  const dimensions = dominantDimensions(dna)

  return {
    id: toId([sector.id, specialization.id, role.id]),
    title: `${sector.title} ${specialization.title} ${role.title}`,
    titleVi: `${role.titleVi} ${specialization.titleVi} - ${sector.titleVi}`,
    category: sector.category,
    summary: `${role.titleVi} nay tap trung ${role.verbVi}, ung dung ${specialization.titleVi} de ${sector.summaryVi}. Phu hop neu ban co the manh ve ${dimensions.join(', ')}.`,
    dna,
    workStyles: mergeWorkStyles(specialization.dna.creativity ? ['ambiguous'] : [], role.workStyles, sector.workStyles),
    market,
    aiRisk,
    learningCurve: clamp((sector.learningCurve + averageDefined(Object.values(dna), 70)) / 2),
    longTermGrowth: clamp((sector.longTermGrowth + market.growthOutlook + specialization.marketBias) / 2),
    starterSkills: skills.slice(0, 4),
    nextMilestones: milestones,
    evidenceProfile: buildEvidenceProfile(sector, role, specialization, skills),
    intelligence: buildIntelligence(sector, role, specialization, market, aiRisk, skills, milestones),
  }
}

const syntheticSectorFromCareer = (career: Career): SectorBlueprint => ({
  id: career.id,
  title: career.title,
  titleVi: career.titleVi,
  category: career.category,
  summaryVi: career.summary,
  dna: career.dna,
  workStyles: career.workStyles,
  market: career.market,
  aiRisk: career.aiRisk,
  learningCurve: career.learningCurve,
  longTermGrowth: career.longTermGrowth,
  coreSkills: career.starterSkills,
  regions: ['vietnam', 'asean', 'asiaPacific', 'globalRemote'],
})

const enrichSeedCareer = (career: Career): Career => {
  if (career.intelligence) return career

  const sector = syntheticSectorFromCareer(career)
  const role = roleBlueprints.find((item) => career.title.toLowerCase().includes(item.title.toLowerCase())) ?? roleBlueprints[0]
  const specialization =
    specializationBlueprints.find((item) =>
      career.title.toLowerCase().includes(item.title.toLowerCase().split(' ')[0].toLowerCase()),
    ) ?? specializationBlueprints[1]
  const skills = unique([...career.starterSkills, ...role.skills, ...specialization.skills])

  return {
    ...career,
    evidenceProfile: career.evidenceProfile ?? buildEvidenceProfile(sector, role, specialization, skills),
    intelligence: buildIntelligence(
      sector,
      role,
      specialization,
      career.market,
      career.aiRisk,
      skills,
      career.nextMilestones,
    ),
  }
}

export const expandCareerCatalog = (seedCareers: Career[]) => {
  const generated = sectorBlueprints.flatMap((sector, sectorIndex) =>
    pickRotating(roleBlueprints, sectorIndex, GENERATED_ROLES_PER_SECTOR).flatMap(
      (role, roleIndex) =>
        pickRotating(
          specializationBlueprints,
          sectorIndex + roleIndex,
          GENERATED_SPECIALIZATIONS_PER_ROLE,
        ).map((specialization) => makeGeneratedCareer(sector, role, specialization)),
    ),
  )

  const byId = new Map<string, Career>()

  for (const career of seedCareers.map(enrichSeedCareer)) {
    byId.set(career.id, career)
  }

  for (const career of generated) {
    if (!byId.has(career.id)) {
      byId.set(career.id, career)
    }
  }

  return Array.from(byId.values())
}
