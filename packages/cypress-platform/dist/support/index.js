import { registerCompanyAssertions } from "./assertions.js";
import { registerCompanyCommands } from "./commands.js";
if (typeof Cypress !== "undefined") {
    registerCompanyCommands(Cypress);
    registerCompanyAssertions();
}
//# sourceMappingURL=index.js.map