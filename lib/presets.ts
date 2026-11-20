import type { StartupReport } from "./types";

export const DEMO_PRESETS: StartupReport[] = [
  {
    id: "preset_inspect_secondhand",
    createdAt: "2026-11-12T10:00:00.000Z",
    isPreset: true,
    input: {
      idea: "Startup that lets people hire vetted local professionals temporarily to inspect secondhand items before buying",
      region: "US & India Metro Cities",
      businessModel: "Marketplace",
      enableDeepScrape: true,
    },
    framer: {
      startupTitle: "InspectMint",
      oneLiner:
        "On-demand certified local experts who inspect high-ticket secondhand goods before peer-to-peer buyers release payment.",
      category: "Recommerce Trust & Verification",
      detectedModel: "Two-Sided Service Marketplace",
      targetGeography: "US & Tier-1 Metro Cities",
      coreProblem:
        "Peer-to-peer buyers on Facebook Marketplace, Craigslist, and OLX skip \$400–\$5,000+ used purchases—or get scammed by hidden hardware defects and counterfeits—because they lack technical expertise to inspect items in person.",
      searchQueries: {
        market: "secondhand recommerce market size fraud verification statistics",
        competitors: "pre-purchase inspection marketplace used items cars electronics competitors",
        customers: "facebook marketplace scam buyer fear used electronics inspection",
        risks: "on demand inspection marketplace liability disintermediation risks",
      },
    },
    market: {
      tam: "$178B",
      tamDetail:
        "Global online recommerce & C2C used-goods transaction volume across electronics, vehicles, luxury, and equipment.",
      sam: "$14.2B",
      samDetail:
        "Addressable inspection, authentication, and escrow-fee opportunity across high-ticket (\$300+) local P2P transactions.",
      som: "$42M",
      somDetail:
        "3-year serviceable capture focusing on used laptops, cameras, motorcycles, and watches across 8 dense metro hubs.",
      growthRate: "14.8% CAGR",
      marketVerdict:
        "Secondhand commerce is growing fast, and buyer anxiety around hidden defects and counterfeits remains the #1 conversion blocker on high-ticket P2P deals.",
      tailwinds: [
        "Rising prices of new electronics and vehicles push consumers to P2P secondhand marketplaces.",
        "AI-generated fake listings and sophisticated hardware swaps have spiked buyer distrust on Facebook Marketplace and OLX.",
        "Independent repair technicians and mechanics increasingly seek flexible, high-margin side income.",
      ],
      headwinds: [
        "Low-value items (<\$250) cannot justify a \$35–\$75 human inspection fee.",
        "Coordinating three schedules (buyer, seller, and inspector) creates physical-world friction.",
        "Platform escrow tools like eBay Authenticity Guarantee already cover mail-in categories.",
      ],
      sources: [
        {
          title: "Lemon Squad — Pre-Purchase Vehicle Inspection",
          url: "https://lemonsquad.com/",
          domain: "lemonsquad.com",
        },
        {
          title: "eBay Authenticity Guarantee Overview",
          url: "https://www.ebay.com/authenticity-guarantee",
          domain: "ebay.com",
        },
        {
          title: "ThredUp / Global Recommerce Trends",
          url: "https://www.thredup.com/resale/",
          domain: "thredup.com",
        },
      ],
    },
    competitors: {
      landscapeSummary:
        "Used cars have dedicated inspection networks (Lemon Squad, Pomcar), and mail-in sneakers/watches have centralized hubs (StockX, eBay), leaving local in-person electronics, cameras, and appliances largely unserved.",
      whiteSpaceOpportunity:
        "Own same-day local tech & specialty inspections (laptops, cameras, e-bikes, musical gear) bundled with a standardized 25-point diagnostic certificate + optional escrow hold.",
      deepScrapeNote:
        "Pre-loaded sample report (click 'Re-run Live with Agents' to execute TinySearch + TinyFetch + TinyAgent in real time).",
      competitors: [
        {
          name: "Lemon Squad",
          url: "https://lemonsquad.com/",
          positioning: "Nationwide on-site pre-purchase used car inspection service.",
          pricingModel: "Flat \$199–\$349 per vehicle inspection",
          strengths: [
            "Established network of ASE-certified mechanics",
            "Structured photo + diagnostic checklist report",
          ],
          weaknessesOrGaps: [
            "Strictly automotive—zero coverage for electronics, cameras, or luxury",
            "24–48 hour scheduling lag too slow for fast local deals",
          ],
          threatLevel: "Medium",
          extractionMethod: "TinyFetch",
        },
        {
          name: "eBay Authenticity Guarantee",
          url: "https://www.ebay.com/authenticity-guarantee",
          positioning: "Centralized mail-in authentication for watches, sneakers, handbags.",
          pricingModel: "Included in platform take rate (free to buyer above threshold)",
          strengths: [
            "Zero extra friction for shipped eBay orders",
            "Backed by eBay buyer protection",
          ],
          weaknessesOrGaps: [
            "Only works for eBay-shipped items, not local cash/UPI meetups",
            "Adds 4–7 days of shipping delay",
          ],
          threatLevel: "High",
          extractionMethod: "TinyFetch",
        },
        {
          name: "Checkr / Local Repair Shops (Informal)",
          url: "https://www.ifixit.com/",
          positioning: "Ad-hoc buyer asking a local repair shop to check a used laptop/phone.",
          pricingModel: "\$25–\$60 cash diagnostic fee",
          strengths: [
            "High technical trust and diagnostic tools on-site",
            "Already located in dense neighborhoods",
          ],
          weaknessesOrGaps: [
            "No standardized digital report or warranty",
            "Seller rarely agrees to leave item or travel to an unknown shop",
          ],
          threatLevel: "Low",
          extractionMethod: "TinySearch",
        },
        {
          name: "TaskRabbit",
          url: "https://www.taskrabbit.com/",
          positioning: "General local gig marketplace for errands and handyman tasks.",
          pricingModel: "Hourly rate + 15–30% service & trust fee",
          strengths: [
            "Huge liquidity of local workers",
            "Familiar booking & payment UI",
          ],
          weaknessesOrGaps: [
            "No domain vetting for electronics/watch diagnostics",
            "No standardized inspection checklist or defect guarantee",
          ],
          threatLevel: "Low",
          extractionMethod: "TinySearch",
        },
      ],
      sources: [
        {
          title: "Lemon Squad Pricing & Process",
          url: "https://lemonsquad.com/",
          domain: "lemonsquad.com",
        },
        {
          title: "eBay Authenticity Guarantee",
          url: "https://www.ebay.com/authenticity-guarantee",
          domain: "ebay.com",
        },
        {
          title: "TaskRabbit Marketplace",
          url: "https://www.taskrabbit.com/",
          domain: "taskrabbit.com",
        },
      ],
    },
    customers: {
      targetSummary:
        "Two-sided marketplace serving risk-averse high-ticket local buyers on the demand side and vetted repair technicians/specialists on the supply side.",
      personas: [
        {
          name: "Anxious High-Ticket Buyer",
          roleOrSegment: "Buyers spending \$500–\$4,000 on MacBooks, cameras, bikes, or watches",
          side: "Demand / Buyer",
          topPainPoints: [
            "Terrified of buying a water-damaged laptop, MDM-locked MacBook, or swapped parts",
            "Doesn't know which diagnostic tests to run in a 10-minute coffee-shop meetup",
            "Zero recourse once cash/Zelle/UPI is handed over",
          ],
          currentWorkaround:
            "Brings a tech-savvy friend, watches YouTube checklists, or pays more to buy refurbished retail.",
          willingnessToPay: "\$29–\$69 per inspection (around 5–8% of item price)",
          acquisitionChannels: [
            "Browser extension / link paste for Facebook Marketplace & OLX listings",
            "Reddit communities (r/appleswap, r/photomarket) & local Buy/Sell groups",
          ],
        },
        {
          name: "Certified Side-Gig Specialist",
          roleOrSegment: "Apple/PC repair techs, camera store pros, watchmakers, bike mechanics",
          side: "Supply / Provider",
          topPainPoints: [
            "Shop wages cap hourly income; wants flexible weekend/evening gigs",
            "Doesn't want to handle awkward pricing negotiation between buyer and seller",
          ],
          currentWorkaround:
            "Takes occasional side repair jobs from word-of-mouth referrals.",
          willingnessToPay: "Keeps 70–75% of inspection fee (\$25–\$50 for a 20-min check)",
          acquisitionChannels: [
            "Direct outreach to independent electronics/camera repair shops",
            "Trade certification forums & local tech guilds",
          ],
        },
      ],
      interviewQuestions: [
        "Tell me about the last time you wanted to buy a used item over \$400 locally—what made you hesitate or walk away?",
        "Have you ever bought something secondhand and discovered a hidden defect afterward? Walk me through what happened.",
        "When you met the seller, what did you actually check before paying?",
        "At what item price point does spending \$40 for an expert check feel like a no-brainer vs. too expensive?",
        "Would you rather have an inspector meet at the seller's spot, or drop the item at a verified partner repair shop?",
      ],
      earlyAdopterHook:
        "Paste any Facebook Marketplace or Craigslist link → get a certified specialist + 25-point diagnostic report at your meetup within 4 hours.",
      sources: [
        {
          title: "iFixit Repair Community",
          url: "https://www.ifixit.com/",
          domain: "ifixit.com",
        },
      ],
    },
    validator: {
      overallScore: 73,
      verdictBadge: "Promising Wedge",
      executiveVerdict:
        "Strong real-world pain point with clear willingness to pay on high-ticket items (\$500+), but generalist marketplaces fail from thin supply and liability traps. Wins if you launch hyper-focused on 1–2 dense verticals first.",
      scoreBreakdown: {
        demand: 81,
        differentiation: 76,
        feasibility: 68,
        unitEconomics: 66,
        defensibility: 72,
      },
      fatalRisks: [
        {
          title: "3-Way Scheduling Friction",
          severity: "Critical",
          explanation:
            "Good secondhand deals sell within hours; coordinating buyer, seller, and an inspector at a coffee shop often fails.",
          mitigation:
            "Launch 'Drop-Off Inspection Hubs' at existing partner repair shops plus async video-diagnostic verification.",
        },
        {
          title: "Missed-Defect Liability",
          severity: "High",
          explanation:
            "If an inspector signs off on a used MacBook and the logic board dies 3 days later, the buyer demands a full refund.",
          mitigation:
            "Scope reports explicitly as point-in-time hardware diagnostics + offer an optional micro-warranty/escrow tier.",
        },
        {
          title: "Platform Disintermediation",
          severity: "High",
          explanation:
            "Once a buyer meets a good technician, they may hire them directly off-platform next time.",
          mitigation:
            "Anchor value in the tamper-proof Inspection Certificate + buyer protection escrow, not just the introduction.",
        },
        {
          title: "Sub-\$300 Unit Economics Trap",
          severity: "Medium",
          explanation:
            "Travel time for an inspector kills margins on cheap items like \$120 headphones or furniture.",
          mitigation:
            "Enforce a \$400 minimum item value or bundle remote live-video expert inspection (\$15) for cheaper goods.",
        },
      ],
      pivotSuggestions: [
        "Start purely with Used Laptops & Cameras in 1 college/tech metro, partnering with 10 existing repair shops as supply.",
        "Offer an instant \$15 Live Video-Call Expert tier before dispatching an in-person inspector.",
      ],
      unitEconomicsNote:
        "At a \$49 inspection fee (buyer pays \$44 + \$5 seller trust badge), paying the specialist \$32 leaves \$17 gross margin (~34%). Needs ~2+ inspections/day per dense zone to keep travel time under 15 minutes.",
    },
    planner: {
      recommendedWedge:
        "Used MacBooks, iPhones & Mirrorless Cameras (\$500+) in one dense metro city—using local independent repair techs as supply.",
      monetizationStrategy:
        "Tiered flat fee: \$15 Live Video Check (10 min) • \$49 On-Site Certified Inspection • +1.5% Escrow Hold optional add-on.",
      mvpFeatures: {
        mustBuild: [
          "Paste Listing URL (FB/Craigslist/OLX) → instant price & category quote",
          "Standardized 25-point Inspection Report Card with timestamped photos",
          "Escrow-style payment release / Stripe Connect payout",
          "Automated SMS coordination link for Buyer + Seller + Inspector",
        ],
        skipForNow: [
          "Native iOS/Android apps (use mobile-first web)",
          "Supporting 20 item categories (furniture, clothes, appliances)",
          "Custom AI computer-vision defect detection before proving demand",
        ],
      },
      roadmap: [
        {
          phase: "Phase 1: Concierge Wedge Validation",
          timeframe: "Days 1–30",
          objective:
            "Prove buyers actually pay \$40–\$50 before writing marketplace matching code.",
          actions: [
            "Recruit 5 skilled repair technicians at local indie Mac/camera shops via WhatsApp/in-person visits.",
            "Post 'Certified Pre-Buy Inspection' landing page + manually handle bookings via Google Forms & Stripe links.",
            "Target active buyers in 3 local Facebook Marketplace & Reddit swap groups.",
          ],
          successMetric: "15 paid inspections completed with >4.7/5 buyer trust rating",
        },
        {
          phase: "Phase 2: Automated Dispatch & Report Card",
          timeframe: "Days 31–60",
          objective:
            "Replace manual scheduling with instant booking and a shareable verification certificate.",
          actions: [
            "Launch listing-URL intake + automated slot matching with vetted local techs.",
            "Ship tamper-proof QR Inspection Certificate sellers can attach to their listings.",
            "Add \$15 live video-triage tier to filter out obvious scams remotely.",
          ],
          successMetric: "60 monthly inspections and 20% seller-initiated pre-listing checks",
        },
        {
          phase: "Phase 3: Partner Hubs & City Expansion",
          timeframe: "Days 61–90",
          objective:
            "Eliminate travel overhead via repair-shop drop-off hubs and expand to a second category.",
          actions: [
            "Sign 10 local repair shops as official 'Safe Meetup & Inspect Hubs' (zero travel time).",
            "Launch B2B partnership pilot with local camera/bike forums and college marketplaces.",
            "Introduce optional 14-day mechanical breakdown micro-guarantee.",
          ],
          successMetric: "\$5,000+ monthly GMV with <15% cancellation rate",
        },
      ],
      firstTenCustomersPlaybook:
        "Monitor high-ticket MacBook & Sony camera listings posted in your city's Facebook groups and Reddit r/hardwareswap/local classifieds. DM buyers commenting 'interested' or post a helpful checklist with a \$25 introductory concierge inspection offer.",
    },
    telemetry: {
      durationMs: 1420,
      llmProviderUsed: "Preset Demo",
      tinySearchCalls: 4,
      tinyFetchCalls: 6,
      tinyAgentUsed: false,
    },
  },
  {
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
  },
  {
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
  },
];

