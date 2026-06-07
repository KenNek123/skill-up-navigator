export const skillAliasMap: Record<string, string> = {
  'react.js': 'React',
  'reactjs': 'React',
  'react': 'React',
  'react native': 'React Native',
  'node.js': 'Node.js',
  'nodejs': 'Node.js',
  'node': 'Node.js',
  'vue.js': 'Vue',
  'vuejs': 'Vue',
  'vue': 'Vue',
  'angular.js': 'Angular',
  'angularjs': 'Angular',
  'angular': 'Angular',
  'typescript': 'TypeScript',
  'ts': 'TypeScript',
  'javascript': 'JavaScript',
  'js': 'JavaScript',
  'python': 'Python',
  'py': 'Python',
  'java': 'Java',
  'c#': 'C#',
  'csharp': 'C#',
  'c++': 'C++',
  'cpp': 'C++',
  'go': 'Go',
  'golang': 'Go',
  'rust': 'Rust',
  'sql': 'SQL',
  'mysql': 'MySQL',
  'postgresql': 'PostgreSQL',
  'postgres': 'PostgreSQL',
  'mongodb': 'MongoDB',
  'mongo': 'MongoDB',
  'redis': 'Redis',
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'k8s': 'Kubernetes',
  'aws': 'AWS',
  'azure': 'Azure',
  'gcp': 'Google Cloud',
  'google cloud': 'Google Cloud',
  'git': 'Git',
  'github': 'GitHub',
  'gitlab': 'GitLab',
  'figma': 'Figma',
  'photoshop': 'Photoshop',
  'adobe photoshop': 'Photoshop',
  'illustrator': 'Illustrator',
  'adobe illustrator': 'Illustrator',
  'excel': 'Excel',
  'microsoft excel': 'Excel',
  'powerpoint': 'PowerPoint',
  'power point': 'PowerPoint',
  'microsoft powerpoint': 'PowerPoint',
  'word': 'Word',
  'microsoft word': 'Word',
  'power bi': 'Power BI',
  'powerbi': 'Power BI',
  'tableau': 'Tableau',
  'google analytics': 'Google Analytics',
  'ga': 'Google Analytics',
  'google ads': 'Google Ads',
  'meta ads': 'Meta Ads',
  'facebook ads': 'Meta Ads',
  'hubspot': 'HubSpot',
  'salesforce': 'Salesforce',
  'jira': 'Jira',
  'confluence': 'Confluence',
  'slack': 'Slack',
  'notion': 'Notion',
  'trello': 'Trello',
  'asana': 'Asana',
  'machine learning': 'Machine Learning',
  'ml': 'Machine Learning',
  'artificial intelligence': 'Artificial Intelligence',
  'ai': 'Artificial Intelligence',
  'deep learning': 'Deep Learning',
  'natural language processing': 'Natural Language Processing',
  'nlp': 'Natural Language Processing',
  'computer vision': 'Computer Vision',
  'cv': 'Computer Vision',
  'data analysis': 'Data Analysis',
  'data analytics': 'Data Analysis',
  'business intelligence': 'Business Intelligence',
  'bi': 'Business Intelligence',
  'project management': 'Project Management',
  'agile': 'Agile',
  'scrum': 'Scrum',
  'kanban': 'Kanban',
  'seo': 'SEO',
  'search engine optimization': 'SEO',
  'content marketing': 'Content Marketing',
  'social media marketing': 'Social Media Marketing',
  'smm': 'Social Media Marketing',
  'email marketing': 'Email Marketing',
  'digital marketing': 'Digital Marketing',
  'ux': 'UX',
  'user experience': 'UX',
  'ui': 'UI',
  'user interface': 'UI',
  'ui/ux': 'UI/UX',
  'product management': 'Product Management',
  'product manager': 'Product Management',
  'financial analysis': 'Financial Analysis',
  'financial modeling': 'Financial Modeling',
  'accounting': 'Accounting',
  'bookkeeping': 'Bookkeeping',
  'hr': 'Human Resources',
  'human resources': 'Human Resources',
  'recruitment': 'Recruitment',
  'talent acquisition': 'Recruitment',
  'customer service': 'Customer Service',
  'customer support': 'Customer Service',
  'sales': 'Sales',
  'business development': 'Business Development',
  'bd': 'Business Development',
}

const normalizeTextCache = new Map<string, string>()

export const normalizeSkillText = (skill: string): string => {
  const cached = normalizeTextCache.get(skill)
  if (cached !== undefined) return cached

  const normalized = skill
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9+#.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  normalizeTextCache.set(skill, normalized)
  return normalized
}

export const canonicalizeSkill = (skill: string): string => {
  const normalized = normalizeSkillText(skill)
  const canonical = skillAliasMap[normalized]
  return canonical ?? skill.trim()
}

export const canonicalizeSkills = (skills: string[]): string[] => {
  const canonicalSet = new Set<string>()
  for (const skill of skills) {
    if (!skill || !skill.trim()) continue
    const canonical = canonicalizeSkill(skill)
    canonicalSet.add(canonical)
  }
  return Array.from(canonicalSet)
}

export type SkillCategory =
  | 'technical'
  | 'business'
  | 'marketing'
  | 'finance'
  | 'data'
  | 'ai'
  | 'design'
  | 'communication'
  | 'leadership'
  | 'operations'
  | 'other'

export const skillTaxonomy: Record<string, SkillCategory[]> = {
  React: ['technical'],
  'React Native': ['technical'],
  'Node.js': ['technical'],
  Vue: ['technical'],
  Angular: ['technical'],
  TypeScript: ['technical'],
  JavaScript: ['technical'],
  Python: ['technical', 'data', 'ai'],
  Java: ['technical'],
  'C#': ['technical'],
  'C++': ['technical'],
  Go: ['technical'],
  Rust: ['technical'],
  SQL: ['technical', 'data'],
  MySQL: ['technical', 'data'],
  PostgreSQL: ['technical', 'data'],
  MongoDB: ['technical', 'data'],
  Redis: ['technical'],
  Docker: ['technical', 'operations'],
  Kubernetes: ['technical', 'operations'],
  AWS: ['technical', 'operations'],
  Azure: ['technical', 'operations'],
  'Google Cloud': ['technical', 'operations'],
  Git: ['technical'],
  GitHub: ['technical'],
  GitLab: ['technical'],
  Figma: ['design'],
  Photoshop: ['design'],
  Illustrator: ['design'],
  Excel: ['business', 'data', 'finance'],
  PowerPoint: ['business', 'communication'],
  Word: ['business', 'communication'],
  'Power BI': ['data', 'business'],
  Tableau: ['data', 'business'],
  'Google Analytics': ['marketing', 'data'],
  'Google Ads': ['marketing'],
  'Meta Ads': ['marketing'],
  HubSpot: ['marketing', 'business'],
  Salesforce: ['business'],
  Jira: ['business', 'technical'],
  Confluence: ['business', 'communication'],
  Slack: ['communication', 'business'],
  Notion: ['business', 'operations'],
  Trello: ['business', 'operations'],
  Asana: ['business', 'operations'],
  'Machine Learning': ['ai', 'technical', 'data'],
  'Artificial Intelligence': ['ai', 'technical'],
  'Deep Learning': ['ai', 'technical'],
  'Natural Language Processing': ['ai', 'technical'],
  'Computer Vision': ['ai', 'technical'],
  'Data Analysis': ['data', 'business'],
  'Business Intelligence': ['data', 'business'],
  'Project Management': ['business', 'leadership', 'operations'],
  Agile: ['business', 'technical'],
  Scrum: ['business', 'technical'],
  Kanban: ['business', 'technical'],
  SEO: ['marketing'],
  'Content Marketing': ['marketing', 'communication'],
  'Social Media Marketing': ['marketing', 'communication'],
  'Email Marketing': ['marketing', 'communication'],
  'Digital Marketing': ['marketing'],
  UX: ['design'],
  UI: ['design'],
  'UI/UX': ['design'],
  'Product Management': ['business', 'leadership'],
  'Financial Analysis': ['finance', 'data'],
  'Financial Modeling': ['finance', 'data'],
  Accounting: ['finance'],
  Bookkeeping: ['finance'],
  'Human Resources': ['business', 'operations'],
  Recruitment: ['business', 'operations'],
  'Customer Service': ['communication', 'business'],
  Sales: ['business', 'communication'],
  'Business Development': ['business', 'leadership'],
}

export const categorizeSkill = (skill: string): SkillCategory[] => {
  const canonical = canonicalizeSkill(skill)
  return skillTaxonomy[canonical] ?? ['other']
}
