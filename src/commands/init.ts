import { writeFile } from "fs/promises";
import { Document } from "yaml";
import { Config, PluginMap, RuleMap } from "@monokle/validation";
import { command } from "../utils/command.js";
import { print } from "../utils/screens.js";
import { isDefined } from "../utils/isDefined.js";
import { promptForFrameworks, promptForKubernetesVersion, success, error } from './init.io.js';
import { Framework, getFrameworkConfig } from "../frameworks/index.js";
import { resolve } from "path";

type Options = {};

export const init = command<Options>({
  command: "init",
  describe: "Generate a Monokle policy config file for your project.",
  async handler() {
    try {
      const kubernetesVersion = await promptForKubernetesVersion();

      if (!isDefined(kubernetesVersion)) {
        return;
      }

      const frameworks = await promptForFrameworks();

      if (!isDefined(frameworks)) {
        return;
      }

      const configs: Config[] = await Promise.all(frameworks.map(async (framework: Framework) => {
        return getFrameworkConfig(framework);
      }));

      const fullConfig: Config = {
        plugins: configs.reduce<PluginMap>((acc, config) => {
          return {
            ...acc,
            ...config.plugins
          }
        }, {}),
        rules: mergeRules(configs.map(config => config.rules).filter(isDefined)),
        settings: {
          "kubernetes-schema": {
            schemaVersion: kubernetesVersion,
          },
        },
      };

      const configYaml = new Document();
      (configYaml.contents as any) = fullConfig;
      await writeFile(resolve('monokle.validation.yaml'), configYaml.toString())

      print(success(resolve('monokle.validation.yaml')));

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
