import { C } from "../utils/screens.js";

export const success = () => `
Logged out successfully.
`;

export const error = (err: string) => `
Cannot logout at the moment. Try again with ${C.bold('monokle logout')}. Error: ${C.red(err)}.
`;
