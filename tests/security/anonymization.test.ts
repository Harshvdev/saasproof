import { describe, expect, test } from "bun:test";
import { extractUserKey } from "../../lib/rate-limit";
import { anonymizeVisitorKey } from "../../lib/security";

describe("Security Suite: Cryptographic IP Anonymization", () => {
  test("generates a deterministic 64-char SHA-256 hash for raw visitor identifiers", () => {
    const rawIp = "203.0.113.195";
    const hashA = anonymizeVisitorKey(rawIp);
    const hashB = anonymizeVisitorKey(rawIp);

    expect(hashA).toBe(hashB);
    expect(hashA).toMatch(/^[a-f0-9]{64}$/);
    expect(hashA).not.toContain(rawIp);
  });

  test("produces different hashes with custom salts", () => {
    const rawIp = "198.51.100.42";
    const hashA = anonymizeVisitorKey(rawIp, "salt_alpha");
    const hashB = anonymizeVisitorKey(rawIp, "salt_beta");

    expect(hashA).not.toBe(hashB);
  });

  test("extractUserKey anonymizes x-forwarded-for header without storing raw IP", () => {
    const req = new Request("https://saasproof.dev/api/analyze", {
      headers: {
        "x-forwarded-for": "192.0.2.1, 10.0.0.1",
      },
    });

    const userKey = extractUserKey(req);
    expect(userKey).toMatch(/^[a-f0-9]{64}$/);
    expect(userKey).not.toContain("192.0.2.1");
  });

  test("extractUserKey blends cookie UID with IP before hashing", () => {
    const reqA = new Request("https://saasproof.dev/api/analyze", {
      headers: {
        cookie: "saasproof_uid=sp_testuser123456",
        "x-real-ip": "198.51.100.8",
      },
    });

    const reqB = new Request("https://saasproof.dev/api/analyze", {
      headers: {
        cookie: "saasproof_uid=sp_otheruser789012",
        "x-real-ip": "198.51.100.8",
      },
    });

    const keyA = extractUserKey(reqA);
    const keyB = extractUserKey(reqB);

    expect(keyA).toMatch(/^[a-f0-9]{64}$/);
    expect(keyB).toMatch(/^[a-f0-9]{64}$/);
    expect(keyA).not.toBe(keyB);
  });
});
