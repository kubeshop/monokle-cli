import { C } from "../utils/screens.js";

export const success = (user: string, origin: string) => `
Logged in as ${C.bold(user)} with ${C.bold(origin)}.
`;

export const error = `
You are not signed into Monokle Cloud - use ${C.bold('monokle login')} to sign in.
`;
