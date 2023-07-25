import { C } from "../utils/screens.js";

export const success = () => `
Logged out successfully.
`;

export const error = () => `
Cannot logout at the moment. Try again with ${C.bold('monokle logout')}.
`;
