import { expect, test } from "@playwright/test";

test("health endpoint exposes the service contract", async ({ request }) => {
  const response = await request.get("/api/health");
  const body = await response.text();
  expect(response.status(), body).toBe(200);
  const data = JSON.parse(body);
  expect(data.service).toBe("golden-starter-web");
  expect(data.status).toBe("ok");
  expect(data.version).toBe("2.0.0");
});
