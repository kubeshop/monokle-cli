import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { resolve } from "path";
import { Document, parseDocument } from "yaml";
import { Config, PluginMap, RuleMap } from "@monokle/validation";
import { command } from "../utils/command.js";
import { print } from "../utils/screens.js";
import { isDefined } from "../utils/isDefined.js";
import { promptForFrameworks, promptForKubernetesVersion, promptForOverwrite, success, error } from './init.io.js';
import { Framework, getFrameworkConfig } from "../frameworks/index.js";
import defaultConfig from "../utils/defaultConfig.js";

type Options = {
  version?: string;
  framework?: Framework;
  overwrite?: boolean;
};

export const init = command<Options>({
  command: "init",
  describe: "Generate a Monokle policy config file for your project.",
  builder(args) {
    return args
      .option("schema-version", {
        type: "string",
        description: "Kubernetes version to use.",
        alias: "v",
      })
      .option("framework", {
        type: "string",
        choices: ["pss-restricted", "pss-baseline", "nsa"] as const,
        description: "Validation framework to use.",
        alias: "f",
      })
      .option("overwrite", {
        type: "boolean",
        description: "Overwrite existing config file.",
        default: false,
        alias: "o",
      });
  },
  async handler({ schemaVersion, framework, overwrite }) {
    const interactive = !isDefined(schemaVersion) && !isDefined(framework) && isDefined(overwrite);
    const configPath = resolve(process.cwd(), 'monokle.validation.yaml');
    const hasConfig = existsSync(configPath);

    if (hasConfig && !interactive && !overwrite) {
      throw `Config file already exists in ${configPath}. Use --overwrite flag to overwrite it.`
    }

    try {
      let kubernetesVersion = schemaVersion;
      let frameworks = framework ? [framework] : [];

      if (interactive) {
        kubernetesVersion = await promptForKubernetesVersion();

        if (!isDefined(kubernetesVersion)) {
          return;
        }

        frameworks = await promptForFrameworks();

        if (!isDefined(frameworks)) {
          return;
        }

        if (hasConfig) {
          const canOverwrite = await promptForOverwrite();

          if (!canOverwrite) {
            return;
          }
        }
      }

      const config: Config = {};
      if (frameworks.length > 0) {
        const configs: Config[] = (await Promise.all(frameworks.map(async (framework: Framework) => {
          return getFrameworkConfig(framework);
        }))).filter(isDefined);

        const fullConfig: Config = {
          plugins: configs.reduce<PluginMap>((acc, config) => {
            return {
              ...acc,
              ...config.plugins
            }
          }, {}),
          rules: mergeRules(configs.map(config => config.rules).filter(isDefined)),
        };

        config.plugins = fullConfig.plugins;
        config.rules = fullConfig.rules;
      } else {
        const defaultConfigJson = defaultConfig as Config;
        config.plugins = defaultConfigJson.plugins;
        config.rules = defaultConfigJson.rules;
        config.settings = defaultConfigJson.settings;
      }

      if (isDefined(kubernetesVersion)) {
        config.settings = {
          "kubernetes-schema": {
            schemaVersion: `v${kubernetesVersion}`.replace(/v+/g, 'v'),
          },
        };
      }

      const configYaml = new Document();
      (configYaml.contents as any) = config;
      await writeFile(configPath, configYaml.toString())

      print(success(configPath));
    } catch (err: any) {
      print(error(err.message));
    }
  },
});

function mergeRules(rules: RuleMap[]): RuleMap {
  if (rules.length === 1) {
    return rules[0];
  }

  const mergeRules = { ...rules[0] };
  for (let i = 1; i < rules.length; i++) {
    for (const [key, value] of Object.entries(rules[i])) {
      // Overwrite rule only if it's not there or it's not an error level (to not overwrite errors with warnings).
      if (!mergeRules[key] || mergeRules[key] !== "err") {
        mergeRules[key] = value;
      }
    }
  }

  return mergeRules
}
