import prompts from "prompts";
import { C } from "../utils/screens.js";

const AUTH_METHOD_LABELS: {[key: string]: string} = {
  'device code': 'Login with a web browser',
  'token': 'Paste an authentication token',
};

export const promptForLoginMethod = async (methods: string[]) => {
  const loginMethodSelect = await prompts({
    type: 'select',
    name: 'method',
    message: 'How would you like to authenticate to Monkole Cloud?',
    choices:
      methods.map(method => ({
        title: AUTH_METHOD_LABELS[method],
        value: method,
      })).filter(choice => choice.title),
    initial: 0,
  });

  return loginMethodSelect.method;
};

export const promptForDeviceFlowInput = async () => {
  const deviceFlowInput = await prompts({
    type: 'text',
    name: 'value',
    message: `${C.bold('Press Enter')} to open browser and authenticate.`,
  });

  return deviceFlowInput.value !== undefined ? true : false;
}

export const promptForToken = async () => {
  const tokenInput = await prompts({
    type: 'text',
    name: 'value',
    message: 'Paste your authentication token:',
  });

  return tokenInput.value;
};

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
