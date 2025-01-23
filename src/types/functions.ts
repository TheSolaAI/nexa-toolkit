export const fnArgsTypes = {
    tokenA: "string",
    tokenB: "string",
    from: "string",
    to: "string",
    amount: "number"
} as const;

export type FunctionArgTypes = typeof fnArgsTypes;