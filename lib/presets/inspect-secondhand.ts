import type { StartupReport } from "../types";

export const inspectSecondhandPreset: StartupReport = {
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
};
