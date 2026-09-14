export { normalizeOptions, type CompanyCapabilities, type ResolvedCompanyCapabilities } from "./capabilities.js"
export { applyCompanyDefaults } from "./config.js"

import { normalizeOptions, type CompanyCapabilities } from "./capabilities.js"
import { applyCapabilityEnv, applyCompanyDefaults } from "./config.js"
import { registerCompanyTasks } from "./tasks.js"

export async function setupCompanyCypress(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions,
  capabilities: CompanyCapabilities = {}
): Promise<Cypress.PluginConfigOptions> {
  const options = normalizeOptions(capabilities)
  registerCompanyTasks(on, options)
  return applyCompanyDefaults(applyCapabilityEnv(config, options))
}
