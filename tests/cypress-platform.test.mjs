import test from "node:test"
import assert from "node:assert/strict"
import { normalizeOptions, setupCompanyCypress } from "../packages/cypress-platform/src/plugin/index.ts"

test("platform enables documented defaults", async () => {
  const registrations = []
  const config = await setupCompanyCypress((event, value) => registrations.push([event, value]), { env: { app: "dummy" } })

  assert.equal(config.env.app, "dummy")
  assert.equal(config.env.xqPlatform, true)
  assert.deepEqual(config.env.xqCapabilities, { reporting: true, testData: true })
  assert.equal(registrations[0][0], "task")
  assert.equal(typeof registrations[0][1]["xq:echoTestData"], "function")
})

test("disabled test data does not register its task", async () => {
  const registrations = []
  await setupCompanyCypress((event, value) => registrations.push([event, value]), {}, { testData: false })
  assert.deepEqual(registrations, [])
})

test("unknown capabilities fail clearly", () => {
  assert.throws(() => normalizeOptions({ vendorPlugin: true }), /Unknown Cypress platform capability: vendorPlugin/)
})
