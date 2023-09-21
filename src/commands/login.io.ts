import prompts from "prompts";
import { C } from "../utils/screens.js";

export const promptForDeviceFlowInput = async () => {
  const deviceFlowInput = await prompts({
    type: 'text',
    name: 'value',
    message: `${C.bold('Press Enter')} to open browser and authenticate.`,
  });

  return deviceFlowInput.value !== undefined ? true : false;
}

export const success = (email: string) => `
Successfully logged in as ${C.bold(email)}.
`;

export const cancelled = `
Login cancelled.
`;

export const error = (err: string) => `
Cannot login at the moment: ${C.bold(err)}.
`;

export const waiting = `
Waiting for authentication process to complete...
`;

export const urlInfo = (url: string) => `
You can also navigate manually to ${url} and enter the code.
`;
