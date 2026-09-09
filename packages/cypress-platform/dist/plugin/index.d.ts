export interface CompanyCapabilities {
    reporting?: boolean;
    testData?: boolean;
}
export interface CompanyConfig {
    env?: Record<string, unknown>;
    [key: string]: unknown;
}
export type CypressEventHandler = (event: string, value: unknown) => void;
export declare function normalizeOptions(options?: CompanyCapabilities): Required<CompanyCapabilities>;
export declare function applyCompanyDefaults(config: CompanyConfig): CompanyConfig;
export declare function setupCompanyCypress(on: CypressEventHandler, config: CompanyConfig, capabilities?: CompanyCapabilities): Promise<CompanyConfig>;
//# sourceMappingURL=index.d.ts.map