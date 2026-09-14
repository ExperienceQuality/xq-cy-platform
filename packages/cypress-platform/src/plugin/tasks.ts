import type { ResolvedCompanyCapabilities } from "./capabilities.js"

function registerTask(on: Cypress.PluginEvents, name: string, task: (value: unknown) => unknown): void {
  on("task", { [name]: task })
}

export function registerCompanyTasks(on: Cypress.PluginEvents, capabilities: ResolvedCompanyCapabilities): void {
  if (capabilities.testData) registerTask(on, "xq:echoTestData", (value) => value ?? null)
}
