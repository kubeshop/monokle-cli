import prompts from "prompts";
import { C } from "../utils/screens.js";

export const promptForKubernetesVersion = async () => {
  const kubernetesVersionSelect = await prompts({
    type: 'text',
    name: 'value',
    message: 'Add your Kubernetes version (e.g. v1.27.1)',
    validate: (value: string) => value.length > 0 && value.trim().match(/v\d\.\d\d\.\d+/g) ? true : 'Please enter a valid Kubernetes version'
  });

  return kubernetesVersionSelect.value;
};

export const promptForFrameworks = async () => {
  const frameworkSelect = await prompts({
    type: 'multiselect',
    name: 'value',
    message: 'Choose frameworks',
    choices: [
      { title: 'Baseline Pod Security Standard', value: 'pss-baseline' },
      { title: 'Restricted Pod Security Standard', value: 'pss-restricted' },
      { title: 'Kubernetes Hardening Guidance by NSA & CISA', value: 'nsa' }
    ],
    min: 1,
    max: 3,
    hint: '- Space to select. Return to submit.'
  });

  return frameworkSelect.value;
};


export const success = (path: string) => `
Successfully generated policy configuration file in ${C.bold(path)}.
`;

export const error = (err: string) => `
Error generating policy configuration file: ${C.bold(err)}.
`;
