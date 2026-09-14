export interface CompanyCapabilities {
  reporting?: boolean
  testData?: boolean
}

const DEFAULTS: Required<CompanyCapabilities> = { reporting: true, testData: true }

export function normalizeOptions(options: CompanyCapabilities = {}): Required<CompanyCapabilities> {
  const known = new Set<keyof CompanyCapabilities>(["reporting", "testData"])
  const unknown = Object.keys(options).filter((key) => !known.has(key as keyof CompanyCapabilities))
  if (unknown.length > 0) throw new Error(`Unknown Cypress platform capability: ${unknown.join(", ")}`)
  return { ...DEFAULTS, ...options }
}

function registerTask(on: Cypress.PluginEvents, name: string, task: (value: unknown) => unknown): void {
  on("task", { [name]: task })
}

function registerCompanyTasks(on: Cypress.PluginEvents, options: Required<CompanyCapabilities>): void {
  if (options.testData) registerTask(on, "xq:echoTestData", (value) => value ?? null)
}

export function applyCompanyDefaults(config: Cypress.PluginConfigOptions): Cypress.PluginConfigOptions {
  return { ...config, env: { ...(config.env ?? {}), xqPlatform: true } }
}

export async function setupCompanyCypress(
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions,
  capabilities: CompanyCapabilities = {}
): Promise<Cypress.PluginConfigOptions> {
  const options = normalizeOptions(capabilities)
  registerCompanyTasks(on, options)
  return applyCompanyDefaults({
    ...config,
    env: { ...(config.env ?? {}), xqCapabilities: options }
  })
}
