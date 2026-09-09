const DEFAULTS = { reporting: true, testData: true };
export function normalizeOptions(options = {}) {
    const known = new Set(["reporting", "testData"]);
    const unknown = Object.keys(options).filter((key) => !known.has(key));
    if (unknown.length > 0)
        throw new Error(`Unknown Cypress platform capability: ${unknown.join(", ")}`);
    return { ...DEFAULTS, ...options };
}
function registerTask(on, name, task) {
    on("task", { [name]: task });
}
function registerCompanyTasks(on, options) {
    if (options.testData)
        registerTask(on, "xq:echoTestData", (value) => value ?? null);
}
export function applyCompanyDefaults(config) {
    return { ...config, env: { ...(config.env ?? {}), xqPlatform: true } };
}
export async function setupCompanyCypress(on, config, capabilities = {}) {
    const options = normalizeOptions(capabilities);
    registerCompanyTasks(on, options);
    return applyCompanyDefaults({
        ...config,
        env: { ...(config.env ?? {}), xqCapabilities: options }
    });
}
//# sourceMappingURL=index.js.map