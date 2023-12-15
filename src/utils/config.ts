import { Config, readConfig } from "@monokle/validation";
import { TokenInfo } from '@monokle/synchronizer';
import { authenticatorGetter } from "./authenticator.js";
import { synchronizerGetter } from "./synchronizer.js";
import { settings } from "../utils/settings.js";
import { resolve } from "path";
import { Framework, getFrameworkConfig } from "../frameworks/index.js";
import { isStdinLike } from "./stdin.js";
import { displayWarning } from "../errors.js";

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
 * Config precedence is as follows:
 * - No flags passed, use `Implicit Remote > Implicit Local > Default`-and-never-fail;
 * - `--config ./monokle-custom.yaml` for `Explicit Local`-or-fail;
 * - `--project ProjectIdentifier` for `Explicit remote`-or-fail;
 * - Passing both `--config` and `--project`, it should try to read both `Explicit Remote > Explicit Local`-or-fail`.
 * - `--framework` use framework based config and ignore other flags;
 * - `--api-token` behaves as user being authenticated, doesn't change config precedence.
 *
 * @see https://github.com/kubeshop/monokle-cli/issues/16
 *
 * @param path Path to be validated.
 * @param configPath Path to config file.
 * @param projectSlug Monokle Cloud project slug to fetch config from.
 * @param framework Framework to be used for validation.
 * @param options Additional options.
 * @returns Config data.
 */
export async function getConfig(
  path: string,
  configPath: string,
  projectSlug: string | undefined = undefined,
  framework: Framework | undefined = undefined,
  options: { isDefaultConfigPath?: boolean, apiToken?: string | undefined } = {
    isDefaultConfigPath: true,
    apiToken: undefined,
  }
) {
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

  const useRemoteExplicit = !!projectSlug;
  const useLocalExplicit = !!configPath && !options.isDefaultConfigPath;

  let activeToken: undefined | TokenInfo = options.apiToken ? {accessToken: options.apiToken, tokenType: 'ApiKey'} : undefined;
  if (!activeToken) {
    try {
      const authenticator = await authenticatorGetter.getInstance();
      if (authenticator.user.isAuthenticated) {
        await authenticator.refreshToken();
      }
      activeToken = authenticator.user.tokenInfo ?? undefined;
    } catch (err: any) {
      if (settings.debug) {
        displayWarning(`Could not authenticate with given origin: ${settings.origin} to fetch remote policy. Error: ${err.message}.`);
      }
    }
  }

  if (useRemoteExplicit && useLocalExplicit) { // Remote or local or fail
    const results = await Promise.allSettled([
      getRemotePolicyForProject(projectSlug, activeToken!),
      getLocalPolicy(configPath)
    ]);

    if (results[0].status === 'fulfilled') {
      return results[0].value;
    }

    if (results[1].status === 'fulfilled') {
      return results[1].value;
    }

    throw new Error(`Error when reading policy: ${results[0].reason}; ${results[1].reason}.`);
  }

  if (useRemoteExplicit) { // Remote or fail
    return getRemotePolicyForProject(projectSlug, activeToken!);
  }

  if (useLocalExplicit) { // Local or fail
    return getLocalPolicy(configPath);
  }

  return getPolicyImplicit(path, configPath, activeToken);
}

export async function getRemotePolicyForProject(slug: string, token: TokenInfo): Promise<ConfigData> {
  const synchronizer = await synchronizerGetter.getInstance();
  const policyData = await synchronizer.synchronize({ slug }, token);
  const parentProject = await synchronizer.getProjectInfo({ slug }, token);

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

export async function getRemotePolicyForPath(path: string, token: TokenInfo): Promise<ConfigData> {
  const synchronizer = await synchronizerGetter.getInstance();
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

export async function getLocalPolicy(configPath: string): Promise<ConfigData> {
  const localConfig = await readConfig(configPath);

  if (!localConfig) {
    throw new Error(`Config file ${configPath} not found!`);
  }

  return {
    config: localConfig,
    path: resolve(configPath),
    isRemote: false,
    isFrameworkBased: false,
  }
}

export async function getPolicyImplicit(path: string, configPath: string, token?: TokenInfo): Promise<ConfigData> {
  const isStdin = isStdinLike(path);

  if (token?.accessToken?.length && !isStdin) {
    try {
      const remoteConfig = await getRemotePolicyForPath(path, token);
      return remoteConfig;
    } catch (err) {
      // Ignore error since we fallback to local config.
    }
  }

  const localConfig = await readConfig(configPath);
  return {
    config: localConfig,
    path: resolve(configPath),
    isRemote: false,
    isFrameworkBased: false,
  }
}
