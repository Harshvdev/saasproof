import type { StartupReport } from "../types";

export const dentalCompliancePreset: StartupReport = {
  id: "preset_dental_compliance",
  createdAt: "2026-11-12T09:30:00.000Z",
  isPreset: true,
  input: {
    idea: "AI compliance and HIPAA/OSHA audit co-pilot for independent dental clinics",
    region: "United States",
    businessModel: "B2B SaaS",
    enableDeepScrape: false,
  },
  framer: {
    startupTitle: "DentShield AI",
    oneLiner:
      "Automated OSHA, HIPAA, and sterilization-log audit co-pilot that keeps 1–5 chair dental clinics inspection-ready in 10 minutes a week.",
    category: "Vertical Healthcare Compliance SaaS",
    detectedModel: "B2B SaaS",
    targetGeography: "United States",
    coreProblem:
      "Independent dental practices face \$10k–\$50k+ OSHA/HIPAA fines and rely on binders, spreadsheets, and expensive \$3k/year consultants to track spore tests, staff training, and MSDS sheets.",
    searchQueries: {
      market: "dental practice management compliance software market size US",
      competitors: "dental OSHA HIPAA compliance software competitors pricing",
      customers: "independent dental office manager OSHA audit headache",
      risks: "healthcare compliance SaaS liability BAA HIPAA dental",
    },
  },
  market: {
    tam: "$3.8B",
    tamDetail:
      "US dental practice management, regulatory compliance, and healthcare clinic audit software spend.",
    sam: "$620M",
    samDetail:
      "~135,000 independent and small-group (1–5 location) US dental offices lacking enterprise compliance teams.",
    som: "$18M",
    somDetail:
      "3-year target of 7,500 clinics at \$199/month average annual contract value.",
    growthRate: "11.2% CAGR",
    marketVerdict:
      "Classic unsexy, high-retention vertical B2B SaaS with strong willingness to pay because non-compliance carries immediate financial and license risk.",
    tailwinds: [
      "Increased state dental board & OSHA random inspections post-2023.",
      "High front-desk and dental assistant turnover breaks paper-binder compliance tracking.",
      "Clinics already spend \$1,500–\$4,000/yr on manual compliance consultants.",
    ],
    headwinds: [
      "Selling to busy dentists requires reaching the Office Manager first.",
      "Requires signing a HIPAA Business Associate Agreement (BAA) from day one.",
      "Incumbent practice management suites (Dentrix/Open Dental) own core clinic workflows.",
    ],
    sources: [
      {
        title: "ADA Practice Statistics",
        url: "https://www.ada.org/resources/research/health-policy-institute",
        domain: "ada.org",
      },
      {
        title: "OSHA Dentistry Standards",
        url: "https://www.osha.gov/dentistry",
        domain: "osha.gov",
      },
    ],
  },
  competitors: {
    landscapeSummary:
      "Legacy compliance portals feel like static 2010 checklists or expensive human-led consulting packages; none offer photo-verified mobile logging + instant mock-audit gap detection.",
    whiteSpaceOpportunity:
      "Snap-a-photo compliance: hygienists photograph autoclave spore-test strips and eyewash stations; AI logs them, flags missing signatures, and generates an inspector-ready audit packet in one click.",
    competitors: [
      {
        name: "Abyde",
        url: "https://abyde.com/",
        positioning: "Automated HIPAA & OSHA compliance software for small medical/dental practices.",
        pricingModel: "~\$1,500–\$2,500/year per location",
        strengths: [
          "Strong brand awareness among independent practices",
          "Dynamic policy generation and training videos",
        ],
        weaknessesOrGaps: [
          "Clunky document UX for daily autoclave/sterilization logging",
          "Slow customer onboarding for multi-staff turnover",
        ],
        threatLevel: "High",
        extractionMethod: "TinyFetch",
      },
      {
        name: "Smart Training",
        url: "https://www.smarttraining.com/",
        positioning: "Dental OSHA/HIPAA LMS and compliance management platform.",
        pricingModel: "Tiered annual subscription (~\$150–\$300/mo)",
        strengths: [
          "Deep dental-specific training library",
          "Longstanding relationships with dental suppliers",
        ],
        weaknessesOrGaps: [
          "Dated interface and rigid annual contracts",
          "Minimal automated gap alerting or photo verification",
        ],
        threatLevel: "Medium",
        extractionMethod: "TinyFetch",
      },
      {
        name: "Paper Binders & Local Consultants",
        url: "https://www.osha.gov/dentistry",
        positioning: "Manual 3-ring binders + annual \$2,500 in-person consultant walkthrough.",
        pricingModel: "\$1,500–\$3,500/year",
        strengths: [
          "High personal hand-holding during initial setup",
        ],
        weaknessesOrGaps: [
          "Outdated the moment a new hygienist joins",
          "Zero real-time alerts before an unannounced inspection",
        ],
        threatLevel: "Low",
        extractionMethod: "TinySearch",
      },
    ],
    sources: [
      {
        title: "Abyde Dental Compliance",
        url: "https://abyde.com/",
        domain: "abyde.com",
      },
      {
        title: "Smart Training Dental",
        url: "https://www.smarttraining.com/",
        domain: "smarttraining.com",
      },
    ],
  },
  customers: {
    targetSummary:
      "Decision-maker is the Practice Owner (Dentist), while the daily champion and buyer influencer is the Dental Office Manager.",
    personas: [
      {
        name: "Overwhelmed Office Manager",
        roleOrSegment: "Runs operations at a 2–4 dentist independent clinic",
        side: "Daily Champion",
        topPainPoints: [
          "Chasing hygienists to sign weekly sterilization & eyewash logs",
          "Panics when a new assistant starts and onboarding compliance certs are missing",
          "Dreads unannounced OSHA or state board visits",
        ],
        currentWorkaround: "Paper clipboards in the sterilization room + Google Calendar reminders.",
        willingnessToPay: "\$149–\$249/month if it replaces \$2,500/yr consultant fees",
        acquisitionChannels: [
          "Dental Office Manager Facebook groups & AADOM chapters",
          "Free '5-Minute Mock OSHA Audit Score' lead magnet",
        ],
      },
      {
        name: "Practice Owner Dentist",
        roleOrSegment: "Owner of 1–3 clinics focused on chair-time revenue",
        side: "Economic Buyer",
        topPainPoints: [
          "Personal license & clinic reputation on the line for compliance failures",
          "Hates spending \$3k/yr on consultants who only show up once",
        ],
        currentWorkaround: "Pays an annual retainer to a regional compliance consultant.",
        willingnessToPay: "\$2,000–\$3,000/year",
        acquisitionChannels: [
          "Local dental study clubs & dental CPA/supplier referrals",
          "LinkedIn / direct clinic outreach",
        ],
      },
    ],
    interviewQuestions: [
      "Walk me through the last time your clinic prepared for—or underwent—an OSHA or state board inspection.",
      "Where do your weekly sterilization and spore-test logs live right now?",
      "What happens when a dental assistant quits and a new one starts next Monday?",
      "How much did you spend last year on compliance consultants, binders, or software?",
      "If an inspector walked in 15 minutes from now, which single binder or log would stress you out most?",
    ],
    earlyAdopterHook:
      "Upload a photo of your current sterilization binder → get an instant OSHA/HIPAA Gap Report & 1-click Audit Packet.",
    sources: [
      {
        title: "OSHA Dentistry Guidance",
        url: "https://www.osha.gov/dentistry",
        domain: "osha.gov",
      },
    ],
  },
  validator: {
    overallScore: 82,
    verdictBadge: "Strong Go",
    executiveVerdict:
      "High-urgency, sticky B2B SaaS with clear ROI against existing \$2,500+/yr compliance spend. Main hurdle is earning initial clinical trust and offering a clean HIPAA BAA.",
    scoreBreakdown: {
      demand: 86,
      differentiation: 78,
      feasibility: 84,
      unitEconomics: 88,
      defensibility: 74,
    },
    fatalRisks: [
      {
        title: "HIPAA BAA & Legal Liability",
        severity: "Critical",
        explanation:
          "If you store any staff health/vaccine records or claim 'guaranteed compliance' and a clinic gets fined, liability is severe.",
        mitigation:
          "Position strictly as workflow & audit-readiness co-pilot (not legal counsel), sign standard BAAs, and avoid storing patient PHI.",
      },
      {
        title: "Slow Dental Sales Cycles",
        severity: "Medium",
        explanation:
          "Dentists are in procedures all day and ignore generic cold emails.",
        mitigation:
          "Sell via a free 'State Board Self-Audit Checklist' targeted at Office Managers + partner with local dental equipment reps.",
      },
      {
        title: "State-by-State Dental Board Variations",
        severity: "Medium",
        explanation:
          "OSHA is federal, but infection-control rules vary slightly across states like CA, TX, and NY.",
        mitigation:
          "Launch in 1–2 states first (e.g., Texas & California) with state-verified rule packs.",
      },
    ],
    pivotSuggestions: [
      "Expand later from Dental to MedSpas and Veterinary Clinics—identical OSHA/sterilization binder pain.",
    ],
    unitEconomicsNote:
      "At \$199/mo (\$2,388 ACV) and <\$12/mo AI/hosting COGS, gross margin exceeds 92%. Even 50 clinics = \$10k MRR with near-zero churn.",
  },
  planner: {
    recommendedWedge:
      "Independent dental clinics (1–3 locations) in Texas or California starting specifically with Autoclave/Sterilization & OSHA Binder digitization.",
    monetizationStrategy:
      "\$149/mo Solo Clinic • \$249/mo Multi-Room Clinic (14-day free trial with instant Mock Audit PDF).",
    mvpFeatures: {
      mustBuild: [
        "1-Click Mock OSHA/Infection-Control Readiness Scorer",
        "Mobile Photo Log for weekly spore tests & eyewash checks",
        "Staff Onboarding & Annual Training Expiry Tracker",
        "1-Click 'Inspector Packet' PDF generator",
      ],
      skipForNow: [
        "Full Dentrix/Eaglesoft EHR integration",
        "Custom payroll or HR time-tracking",
        "All 50 state regulatory packs on day one",
      ],
    },
    roadmap: [
      {
        phase: "Phase 1: Rule Pack & Clinic Shadowing",
        timeframe: "Days 1–30",
        objective: "Validate audit workflows with 10 real dental office managers.",
        actions: [
          "Interview 10 local independent dental office managers and inspect their physical OSHA binders.",
          "Build the 'Free 5-Minute Mock OSHA Audit' web tool + PDF gap report.",
          "Onboard 3 design-partner clinics for free in exchange for weekly feedback.",
        ],
        successMetric: "3 active pilot clinics logging sterilization checks weekly",
      },
      {
        phase: "Phase 2: Paid Conversion & BAA Launch",
        timeframe: "Days 31–60",
        objective: "Convert pilots and launch self-serve \$149/mo subscription.",
        actions: [
          "Add HIPAA BAA template + automated SMS reminders for overdue weekly spore logs.",
          "Run targeted outreach to AADOM office manager communities.",
        ],
        successMetric: "10 paying clinics (\$1,500+ MRR)",
      },
      {
        phase: "Phase 3: Consultant Channel Partnerships",
        timeframe: "Days 61–90",
        objective: "Partner with regional dental supply reps & compliance consultants.",
        actions: [
          "Offer white-label or rev-share portal for independent OSHA consultants to manage 20+ clinics.",
          "Expand state rule packs to top 5 US states.",
        ],
        successMetric: "30 paying clinics (\$5,000+ MRR) with <3% churn",
      },
    ],
    firstTenCustomersPlaybook:
      "Walk into 25 independent dental offices locally with a tablet showing a 2-minute 'Mock State Inspection Gap Checker', and DM 50 dental office managers in AADOM/LinkedIn offering a free binder-digitization setup.",
  },
  telemetry: {
    durationMs: 1180,
    llmProviderUsed: "Preset Demo",
    tinySearchCalls: 4,
    tinyFetchCalls: 4,
    tinyAgentUsed: false,
  },
};
