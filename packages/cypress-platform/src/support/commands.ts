export interface CypressLike {
  Commands: { add(name: string, callback: () => unknown): void }
}

export function registerCompanyCommands(cypress: CypressLike): void {
  if (!cypress?.Commands?.add) throw new TypeError("Cypress.Commands.add is required to register XQ commands")
  cypress.Commands.add("xqPlatformReady", () => true)
}
