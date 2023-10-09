import {  createDefaultMonokleValidator,  } from "@monokle/validation";
import { command } from "../utils/command.js";
import { print } from "../utils/screens.js";
import { Framework } from "../frameworks/index.js";
import { getConfig } from "../utils/config.js";
import { configInfo, configYaml, error } from "./config.io.js";
import { assertApiFlags } from "../utils/flags.js";

type Options = {
  action: string;
  path: string;
  output: "pretty" | "json" | "yaml";
  config?: string;
  project?: string;
  framework?: Framework;
  'api-token'?: string;
};

export const config = command<Options>({
  command: "config [action] [path]",
  describe: "Show current config",
  builder(args) {
    return args
      .option("output", {
        choices: ["pretty", "json", "yaml"] as const,
        default: "pretty" as const,
        alias: "o",
      })
      .option("config", {
        type: "string",
        alias: "c",
      })
      .option("project", {
        type: "string",
        description: "Monokle Cloud project slug to use policy from.",
        alias: "p",
      })
      .option("framework", {
        type: "string",
        choices: ["pss-restricted", "pss-baseline", "nsa"] as const,
        alias: "fw",
      })
      .option("api-token", {
        type: "string",
        description: "Monokle Cloud API token to fetch remote policy. It will be used instead of authenticated user credentials.",
        alias: "t",
      })
      .positional("action", { choices: ["show"], demandOption: true })
      .positional("path", { type: "string", demandOption: true });
  },
  async handler({ _action, path, output, config, project, framework, apiToken }) {
    try {
      assertApiFlags(apiToken, project);
    } catch (err: any) {
      print(error(err.message));
      return;
    }

    const configPath = config ?? 'monokle.validation.yaml';
    const isDefaultConfigPath = config === undefined;
    const usedConfig = await getConfig(path, configPath, project, framework, { isDefaultConfigPath, apiToken });

    let configContent = usedConfig?.config ?? {};
    if (!usedConfig?.config) {
      const validator = createDefaultMonokleValidator();
      await validator.preload();
      configContent = validator.config;
    }

    if (output === "pretty") {
      print(configInfo(usedConfig, configContent, path));
    } else if (output === "json") {
      print(JSON.stringify(configContent, null, 2));
    } else if (output === "yaml") {
      print(configYaml(configContent));
    }
  },
});
