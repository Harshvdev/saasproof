import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { z } from "zod";
import {
  extractJsonText,
  generateChatReply,
  generateStructuredJSON,
  resetLlmCaches,
} from "../../lib/llm";
import { createMockFetch } from "../helpers/mock-fetch";

const originalFetch = globalThis.fetch;
const originalGemini = process.env.GEMINI_API_KEY;
const originalGroq = process.env.GROQ_API_KEY;

describe("Unit Suite: LLM JSON Extraction, Repair & Provider Fallback", () => {
  beforeEach(() => {
    resetLlmCaches();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    if (originalGemini === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalGemini;
    if (originalGroq === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = originalGroq;
  });

  test("extracts raw JSON cleanly when no markdown code blocks are present", () => {
    const raw = '{"startupTitle": "CleanData", "score": 85}';
    expect(extractJsonText(raw)).toBe(raw);
  });

  test("strips json code fences from LLM responses", () => {
    const raw = '```json\n{\n  "startupTitle": "CleanData"\n}\n```';
    expect(extractJsonText(raw)).toBe('{\n  "startupTitle": "CleanData"\n}');
  });

  test("handles code fences without json language specifier", () => {
    const raw = '```\n{"key": "val"}\n```';
    expect(extractJsonText(raw)).toBe('{"key": "val"}');
  });

  test("trims conversational preambles around code fences or bare braces", () => {
    const fenced = 'Here is the result:\n```json\n{"ready": true}\n```\nHope this helps!';
    expect(extractJsonText(fenced)).toBe('{"ready": true}');

    const bare = 'Analysis output: {"score": 78, "ok": true} — end.';
    expect(extractJsonText(bare)).toBe('{"score": 78, "ok": true}');
  });

  test("generateStructuredJSON unwraps single-key wrapper objects from Gemini", async () => {
    process.env.GEMINI_API_KEY = "AIzaSyFakeGeminiKeyForUnitTestingOnly123";
    const SampleSchema = z.object({ title: z.string(), score: z.number() });

    globalThis.fetch = createMockFetch(async () =>
      new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [{ text: JSON.stringify({ data: { title: "Pulse", score: 82 } }) }],
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const res = await generateStructuredJSON({
      systemPrompt: "Sys",
      userPrompt: "User",
      schema: SampleSchema,
      schemaHint: '{"title":"string","score":0}',
    });

    expect(res.provider).toBe("Gemini");
    expect(res.data).toEqual({ title: "Pulse", score: 82 });
  });

  test("generateStructuredJSON falls back to Groq and retries on schema mismatch", async () => {
    delete process.env.GEMINI_API_KEY;
    process.env.GROQ_API_KEY = "gsk_fakegroqkeyforunittestingonly1234567890abcdef";
    const SampleSchema = z.object({ title: z.string(), score: z.number() });

    let completionAttempt = 0;
    globalThis.fetch = createMockFetch(async (input) => {
      const url = String(input);
      if (url.includes("/openai/v1/models")) {
        return new Response(
          JSON.stringify({ data: [{ id: "openai/gpt-oss-120b" }] }),
          { status: 200 }
        );
      }
      completionAttempt += 1;
      const content =
        completionAttempt === 1
          ? JSON.stringify({ title: "MissingScore" }) // invalid on 1st attempt
          : JSON.stringify({ title: "Repaired", score: 91 });
      return new Response(
        JSON.stringify({ choices: [{ message: { content } }] }),
        { status: 200 }
      );
    });

    const res = await generateStructuredJSON({
      systemPrompt: "Sys",
      userPrompt: "User",
      schema: SampleSchema,
      schemaHint: '{"title":"string","score":0}',
    });

    expect(res.provider).toBe("Groq");
    expect(res.data).toEqual({ title: "Repaired", score: 91 });
    expect(completionAttempt).toBe(2);
  });

  test("generateChatReply falls back cleanly from Gemini to Groq", async () => {
    process.env.GEMINI_API_KEY = "AIzaSyFakeGeminiKeyForUnitTestingOnly123";
    process.env.GROQ_API_KEY = "gsk_fakegroqkeyforunittestingonly1234567890abcdef";

    globalThis.fetch = createMockFetch(async (input) => {
      const url = String(input);
      if (url.includes("generativelanguage.googleapis.com")) {
        return new Response("Service Unavailable", { status: 503 });
      }
      if (url.includes("/openai/v1/models")) {
        return new Response(JSON.stringify({ data: [] }), { status: 200 });
      }
      return new Response(
        JSON.stringify({ choices: [{ message: { content: "Pivot to B2B." } }] }),
        { status: 200 }
      );
    });

    const reply = await generateChatReply({
      systemPrompt: "Co-Pilot",
      userPrompt: "Should I pivot?",
    });

    expect(reply.provider).toBe("Groq");
    expect(reply.text).toBe("Pivot to B2B.");
  });
});
