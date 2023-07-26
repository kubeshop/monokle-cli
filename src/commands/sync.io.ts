import { C } from "../utils/screens.js";

export const success = (dir: string, repo: string) => `
Successfully synchronized policy for ${C.bold(dir)} directory (${C.bold(repo)} repository).
`;

export const error = (err: string) => `
Cannot synchronize policy from Monokle Cloud: ${C.bold(err)}
`;