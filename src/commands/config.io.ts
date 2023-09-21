import { Config } from "@monokle/validation";
import { C, Screen } from "../utils/screens.js";
import { ConfigData } from "../utils/config.js";
import { Document } from "yaml";

export const error = (err: string) => `
Error running config command: ${C.red(err)}.
`;

export const configInfo = (configData: ConfigData, configContent: Config, targetPath: string) => {
  let configInfo = '';

  if (!configData?.config) {
    configInfo = 'default policy';
  } else {
    if (configData.isFrameworkBased) {
      configInfo = `${C.bold(configData.framework)} framework based policy`;
    } else if (configData.isRemote) {
      configInfo = `remote policy from ${C.bold(configData.remoteParentProject?.name ?? 'unknown')} project`;
    } else {
      configInfo = `local policy from ${C.bold(configData.path)} file`;
    }
  }

  const configYaml = new Document();
  (configYaml.contents as any) = configContent;

  const screen = new Screen();

  screen.line(`For ${targetPath} path, ${configInfo} will be used:`);
  screen.line();
  screen.line(configYaml);

  return screen.toString();
};

export const configYaml = (configData: Config) => {
  const configYaml = new Document();
  (configYaml.contents as any) = configData ?? {};
  return configYaml.toString();
}
