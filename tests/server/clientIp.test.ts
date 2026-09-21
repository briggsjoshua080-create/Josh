import { describe, it, expect } from "vitest";
import { clientIp } from "../../api/feedback";
import type { IncomingMessage } from "http";

/**
 * The rate limit is only as good as the identity it keys on. Reading the FIRST
 * x-forwarded-for entry — the position the client controls — makes it
 * bypassable with a fresh fake value per request, so these pin the precedence.
 */
const req = (headers: Record<string, string | string[] | undefined>, remote?: string) =>
  ({ headers, socket: { remoteAddress: remote } }) as unknown as IncomingMessage;

describe("clientIp", () => {
  it("prefers x-real-ip, which the platform sets itself", () => {
    expect(clientIp(req({ "x-real-ip": "203.0.113.9", "x-forwarded-for": "1.1.1.1" }))).toBe("203.0.113.9");
  });

  it("takes the LAST forwarded hop, not the client-supplied first one", () => {
    // "9.9.9.9" is whatever the caller claimed; "203.0.113.9" is the real peer.
    expect(clientIp(req({ "x-forwarded-for": "9.9.9.9, 70.41.3.18, 203.0.113.9" }))).toBe("203.0.113.9");
  });

  it("ignores a spoofed first hop even when it is the only convincing one", () => {
    expect(clientIp(req({ "x-forwarded-for": "evil, 203.0.113.9" }))).not.toBe("evil");
  });

  it("handles a single hop", () => {
    expect(clientIp(req({ "x-forwarded-for": "203.0.113.9" }))).toBe("203.0.113.9");
  });

  it("handles the header arriving as an array", () => {
    expect(clientIp(req({ "x-forwarded-for": ["9.9.9.9", "203.0.113.9"] }))).toBe("203.0.113.9");
  });

  it("falls back to the socket peer, then to a constant", () => {
    expect(clientIp(req({}, "198.51.100.7"))).toBe("198.51.100.7");
    expect(clientIp(req({}))).toBe("unknown");
  });

  it("does not treat whitespace or empty entries as an identity", () => {
    expect(clientIp(req({ "x-real-ip": "   ", "x-forwarded-for": "  , 203.0.113.9 ,  " }))).toBe("203.0.113.9");
  });
});
