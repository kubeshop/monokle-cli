import { Config } from "@monokle/validation";
import { C, Screen } from "../utils/screens.js";
import { ConfigData } from "../utils/config.js";
import { Document } from "yaml";

const isConfigData = (configData: any) => {
  return configData && typeof configData === 'object' && configData.config;
}

export const configInfo = (configInput: ConfigData | Config, targetPath: string) => {
  let configInfo = '';
  let configContent: Config = {};

  if (!isConfigData(configInput)) {
    configInfo = 'default policy';
    configContent = configInput as Config;
  } else {
    const configData = configInput as ConfigData;

    configContent = configData.config ?? {};

    if (configData.isFrameworkBased) {
      configInfo = `${C.bold(configData.framework)} framework based policy`;
    } else if (configData.isRemote) {
      configInfo = `remote policy from ${C.bold(configData.remoteParentProject?.name ?? 'unknown')} project`;
    } else {
      configInfo = `local policy from ${C.bold(configData.path)} file`;
    }
  }

  const configYaml = new Document();
  (configYaml.contents as any) = configContent || {};

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
