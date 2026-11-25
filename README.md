# SaaSProof — Multi-Agent Startup Co-Pilot

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.6-black)](https://nextjs.org)
[![Bun](https://img.shields.io/badge/Runtime-Bun%201.3-orange)](https://bun.com)
[![Tests](https://img.shields.io/badge/Tests-86%20Passed-success)](tests/)
[![Track](https://img.shields.io/badge/Track-PS08%3A%20Startup%20Co--Pilot-blue)](https://hack2skill.com)

> **Repository:** [https://github.com/Harshvdev/saasproof](https://github.com/Harshvdev/saasproof)

---

## Chosen Vertical

**PS08: Startup Co-Pilot** — Autonomous Venture Intelligence for Early-Stage Founders.

SaaSProof is designed around the early-stage founder persona (idea stage to pre-seed) who needs objective, research-backed market sizing, competitor teardown, customer discovery scripting, unit-economics stress testing, and a realistic 90-day MVP launch plan before writing months of code.

---

## Why This Matters

Over 90% of early-stage startups fail because they build something nobody wants or enter crowded markets with fatally flawed unit economics. Founders suffer from confirmation bias and spend months building MVPs before performing rigorous customer discovery, willingness-to-pay benchmarking, or unit-economics stress testing.

SaaSProof acts as an unsparing, highly analytical AI Co-Pilot that turns raw, unstructured founder ideas into a structured, grounded validation dossier backed by live web research in ~60 seconds:

1. **Critical Objective Feedback:** Replaces polite false positives with blunt Devil's Advocate viability scoring across 5 dimensions (Demand, Differentiation, Feasibility, Unit Economics, Defensibility).
2. **Grounded Market Reality:** Bottom-up TAM/SAM/SOM sizing backed by live web search and fetched source citations rather than ungrounded guesswork.
3. **Willingness-to-Pay Verification:** Dual-sided ICP personas and 5 non-leading discovery questions based on *The Mom Test*.
4. **Interactive Viability Modeling:** Real-time Unit Economics & Sensitivity Simulator to stress-test ARPU, CAC, monthly churn, LTV/CAC, and payback thresholds.
5. **Continuous Strategic Advisory:** An interactive, context-aware Co-Pilot workspace retaining full dossier memory for iterative pivot and GTM exploration.

---

## Approach and Logic

SaaSProof uses a **3-stage, 6-agent orchestrated pipeline** (`lib/agents/pipeline.ts`) designed for low latency, strict schema integrity, and grounded web research:

```
                  ┌──────────────────────────────────────────┐
                  │               Founder Idea               │
                  │  (Zod validation + injection guardrails) │
                  └────────────────────┬─────────────────────┘
                                       │
                                       ▼
                  ┌──────────────────────────────────────────┐
                  │         Stage 1: Idea Framer             │
                  │  (Deconstructs model, category, region   │
                  │       & 4 targeted web search queries)   │
                  └────────────────────┬─────────────────────┘
                                       │
       ┌───────────────────┬───────────┴───────────┬───────────────────┐
       ▼                   ▼                       ▼                   ▼
┌──────────────┐   ┌───────────────┐       ┌───────────────┐   ┌──────────────┐
│Market Analyst│   │Competitor     │       │Customer       │   │Devil's       │
│• TAM/SAM/SOM │   │ Intel         │       │ Profiler      │   │ Advocate     │
│• CAGR & macro│   │• Live pricing │       │• Demand/Supply│   │• 0–100 score │
│• Tail/Head-  │   │• Feature gaps │       │  ICP personas │   │• 5-axis math │
│  winds       │   │• White space  │       │• Mom-Test Qs  │   │• Fatal risks │
└──────┬───────┘   └───────┬───────┘       └───────┬───────┘   └──────┬───────┘
       │                   │                       │                  │
       └───────────────────┴───────────┬───────────┴──────────────────┘
                                       │
                                       ▼
                  ┌──────────────────────────────────────────┐
                  │       Stage 3: Execution Planner         │
                  │  • Focused launch wedge & monetization   │
                  │  • MVP Must-Build vs. Skip For Now       │
                  │  • 90-Day 3-Phase Roadmap & Playbook     │
                  └────────────────────┬─────────────────────┘
                                       │
                                       ▼
                  ┌──────────────────────────────────────────┐
                  │   Interactive Co-Pilot + Markdown Export │
                  └──────────────────────────────────────────┘
```

### Core Architecture & Logic Highlights

1. **Parallel Specialist Execution (`Promise.all` + Linked Cancellation):**
   Stage 1 frames the raw hypothesis and search queries; Stage 2 executes all four specialist agents (**Market Analyst**, **Competitor Intel**, **Customer Profiler**, and **Devil's Advocate**) concurrently via `Promise.all` with linked `AbortController` propagation so client disconnects or stage failures abort downstream requests immediately; Stage 3 synthesizes all findings into a cohesive 90-day roadmap.
2. **Deterministic SHA-256 Memoization & LRU Caching (`lib/cache.ts`):**
   Normalized startup queries and Co-Pilot follow-up questions are hashed with SHA-256 and cached in a bounded LRU memory cache (1-hour TTL, max 120 entries per store), resolving repeat queries without consuming LLM or scraping tokens.
3. **Multi-Provider LLM Resilience (`lib/llm/`):**
   - **Primary LLM:** Direct REST calls to Gemini (`gemini-3.5-flash-lite`, falling back to `gemini-3.5-flash`) with `application/json` structured output mode.
   - **Fallback LLM:** Automatic failover to Groq (`openai/gpt-oss-120b`, `qwen/qwen3.6-27b`, `openai/gpt-oss-20b` plus dynamic `/openai/v1/models` discovery and per-model rate-limit cooldown rotation) with a 3-attempt schema repair loop.
4. **Multi-Tier Live Web Grounding & SSRF Defense (`lib/tinyfish/`, `lib/url.ts`):**
   - Search via `TinySearch` with zero-config `DuckDuckGo` Instant Answer fallback.
   - Page extraction via optional `TinyAgent` browser automation, falling back cleanly to `TinyFetch` and `Jina Reader`.
   - Strict `validatePublicHttpUrl` SSRF checks reject `localhost`, private IPv4/IPv6 ranges, and cloud metadata endpoints before server requests, and `sanitizeSafeUrl` strips non-`http(s)` links in UI rendering and Markdown export.
5. **Security & Privacy Hardening (`lib/security.ts`, `lib/rate-limit.ts`, `lib/api-utils.ts`):**
   - Strict `Content-Type: application/json` and payload byte-size caps on API routes.
   - Prompt-injection and XSS payload filtering (`validatePromptGuard` HTTP 422), outbound secret redaction (`redactSecrets`), salted SHA-256 visitor key anonymization, `HttpOnly` session cookies, and CSP/HSTS/COOP/CORP headers (`next.config.ts`).
6. **Accessible, Code-Split UI (`app/page.tsx`, `components/`):**
   - Heavy workspaces and drawers (`ReportWorkspace`, `AgentMissionControl`, `HistoryDrawer`, `CopilotDrawer`) are dynamically loaded with `next/dynamic` and conditionally mounted.
   - WCAG 2.1 AA color tokens in light and dark themes, skip-to-content navigation (`#main-content`), `prefers-reduced-motion` support, native modal `<dialog>` drawers, and WAI-ARIA tablist keyboard navigation.

---

## How the Solution Works

### 1. Real-Time Streaming Intake (`/api/analyze`)
- Founders enter their startup idea (10–1,200 characters), target region, business model, and Deep Search toggle, or load one of 3 pre-computed real-world case studies.
- `/api/analyze` validates inputs with Zod (`AnalysisInputSchema`), checks prompt guardrails, enforces fair quotas, and streams `quota`, `stage`, `partial`, `complete`, and `error` events over Server-Sent Events (SSE).
- `AgentMissionControl` displays live progress, per-agent status, search queries, discovered citations, and a pause/resume buffer.

### 2. Interactive 5-Tab Validation Dossier (`ReportWorkspace`)
- **01 Overview:** Overall 0–100 Viability Score gauge, 5-axis scorecard, fatal risks with tactical mitigations, strategic pivot suggestions, and the interactive **Unit Economics & Sensitivity Simulator** (`SensitivityCalculator`).
- **02 Market:** Bottom-up TAM, SAM, and SOM sizing, CAGR growth outlook, tailwinds, headwinds, and clickable verified citations.
- **03 Competitors:** Direct and adjacent competitors with threat badges, pricing models, strengths, exploitable gaps, and the white-space opportunity.
- **04 Customers:** Multi-sided ICP personas, pain points, current workarounds, willingness-to-pay signals, and an interactive 5-question *Mom Test* interview script with one-click copy.
- **05 Plan:** Recommended launch wedge, monetization strategy, MVP Must-Build vs. Skip-For-Now scope, 90-day phased roadmap, and a First 10 Customers playbook.

### 3. Interactive Context-Aware Co-Pilot (`/api/copilot`)
- Founders can open the **Co-Pilot Drawer** on any report to test pivots, refine pricing, or draft cold outreach using the compressed validation dossier and optional live web search.

### 4. Client-Side History & Markdown Export
- Reports are persisted locally in browser `localStorage` (`saasproof_reports_v1`) with full schema verification on hydration, deletion support, and one-click structured Markdown download (`lib/export.ts`).

---

## Assumptions Made

1. **Founder Intent & Stage:** Assumes the user is evaluating an early-stage concept (idea to pre-seed) and benefits from candid risk analysis rather than uncritical affirmation.
2. **Web Grounding Availability:** Market sizing and competitor profiles rely on publicly indexed pages retrieved at runtime via TinyFish, DuckDuckGo, or Jina Reader; without `TINYFISH_API_KEY`, the system assumes zero-config fallbacks (`DuckDuckGo` + `Jina Reader`) provide sufficient baseline context.
3. **Stateless Privacy-First Persistence:** To avoid retaining sensitive founder IP in a backend database, validation dossiers are stored exclusively client-side in `localStorage`, while server memory holds only short-lived LRU caches and anonymized rate-limit buckets.
4. **Sliding-Window Fair Quotas:** Assumes single-instance or soft per-instance rate limits (`8` live analyses, `2` per-user / `25` global deep scrapes, and `25` Co-Pilot messages per 24 hours per salted SHA-256 visitor key) are appropriate for public evaluation without requiring user login.
5. **LLM Output Variance:** Assumes LLM responses may occasionally include markdown fences, wrapper objects, or minor schema drift, and defends against this deterministically with `extractJsonText`, Zod `safeParse`, and automated schema-repair re-prompting.

---

## Local Setup & Development

### Prerequisites
- [Bun](https://bun.com/) (v1.3+) or Node.js (v20+)
- Git

### 1. Clone & Install
```bash
git clone https://github.com/Harshvdev/saasproof.git
cd saasproof
bun install
```

### 2. Environment Configuration
Create `.env.local` from `.env.example`:
```bash
cp .env.example .env.local
```
Set your API keys:
```env
GEMINI_API_KEY="your-gemini-api-key"
GROQ_API_KEY="your-groq-api-key"        # Optional fallback LLM
TINYFISH_API_KEY="your-tinyfish-api-key" # Optional for TinySearch/TinyFetch/TinyAgent
RATE_LIMIT_SALT="your-random-secret"     # Recommended in production
```

### 3. Run Quality & Test Suite
```bash
# Run unit, security, integration, pipeline, and accessibility tests (86 passing tests across 15 files)
bun test

# Run ESLint and TypeScript typecheck
bun run lint
./node_modules/.bin/tsc --noEmit

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

The application targets **Vercel** with Next.js 16 App Router (`vercel.json`):
- **Serverless Route Config:** `/api/analyze` (`maxDuration = 300`), `/api/copilot` (`maxDuration = 60`), and `/api/health` (`Cache-Control: no-store`) run on the Node.js runtime.
- **Security Headers:** Configured in `next.config.ts` with CSP, HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Permissions-Policy`, COOP, and CORP.
