import type { StartupReport } from "../types";

export const creatorSponsorshipPreset: StartupReport = {
  id: "preset_creator_sponsorship",
  createdAt: "2026-11-12T08:45:00.000Z",
  isPreset: true,
  input: {
    idea: "AI sponsorship pricing, brand-match & contract redline co-pilot for mid-tier YouTube and newsletter creators",
    region: "Global (English-speaking)",
    businessModel: "AI Tool / API",
    enableDeepScrape: false,
  },
  framer: {
    startupTitle: "DealPulse",
    oneLiner:
      "Benchmarks real sponsorship rates, flags predatory usage-rights clauses in brand contracts, and finds warm sponsor leads for 10k–250k creators.",
    category: "Creator Economy Fintech & LegalOps",
    detectedModel: "B2B/Prosumer AI SaaS",
    targetGeography: "US, UK, Canada, India (English Creators)",
    coreProblem:
      "Mid-tier creators (10k–250k followers) underprice brand integrations by 40–60% and accidentally sign perpetual AI-likeness and exclusivity clauses because they can't afford a \$500/hr talent manager.",
    searchQueries: {
      market: "creator economy sponsorship management market size mid tier creators",
      competitors: "creator sponsorship pricing calculator contract review software competitors",
      customers: "mid tier youtuber brand deal pricing contract mistakes",
      risks: "AI contract review unauthorized practice of law risk",
    },
  },
  market: {
    tam: "$29B",
    tamDetail: "Global influencer & creator sponsorship marketing spend.",
    sam: "$1.9B",
    samDetail: "Software & deal-management spend across ~4M monetizing mid-tier creators globally.",
    som: "$24M",
    somDetail: "3-year capture of ~40,000 active creators paying \$49/mo.",
    growthRate: "18.5% CAGR",
    marketVerdict:
      "Fast-growing creator middle class has acute monetization and contract pain, though creator churn is high unless tied directly to incoming deal revenue.",
    tailwinds: [
      "Brands are shifting budgets from mega-influencers to niche 15k–150k B2B/tech/finance creators.",
      "AI-likeness & perpetual whitelisting clauses in 2025–2026 brand contracts have spiked creator anxiety.",
    ],
    headwinds: [
      "Individual creators have notorious SaaS churn if they don't land deals every month.",
      "Must include clear legal disclaimers so contract redlining isn't treated as formal legal advice.",
    ],
    sources: [
      {
        title: "Passionfroot Creator Partnerships",
        url: "https://www.passionfroot.me/",
        domain: "passionfroot.me",
      },
      {
        title: "Justin Moore — Sponsor Magnet Benchmarks",
        url: "https://www.creatorwizard.com/",
        domain: "creatorwizard.com",
      },
    ],
  },
  competitors: {
    landscapeSummary:
      "Tools like Passionfroot focus on storefronts/media kits, and talent agencies take 20% of revenue—nobody combines live CPM rate benchmarking + contract redline risk scoring for mid-tier creators.",
    whiteSpaceOpportunity:
      "Instant 'Upload Brand Contract + Channel URL' workflow that tells a creator both 'Charge \$2,800 instead of \$1,200' AND 'Strike Clause 4.2 (perpetual AI likeness)'.",
    competitors: [
      {
        name: "Passionfroot",
        url: "https://www.passionfroot.me/",
        positioning: "Creator storefront and sponsorship booking OS.",
        pricingModel: "Freemium + marketplace/SaaS tiers",
        strengths: ["Sleek creator UX", "Strong newsletter & B2B creator adoption"],
        weaknessesOrGaps: ["No deep AI contract redlining or pricing negotiation scripts"],
        threatLevel: "High",
        extractionMethod: "TinyFetch",
      },
      {
        name: "Generic Talent Managers",
        url: "https://www.creatorwizard.com/",
        positioning: "Human agents negotiating brand deals.",
        pricingModel: "15%–20% commission on all deals",
        strengths: ["Outbound sponsor relationships"],
        weaknessesOrGaps: ["Won't accept creators under 100k+ subs", "Expensive 20% cut"],
        threatLevel: "Medium",
        extractionMethod: "TinySearch",
      },
    ],
    sources: [
      {
        title: "Passionfroot",
        url: "https://www.passionfroot.me/",
        domain: "passionfroot.me",
      },
    ],
  },
  customers: {
    targetSummary:
      "Independent YouTubers, Substack/Beehiiv writers, and technical educators earning \$1k–\$15k/month without a manager.",
    personas: [
      {
        name: "Solo Tech / Finance YouTuber",
        roleOrSegment: "25k–150k subscribers, 1–3 inbound sponsor emails/month",
        side: "Primary User",
        topPainPoints: [
          "Brand asks 'What are your rates?' and creator guesses way too low",
          "Afraid of signing away perpetual ad usage or competitor exclusivity",
        ],
        currentWorkaround: "Asks Discord peers or pastes contract into raw ChatGPT.",
        willingnessToPay: "\$29–\$49/month or \$19 per deal packet",
        acquisitionChannels: [
          "Free 'Brand Deal Rate & Clause Checker' viral tool on X/YouTube",
          "Beehiiv / Substack / Creator Discord communities",
        ],
      },
    ],
    interviewQuestions: [
      "Walk me through the last brand email you received—how did you decide what number to reply with?",
      "What is the worst clause or deal term you realized you agreed to only after signing?",
      "How long did it take you to go from initial sponsor email to getting paid?",
      "Would you prefer a monthly subscription or paying per negotiated deal?",
    ],
    earlyAdopterHook:
      "Paste your YouTube/Newsletter URL + the brand's PDF contract → get your fair rate quote + redlined counter-email in 20 seconds.",
    sources: [
      {
        title: "Creator Wizard",
        url: "https://www.creatorwizard.com/",
        domain: "creatorwizard.com",
      },
    ],
  },
  validator: {
    overallScore: 69,
    verdictBadge: "Promising Wedge",
    executiveVerdict:
      "Great viral wedge product (rate calculator + contract redliner), but standalone creator SaaS suffers high churn—pair it with outbound sponsor lead generation to justify recurring monthly retention.",
    scoreBreakdown: {
      demand: 77,
      differentiation: 72,
      feasibility: 80,
      unitEconomics: 60,
      defensibility: 56,
    },
    fatalRisks: [
      {
        title: "High Creator Monthly Churn",
        severity: "Critical",
        explanation:
          "If a creator only gets 1 brand deal every 2 months, they cancel a \$49/mo SaaS immediately after signing.",
        mitigation:
          "Bundle weekly warm sponsor leads (brands currently sponsoring similar channels) so the app pays for itself every month.",
      },
      {
        title: "ChatGPT Commoditization",
        severity: "High",
        explanation:
          "Creators already paste contracts into free ChatGPT for basic summaries.",
        mitigation:
          "Differentiate with proprietary anonymized rate benchmarks by niche/views + live sponsor spend data.",
      },
      {
        title: "Unauthorized Practice of Law",
        severity: "Medium",
        explanation:
          "Offering binding legal edits crosses regulatory lines.",
        mitigation:
          "Frame strictly as commercial term benchmarking & negotiation talking points with clear non-legal-advice notice.",
      },
    ],
    pivotSuggestions: [
      "Sell to Boutique Creator Talent Agencies (managing 15–50 creators each) for \$299/mo instead of solo creators.",
    ],
    unitEconomicsNote:
      "B2C creator tier needs low CAC via free viral rate calculator; pivoting to B2B talent agencies multiplies LTV by 6x.",
  },
  planner: {
    recommendedWedge:
      "Tech, AI, and Personal Finance YouTubers (15k–150k subscribers) who have high CPMs and frequent B2B SaaS sponsor inbound.",
    monetizationStrategy:
      "Free viral Rate + Clause Risk Checker (1/mo) → \$39/mo Pro (unlimited redlines + weekly warm sponsor leads).",
    mvpFeatures: {
      mustBuild: [
        "Channel CPM & Fair Rate Estimator from public video view averages",
        "PDF Contract Risk Scanner (flags exclusivity, perpetuity, net-90, AI rights)",
        "1-Click Counter-Offer Email Generator",
        "Anonymized Rate Benchmark Database",
      ],
      skipForNow: [
        "Automated Stripe invoicing & tax forms",
        "Full CRM pipeline for 100+ brands",
      ],
    },
    roadmap: [
      {
        phase: "Phase 1: Viral Free Tool Launch",
        timeframe: "Days 1–30",
        objective: "Drive organic creator traffic via a free Brand Contract Red-Flag Checker.",
        actions: [
          "Ship the free PDF/text contract risk grader with shareable 'Clause Red Flag' badges.",
          "Launch on Product Hunt, r/NewTubers, and creator Twitter/X.",
        ],
        successMetric: "300 contracts/rates scanned + 50 waitlist signups",
      },
      {
        phase: "Phase 2: Pro Sponsor Leads + Benchmarks",
        timeframe: "Days 31–60",
        objective: "Add recurring value with weekly active-sponsor lead lists.",
        actions: [
          "Scrape sponsorships from peer channels in the user's niche to recommend 10 active brands/week.",
          "Launch \$39/mo Pro plan.",
        ],
        successMetric: "20 paying Pro creators (\$780 MRR)",
      },
      {
        phase: "Phase 3: Agency Team Seats",
        timeframe: "Days 61–90",
        objective: "Lock in low-churn B2B agency contracts.",
        actions: [
          "Launch multi-creator workspace for boutique talent managers (\$199–\$299/mo).",
          "Integrate automated invoice tracking and agency-wide sponsorship reporting dashboard.",
        ],
        successMetric: "5 talent agencies onboarded (\$2,000+ MRR)",
      },
    ],
    firstTenCustomersPlaybook:
      "Find 30 tech/AI YouTubers with 20k–100k subscribers who recently did their first sponsorship, analyze what that brand typically pays, and send them a free 1-page rate & clause benchmark audit.",
  },
  telemetry: {
    durationMs: 980,
    llmProviderUsed: "Preset Demo",
    tinySearchCalls: 4,
    tinyFetchCalls: 3,
    tinyAgentUsed: false,
  },
};
