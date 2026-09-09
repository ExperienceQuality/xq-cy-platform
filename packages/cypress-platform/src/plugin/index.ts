export interface CompanyCapabilities {
  reporting?: boolean
  testData?: boolean
}

export interface CompanyConfig {
  env?: Record<string, unknown>
  [key: string]: unknown
}

export type CypressEventHandler = (event: string, value: unknown) => void

const DEFAULTS: Required<CompanyCapabilities> = { reporting: true, testData: true }

export function normalizeOptions(options: CompanyCapabilities = {}): Required<CompanyCapabilities> {
  const known = new Set<keyof CompanyCapabilities>(["reporting", "testData"])
  const unknown = Object.keys(options).filter((key) => !known.has(key as keyof CompanyCapabilities))
  if (unknown.length > 0) throw new Error(`Unknown Cypress platform capability: ${unknown.join(", ")}`)
  return { ...DEFAULTS, ...options }
}

function registerTask(on: CypressEventHandler, name: string, task: (value: unknown) => unknown): void {
  on("task", { [name]: task })
}

function registerCompanyTasks(on: CypressEventHandler, options: Required<CompanyCapabilities>): void {
  if (options.testData) registerTask(on, "xq:echoTestData", (value) => value ?? null)
}

export function applyCompanyDefaults(config: CompanyConfig): CompanyConfig {
  return { ...config, env: { ...(config.env ?? {}), xqPlatform: true } }
}

export async function setupCompanyCypress(
  on: CypressEventHandler,
  config: CompanyConfig,
  capabilities: CompanyCapabilities = {}
): Promise<CompanyConfig> {
  const options = normalizeOptions(capabilities)
  registerCompanyTasks(on, options)
  return applyCompanyDefaults({
    ...config,
    env: { ...(config.env ?? {}), xqCapabilities: options }
  })
}
