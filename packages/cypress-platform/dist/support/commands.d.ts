export interface CypressLike {
    Commands: {
        add(name: string, callback: () => unknown): void;
    };
}
export declare function registerCompanyCommands(cypress: CypressLike): void;
//# sourceMappingURL=commands.d.ts.map