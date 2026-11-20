import { describe, expect, test } from "bun:test";
import { extractJsonText } from "../../lib/llm";

describe("Unit Suite: LLM JSON Extraction & Sanitization", () => {
  test("extracts raw JSON cleanly when no markdown code blocks are present", () => {
    const raw = '{"startupTitle": "CleanData", "score": 85}';
    expect(extractJsonText(raw)).toBe(raw);
  });

  test("strips json code fences from LLM responses", () => {
    const raw = "```json\n{\n  \"startupTitle\": \"CleanData\"\n}\n```";
    expect(extractJsonText(raw)).toBe('{\n  "startupTitle": "CleanData"\n}');
  });

  test("handles code fences without json language specifier", () => {
    const raw = "```\n{\"key\": \"val\"}\n```";
    expect(extractJsonText(raw)).toBe('{"key": "val"}');
  });

  test("trims leading and trailing whitespace and conversational preambles", () => {
    const raw = "Here is the result:\n```json\n{\"ready\": true}\n```\nHope this helps!";
    expect(extractJsonText(raw)).toBe('{"ready": true}');
  });
});
