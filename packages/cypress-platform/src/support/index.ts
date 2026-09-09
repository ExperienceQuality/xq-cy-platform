import { registerCompanyAssertions } from "./assertions.js"
import { registerCompanyCommands, type CypressLike } from "./commands.js"

declare const Cypress: CypressLike | undefined

if (typeof Cypress !== "undefined") {
  registerCompanyCommands(Cypress)
  registerCompanyAssertions()
}
