export interface CompanyCapabilities {
  reporting?: boolean
  testData?: boolean
}

export type ResolvedCompanyCapabilities = Required<CompanyCapabilities>

const KNOWN_CAPABILITIES = new Set<keyof CompanyCapabilities>(["reporting", "testData"])
const DEFAULT_CAPABILITIES: ResolvedCompanyCapabilities = { reporting: true, testData: true }

export function normalizeOptions(options: CompanyCapabilities = {}): ResolvedCompanyCapabilities {
  const unknown = Object.keys(options).filter((key) => !KNOWN_CAPABILITIES.has(key as keyof CompanyCapabilities))
  if (unknown.length > 0) throw new Error(`Unknown Cypress platform capability: ${unknown.join(", ")}`)
  return { ...DEFAULT_CAPABILITIES, ...options }
}
