# SaaSProof — Multi-Agent Startup Co-Pilot

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.6-black)](https://nextjs.org)
[![Bun](https://img.shields.io/badge/Runtime-Bun%201.3-orange)](https://bun.com)
[![Tests](https://img.shields.io/badge/Tests-52%20Passed-success)](tests/)

> **Repository:** [https://github.com/Harshvdev/saasproof](https://github.com/Harshvdev/saasproof)

---

## Why This Matters
Over 90% of early-stage startups fail because they build something nobody wants or enter crowded markets with fatally flawed unit economics. Founders suffer from confirmation bias and spend months building MVPs before performing rigorous customer discovery or competitor benchmarking.

SaaSProof acts as an unsparing, highly analytical AI Co-Pilot that turns raw, unstructured founder ideas into an exhaustive, battle-tested validation dossier backed by real-time web research in under 60 seconds.

---

## Approach and Logic

SaaSProof uses a **3-stage, 6-agent orchestrated pipeline** designed for speed, deep analytical rigor, and zero hallucinations:

```
                  ┌─────────────────────────────────┐
                  │          Founder Idea           │
                  └────────────────┬────────────────┘
                                   │
                                   ▼
                  ┌─────────────────────────────────┐
                  │     Stage 1: Idea Framer        │
                  │  (Deconstructs model, category, │
                  │     target geo & search terms)  │
                  └────────────────┬────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         │                         │                         │
         ▼                         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│ Market Analyst  │       │ Competitor Intel│       │Customer Profiler│
│ • TAM/SAM/SOM   │       │ • Live pricing  │       │ • Demand ICP    │
│ • CAGR & trends │       │ • Feature gaps  │       │ • Supply ICP    │
│ • Tail/Headwinds│       │ • Threat matrix │       │ • Mom-Test Qs   │
└────────┬────────┘       └────────┬────────┘       └────────┬────────┘
         │                         │                         │
         └─────────────────────────┼─────────────────────────┘
                                   │
                                   ▼
                  ┌─────────────────────────────────┐
                  │    Stage 2: Devil's Advocate    │
                  │   • 0–100 Viability Score       │
                  │   • 5-Axis Score Breakdown      │
                  │   • Unit Economics Reality Check│
                  │   • Fatal Risks & Mitigations   │
                  └────────────────┬────────────────┘
                                   │
                                   ▼
                  ┌─────────────────────────────────┐
                  │   Stage 3: Execution Planner    │
                  │   • 90-Day 3-Phase Roadmap      │
                  │   • MVP Must-Build vs Skip      │
                  │   • First 10 Customers Playbook │
                  └────────────────┬────────────────┘
                                   │
                                   ▼
                  ┌─────────────────────────────────┐
                  │ Interactive Co-Pilot + Markdown │
                  └─────────────────────────────────┘
```

### Core Architecture & Logic Highlights
1. **Parallel Specialist Execution (`Promise.all`):**
   Instead of running agents sequentially (which took ~180s), Stage 2 runs Market Analyst, Competitor Intel, Customer Profiler, and Devil's Advocate in parallel, completing exhaustive multi-agent research in **~55 seconds**.
2. **In-Memory SHA-256 Memoization & LRU Caching:**
   Identical startup queries and repeat co-pilot questions are cryptographically hashed and memoized in-memory (`lib/cache.ts`), resolving in **< 50 milliseconds** with 0 API tokens consumed on repeat benchmarking.
3. **Multi-Model Dynamic Fallback:**
   - **Primary LLM:** Gemini 2.5 Flash via `@google/genai` (low latency, structured outputs, high context window).
   - **Secondary LLM:** Groq Llama 3.3 70B Versatile / Llama 3.1 8B with automatic model discovery and rate-limit rotation.
4. **Multi-Tier Live Web Grounding:**
   - Real-time search via `TinySearch` with zero-config `DuckDuckGo` API fallback.
   - Deep page scraping via `TinyAgent` (browser automation) with automatic fallback to `TinyFetch` and `Jina Reader`.
5. **Modular Subcomponent Hierarchy & Code-Splitting:**
   - Strict Single-Responsibility Principle: all report tabs are isolated under `components/report/` (`OverviewTab`, `MarketTab`, `CompetitorsTab`, `CustomersTab`, `RoadmapTab`).
   - Heavy workspaces and drawers are dynamically imported (`next/dynamic`), minimizing the initial JavaScript payload.
6. **Resilient JSON Recovery:**
   - Custom `extractJsonText` handles markdown code blocks, backtick stripping, and nested root objects.
   - Self-healing retry loops with validation error re-prompting.

---

## How the Solution Works

### 1. Real-Time Streaming UI (Server-Sent Events)
- The founder enters their raw startup idea (or selects one of the pre-loaded real-world case studies).
- Next.js Edge route `/api/analyze` streams live pipeline progress (`quota`, `stage`, `partial`, and `citations`) over SSE.
- The UI displays an active progress bar with estimated time remaining and live status badges for each specialist agent.

### 2. Comprehensive 5-Tab Validation Dossier
- **Viability Verdict:** Overall 0–100 Viability Score across 5 weighted dimensions (Demand, Differentiation, Feasibility, Unit Economics, Defensibility), critical risks with tactical mitigations, and high-leverage pivot suggestions.
- **Market Sizing:** Bottom-up TAM, SAM, and SOM calculations with growth rates (CAGR) and macro tailwinds/headwinds.
- **Competitors:** Direct and indirect competitors with verified URLs, pricing models, positioning, and white-space market opportunities.
- **Customer Profiles:** Dual-sided ICP personas (Demand Buyer + Supply Partner), willingness-to-pay brackets, and 5 "Mom-Test" discovery questions designed to avoid false positives.
- **Execution Roadmap:** 90-day phased execution plan (Days 1–30, 31–60, 61–90) with success metrics, MVP feature scoping (Must-Build vs. Skip For Now), and a "First 10 Customers" acquisition playbook.

### 3. Interactive Context-Aware Co-Pilot
- After report generation, founders can open the **Co-Pilot Drawer** to ask follow-up questions (e.g., *"How do I acquire my first 10 customers without paid ads?"*).
- The Co-Pilot injects the entire analysis dossier into context and optionally queries the live web to answer specialized inquiries.

### 4. Privacy & Zero-Database Storage
- Generated reports are saved directly to the user's browser via `localStorage` with full history restoration, deletion, and one-click Markdown export.

---

## Assumptions Made

1. **Founder Intent & Maturity:** The system assumes the user has an early-stage concept (idea stage to pre-seed) and values critical, objective feedback over unwarranted validation.
2. **Grounding & Web Freshness:** Market sizing and competitor listings are grounded in live web snippets queried during execution; figures reflect currently indexed public data (e.g., Statista, TechCrunch, SEC filings, and competitor landing pages).
3. **Stateless Scalability:** To ensure zero database lock-in and zero retention of sensitive founder IP, report history is stored entirely client-side in `localStorage`.
4. **Sliding-Window Fair Quotas:** To prevent bot abuse while keeping access generous for real use, rate limits are enforced via an in-memory sliding window (8 analyses / 25 co-pilot queries per 24 hours per user IP/cookie).
5. **LLM Non-Determinism Defense:** While LLMs may occasionally produce malformed JSON or wrap keys unexpectedly, our pipeline assumes schema variance and implements deterministic Zod validation with automatic fallback re-prompting.

---

## Local Setup & Development

### Prerequisites
- [Bun](https://bun.com/) (v1.2+) or Node.js (v20+)
- Git

### 1. Clone & Install
```bash
git clone https://github.com/Harshvdev/saasproof.git
cd saasproof
bun install
```

### 2. Environment Configuration
Create a `.env.local` file from `.env.example`:
```bash
cp .env.example .env.local
```
Provide your API keys:
```env
GEMINI_API_KEY="your-gemini-api-key"
GROQ_API_KEY="your-groq-api-key"        # Optional fallback
TINYFISH_API_KEY="your-tinyfish-api-key" # Optional for live web scraping
```

### 3. Run Quality & Test Suite
```bash
# Run comprehensive multi-suite tests: unit, security, integration, accessibility (52 passing tests, <500ms)
bun run test

# Run ESLint check (0 errors, 0 warnings)
bun run lint

# Build production bundle
bun run build
```

### 4. Start Development Server
```bash
bun dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment

The application is deployed on **Vercel** with Next.js App Router:
- **Vercel Config:** `maxDuration: 300` on `/api/analyze` and `maxDuration: 60` on `/api/copilot` configured in [vercel.json](vercel.json).
- **Edge Performance:** Sub-500ms TTFB with HSTS and asset preloading.
