import { describe, expect, it } from "vitest";

describe("integration harness", () => {
  it("is intentionally wired before the database slice", () => {
    expect(process.env.NODE_ENV ?? "test").toBeTypeOf("string");
  });
});
