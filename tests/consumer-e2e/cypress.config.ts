import { defineConfig } from "cypress"
import { setupCompanyCypress } from "@xq/cypress-platform/plugin"

export default defineConfig({
  e2e: {
    baseUrl: process.env.DUMMY_API_URL ?? "http://127.0.0.1:4310",
    setupNodeEvents(on, config) {
      return setupCompanyCypress(on, config)
    }
  }
})
