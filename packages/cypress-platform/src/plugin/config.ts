import type { ResolvedCompanyCapabilities } from "./capabilities.js"

export function applyCompanyDefaults(config: Cypress.PluginConfigOptions): Cypress.PluginConfigOptions {
  return { ...config, env: { ...(config.env ?? {}), xqPlatform: true } }
}

export function applyCapabilityEnv(
  config: Cypress.PluginConfigOptions,
  capabilities: ResolvedCompanyCapabilities
): Cypress.PluginConfigOptions {
  return {
    ...config,
    env: { ...(config.env ?? {}), xqCapabilities: capabilities }
  }
}
