import { Config, readConfig } from "@monokle/validation";
import { authenticatorGetter } from "./authenticator.js";
import { synchronizerGetter } from "./synchronizer.js";
import { resolve } from "path";
import { Framework, getFrameworkConfig } from "../frameworks/index.js";
import { isStdinLike } from "./stdin.js";

export type ConfigData = {
  config: Config | undefined,
  path: string,
  isRemote: boolean,
  isFrameworkBased: boolean,
  framework?: Framework,
  remoteParentProject?: {
    name: string,
    slug: string,
    remoteUrl: string,
  }
};

/**
 * Returns information about config to be used for validation.
 *
 * The priority is as follows:
 * 1. Frameworks if defined (if passed to validation command).
 * 2. If stdin is used, local config is used (because it's not fs context and we cannot determine local/remote config file).
 * 3. If user is authenticated, remote config is fetched and used.
 * 4. In other cases, local config is used.
 *
 * @param path Path to be validated.
 * @param configPath Path to config file.
 * @param framework Framework to be used for validation.
 * @returns Config data.
 */
export async function getConfig(path: string, configPath: string, framework: Framework | undefined): Promise<ConfigData> {
  const frameworkConfig = await getFrameworkConfig(framework);
  if (frameworkConfig) {
    return {
      config: frameworkConfig,
      path: '',
      isRemote: false,
      isFrameworkBased: true,
      framework,
    };
  }

  const isStdin = isStdinLike(path);
  if (isStdin) {
    const localConfig = await readConfig(configPath);
    return {
      config: localConfig,
      path: resolve(configPath),
      isRemote: false,
      isFrameworkBased: false,
    }
  }

  const authenticator = authenticatorGetter.authenticator;
  if (authenticator.user.isAuthenticated) {
    await authenticator.refreshToken();
    return getRemotePolicy(path, authenticator.user.token!);
  }

  const localConfig = await readConfig(configPath);
  return {
    config: localConfig,
    path: resolve(configPath),
    isRemote: false,
    isFrameworkBased: false,
  }
}

export async function getRemotePolicy(path: string, token: string): Promise<ConfigData> {
  const synchronizer = synchronizerGetter.synchronizer;
  const policyData = await synchronizer.synchronize(path, token);
  const parentProject = await synchronizer.getProjectInfo(path, token);

  return {
    config: policyData.policy,
    path: policyData.path,
    isRemote: true,
    isFrameworkBased: false,
    remoteParentProject: {
      name: parentProject?.name ?? 'unknown',
      slug: parentProject?.slug ?? '',
      remoteUrl: synchronizer.generateDeepLinkProjectPolicy(parentProject?.slug ?? ''),
    }
  };
}
