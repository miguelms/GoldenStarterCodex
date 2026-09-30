export function healthPayload() {
  return {
    service: "golden-starter-web",
    status: "ok" as const,
    version: "2.0.0",
    timestamp: new Date().toISOString(),
  };
}
