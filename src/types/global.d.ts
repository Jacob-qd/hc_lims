// Global escape-hatch type for legacy code that cannot be strictly typed
// without a massive refactor. Prefer using proper types in new code.
// This is declared globally so no import is required.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare type LooseAny = any;
