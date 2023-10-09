import prompts from "prompts";
import { C } from "../utils/screens.js";

export const promptForKubernetesVersion = async () => {
  const response = await fetch("https://plugins.monokle.com/schemas/catalog.json");

  if (!response.ok) {
    return promptForKubernetesVersionFallback();
  }

  const data: {versions: string[]} = await response.json();
  const versions = data?.versions?.reverse();

  if (!versions) {
    return promptForKubernetesVersionFallback();
  }

  const mainVersion: string[] =  [...new Set(versions.map((v: string) => v.split(".").slice(0,2).join(".")))];
  const kubernetesMainVersionSelect = await prompts({
    type: 'select',
    name: 'value',
    message: 'Select your Kubernetes version',
    choices: mainVersion.map((v: string) => v.split(".").slice(0,2).join(".")).map((v: string) => ({title: v, value: v })),
    validate: (value: string) => value.length > 0 && value.trim().match(/v?\d\.\d\d\.\d+/g) ? true : 'Please enter a valid Kubernetes version (e.g. 1.27.1)'
  });


  const patchVersions: string[] = versions.filter(v => v.startsWith(kubernetesMainVersionSelect.value))
  const kubernetesPatchVersionSelect = await prompts({
    type: 'select',
    name: 'value',
    message: 'Select your Kubernetes patch version',
    choices: patchVersions.map((v: string) => ({title: v, value: v })),
    validate: (value: string) => value.length > 0 && value.trim().match(/v?\d\.\d\d\.\d+/g) ? true : 'Please enter a valid Kubernetes version (e.g. 1.27.1)'
  });

  return kubernetesPatchVersionSelect.value;
};

async function promptForKubernetesVersionFallback() {
  const kubernetesVersionSelect = await prompts({
    type: 'text',
    name: 'value',
    initial: "1.28.2",
    message: 'Enter your Kubernetes version',
    validate: (value: string) => value.length > 0 && value.trim().match(/v?\d\.\d\d\.\d+/g) ? true : 'Please enter a valid Kubernetes version (e.g. 1.27.1)'
  });

  return kubernetesVersionSelect.value;
}

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
    min: 0,
    max: 3,
    instructions: false,
    hint: '- Space to select. Return to submit.'
  });

  return frameworkSelect.value;
};

export const promptForOverwrite = async () => {
  const overwriteSelect = await prompts({
    type: 'confirm',
    name: 'value',
    message: 'Overwrite existing config file?',
    initial: false
  });

  return overwriteSelect.value;
};


export const success = (path: string) => `
Successfully generated policy configuration file in ${C.bold(path)}. Validate your resources with

 monokle validate . 
 
Learn more about usage and configuration at https://github.com/kubeshop/monokle-cli
`;
