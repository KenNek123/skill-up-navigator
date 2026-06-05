# SKILL-UP NAVIGATOR - COMPREHENSIVE AUDIT REPORT
**Date**: 2026-06-05  
**Auditor**: Claude Sonnet 4.6  
**Total Lines of Code**: ~3,135 lines (excluding node_modules)

---

## EXECUTIVE SUMMARY

Skill-Up Navigator is a **career intelligence system** that matches users to careers based on CV evidence and personality dimensions. The core deterministic scoring engine is solid, but the system suffers from critical UX gaps, incomplete Vietnamese localization, missing features, and architectural limitations for production scale.

**Verdict**: The scoring algorithm is sophisticated and well-architected, but the user experience, data quality, error handling, and production-readiness need significant work.

---

## 1. CURRENT ARCHITECTURE

### Frontend Stack
- **Framework**: React 19.2.6 + TypeScript 6.0.2
- **Build Tool**: Vite 8.0.12
- **Styling**: Pure CSS with CSS custom properties
- **UI Library**: Lucide React icons only
- **State Management**: React useState (no external state library)
- **Routing**: Manual `window.location.pathname` checks (no React Router)

### Backend Stack
- **Runtime**: Vercel Serverless Functions (@vercel/node 5.8.12)
- **AI Provider**: Google Gemini (gemini-flash-lite-latest)
- **API Endpoints**: 1 endpoint (`/api/parse-cv.ts`)

### Core Components
1. **Scoring Engine** (`src/engine/scoring.ts` - 857 lines)
   - Multi-dimensional career scoring
   - Evidence-based matching
   - Advanced score breakdowns (24 metrics)
   
2. **Career Catalog** (`src/data/careerCatalog.ts` - 1,363 lines)
   - 30+ sectors, 10 roles, 8 specializations
   - Generates 400+ career combinations
   - Comprehensive career intelligence metadata

3. **UI Components** (`src/App.tsx` - 837 lines)
   - Monolithic single-file app
   - Profile panel with sliders
   - Recommendation display
   - Judge mode (methodology transparency)

### Data Flow
```
User uploads CV → Gemini parses → Structured evidence extracted → 
Frontend scoring engine calculates → Top 80 careers displayed
```

---

## 2. CRITICAL PROBLEMS

### P0: Missing Core Features
1. **No Questionnaire System**
   - System description promises questionnaire, but none exists
   - Only CV upload + manual dimension sliders
   - No guided assessment flow
   - **Impact**: Users without CVs cannot use the system

2. **No Multi-Career Output Constraint**
   - Catalog generates 400+ careers
   - Only displays top 80 (arbitrary limit)
   - Requirements specify "Top 5 only"
   - **Impact**: Overwhelming choice, analysis paralysis

3. **No Career Roadmap/Learning Path Display**
   - Data exists in `CareerIntelligence` type
   - Not rendered in UI
   - Missing: 30-day, 90-day, 6-month, 1-year, 5-year plans
   - **Impact**: No actionable next steps

### P1: Vietnamese Localization Issues
1. **Missing Diacritics Throughout Codebase**
   - Examples: "Cong nghe" → should be "Công nghệ"
   - "Tai chinh" → should be "Tài chính"
   - "Giao duc" → should be "Giáo dục"
   - Affects: Career titles, descriptions, UI labels
   - **Files affected**: `careerCatalog.ts` (200+ instances), `App.tsx`, `careers.ts`

2. **Inconsistent Language Mixing**
   - Some terms in English: "Data Analyst", "Marketing"
   - Some forced Vietnamese translations
   - No clear policy on when to use which

### P2: Error Handling & Resilience
1. **No Fallback System**
   - If Gemini API fails, entire CV parsing fails
   - No local fallback recommendation engine
   - Single point of failure

2. **Limited Retry Logic**
   - API has basic model fallback (tries 6 models)
   - No exponential backoff
   - No graceful degradation

3. **Timeout Risk**
   - Large CV + complex scoring could timeout on Vercel (10s free tier, 60s pro tier)
   - No payload optimization
   - Frontend sends entire structured evidence to backend

---

## 3. PERFORMANCE PROBLEMS

### Bundle Size (Not Measured)
- No lazy loading
- Entire career catalog loaded upfront (400+ careers × large metadata)
- Estimated: ~1MB+ of career data in initial bundle

### Rendering Performance
- No memoization on expensive computations
- Career ranking recalculated on every slider change
- `rankCareers()` processes 400+ careers × 24 scoring dimensions

### API Performance
- Gemini Flash Lite is fast, but:
- No caching of CV parses
- Re-parses on every upload (even same file)

### Recommendations
1. Implement `React.memo` on career list items
2. Use `useMemo` for ranking computation
3. Lazy load career intelligence metadata
4. Add request deduplication for CV uploads
5. Code split by route (landing vs judge mode)

---

## 4. UX PROBLEMS

### Onboarding Experience
- **Current**: Dry landing page, immediate form
- **Missing**: 
  - Hero animation/engagement
  - "How it works" explainer
  - Trust signals (methodology transparency)
  - Sample results preview

### Assessment Flow
- **Current**: Upload CV or manually adjust 12 sliders
- **Problems**:
  - No guidance on what dimensions mean
  - No questionnaire alternative
  - Sliders default to demo profile values
  - No progress indication
  - No save/resume functionality

### Results Presentation
- **Current**: Long list of 80 careers with scores
- **Problems**:
  - No clear "Top 5" emphasis
  - Weak visual hierarchy
  - Limited explainability (explanation text is small)
  - No interactive roadmap
  - No "next steps" CTAs
  - Missing: skill gap visualization, learning path, salary insights

### Mobile Experience
- Responsive CSS exists
- Not tested on actual devices
- Slider controls may be difficult on mobile

---

## 5. DATA PROBLEMS

### Career Catalog Quality
**Strengths**:
- Comprehensive metadata (skills, roadmap, market signals)
- Realistic market data
- AI risk assessments

**Weaknesses**:
1. **Outdated/Niche Careers Present**
   - "Military & Defense" - not a common career path in VN
   - "Space Industry" - extremely niche for VN market
   - "Mining" - declining industry
   - **Need**: Vietnam market relevance audit

2. **Missing Key Vietnam Careers**
   - E-commerce operations
   - Social media marketing
   - Food & beverage management
   - Real estate
   - Accounting/auditing

3. **Unverified Labor Market Data**
   - No source citations for demand/salary data
   - Market signals may be US-centric, not Vietnam-specific
   - `globalMobility` scores not localized

### Evidence Matching Issues
1. **Tool Matching Too Strict**
   - Requires exact tool name matches
   - "Google Ads" vs "GG Ads" won't match
   - No fuzzy matching or aliases

2. **Domain Matching Too Broad**
   - "Technology" domain matches too many careers
   - Need more granular domain taxonomies

---

## 6. AI PROBLEMS

### Current AI Usage (Appropriate)
- ✅ Gemini used ONLY for CV parsing
- ✅ Scoring is deterministic, not AI-driven
- ✅ Explainable results

### Issues with AI Integration
1. **Prompt Quality**
   - 216-line prompt in `api/parse-cv.ts`
   - No prompt versioning
   - No A/B testing of prompts
   - Hard-coded mapping rules

2. **No Structured Output Enforcement**
   - Uses `responseMimeType: 'application/json'`
   - But still manually parses and validates
   - Should use Gemini's structured output schema (Zod-like)

3. **No Confidence Scoring from AI**
   - AI parses CV but doesn't indicate confidence
   - No "low confidence, please review" warnings

4. **Token Waste**
   - Sends same prompt format every time
   - No prompt caching utilization

### Recommendations
1. Use Gemini's native structured output mode
2. Add confidence thresholds (reject low-confidence parses)
3. Implement prompt caching (save 60% cost)
4. Version prompts separately from code
5. Add validation errors → prompt refinement loop

---

## 7. TESTING & QUALITY

### Test Coverage
- **1 test file**: `tests/scoring.test.ts` (3,287 lines)
- Good: Covers core scoring logic
- Missing:
  - API endpoint tests
  - UI component tests
  - Integration tests
  - E2E tests

### Type Safety
- ✅ Full TypeScript
- ✅ Comprehensive type definitions in `types.ts`
- ✅ No `any` types in core logic

### Code Quality
- ✅ Well-structured scoring engine
- ✅ Clear separation of concerns (data/engine/UI)
- ⚠️ Monolithic `App.tsx` (837 lines) - should be split
- ⚠️ No linting in CI/CD
- ⚠️ No pre-commit hooks

---

## 8. ACCESSIBILITY PROBLEMS

### Current State
- ✅ Semantic HTML (`<main>`, `<section>`, `<article>`)
- ✅ ARIA labels on key elements
- ✅ Focus-visible styles defined
- ⚠️ No keyboard navigation testing
- ⚠️ No screen reader testing
- ❌ No skip links
- ❌ Color contrast not verified (WCAG AA)

### Must-Fix for WCAG 2.1 AA
1. Add keyboard-only navigation testing
2. Verify all interactive elements are keyboard-accessible
3. Add skip-to-content link
4. Test with screen readers (NVDA/JAWS)
5. Audit color contrast ratios (especially muted text)

---

## 9. SECURITY & PRIVACY

### Current State
- ✅ API key in `.env.local` (not committed)
- ✅ File size limits (4MB)
- ✅ MIME type validation
- ✅ No user data stored server-side
- ⚠️ Vercel OIDC token in `.env.local` (should be in CI only)

### Risks
1. **Sensitive Data in CV Uploads**
   - No PII scrubbing
   - No data retention policy
   - No GDPR compliance docs

2. **API Key Exposure**
   - Frontend makes direct API calls to Gemini (indirectly via backend)
   - No rate limiting visible
   - No abuse detection

---

## 10. DEPLOYMENT & DEVOPS

### Vercel Configuration
- ✅ Configured for Vite
- ✅ API routes working
- ✅ Environment variables set
- ⚠️ No preview deployments workflow documented
- ⚠️ No CI/CD pipeline
- ⚠️ No automated tests on deploy

### Build Process
- Build command: `npm run build`
- TypeScript compiles both app and node configs
- No build-time optimizations
- No bundle analysis

---

## 11. RECOMMENDATIONS BY PRIORITY

### Immediate (Week 1)
1. ✅ Fix Vietnamese diacritics across codebase
2. ✅ Implement Top 5 career constraint (not 80)
3. ✅ Add fallback system for API failures
4. ✅ Create proper questionnaire flow (2 paths: with/without CV)
5. ✅ Add results page redesign with roadmap display

### Short-term (Weeks 2-3)
6. ✅ Optimize scoring performance (memoization)
7. ✅ Implement code splitting & lazy loading
8. ✅ Add keyboard navigation & ARIA improvements
9. ✅ Create career database review (VN market relevance)
10. ✅ Add structured output validation (Zod)

### Medium-term (Month 2)
11. Add comprehensive testing (unit + integration + E2E)
12. Implement analytics tracking
13. Add user session persistence
14. Create admin dashboard for career data management
15. Build A/B testing framework for prompts

### Long-term (Quarter 2)
16. Multi-language support (EN + VN toggle)
17. Mobile app (React Native)
18. Premium features (detailed reports, 1-on-1 counseling)
19. Enterprise version (university partnerships)
20. API for third-party integrations

---

## 12. TECHNICAL DEBT INVENTORY

1. **Monolithic App.tsx** (837 lines) → Split into components
2. **No routing library** → Add React Router
3. **No state management** → Consider Zustand for complex state
4. **Manual dimension order** → Derive from type definition
5. **Hard-coded constants** → Move to config files
6. **Duplicate normalization logic** → Extract to shared utilities
7. **No build-time type checking in CI** → Add to GitHub Actions
8. **Unused imports** → Clean up with ESLint autofix

---

## CONCLUSION

**Strengths**:
- Solid scoring algorithm foundation
- Comprehensive career data model
- Ethical AI usage (deterministic + explainable)
- Good TypeScript coverage

**Critical Gaps**:
- Incomplete user experience (no questionnaire)
- Poor Vietnamese localization
- Missing production-grade error handling
- Limited test coverage

**Recommendation**: 
Execute the 8-phase improvement plan, prioritizing Phase 1 (Career Engine) and Phase 3 (UX) for immediate user impact. The system has strong bones but needs significant polish for production readiness.

**Estimated Effort**: 
- Phase 0-3: 2-3 weeks (core functionality)
- Phase 4-5: 1 week (quality & performance)
- Phase 6-7: 1 week (accessibility & testing)
- Phase 8: 1 day (reporting)
- **Total**: 4-6 weeks for complete overhaul

---

**Next Steps**: Begin Phase 1 improvements immediately.