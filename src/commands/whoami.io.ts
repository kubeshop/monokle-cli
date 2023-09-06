import { C } from "../utils/screens.js";

export const success = (user: string) => `
Logged in as ${C.bold(user)}.
`;

export const error = `
You are not signed into Monokle Cloud - use ${C.bold('monokle login')} to sign in or create an account on https://app.monokle.com.
`;
