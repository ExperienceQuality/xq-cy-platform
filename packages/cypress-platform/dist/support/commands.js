export function registerCompanyCommands(cypress) {
    if (!cypress?.Commands?.add)
        throw new TypeError("Cypress.Commands.add is required to register XQ commands");
    cypress.Commands.add("xqPlatformReady", () => true);
}
//# sourceMappingURL=commands.js.map