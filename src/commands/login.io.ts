import { C } from "../utils/screens.js";

export const success = (email: string) => `
Successfully logged in as ${C.bold(email)}.
`;

export const error = (err: string) => `
Cannot login at the moment: ${C.bold(err)}.
`;

export const codeInfo = (code: string) => `
Your device code is: ${code}. Press 'enter' to open browser and authenticate.
`;

export const urlInfo = (url: string) => `
You can also navigate manually to ${url} and enter the code.
`;
