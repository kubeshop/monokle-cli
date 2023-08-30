import { command } from "../utils/command.js";
import { print } from "../utils/screens.js";
import { Framework } from "../frameworks/index.js";
import { getConfig } from "../utils/config.js";
import { configInfo, configYaml } from "./config.io.js";

type Options = {
  action: string;
  path: string;
  output: "pretty" | "json" | "yaml";
  config: string;
  framework?: Framework;
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
        default: "monokle.validation.yaml",
        alias: "c",
      })
      .option("framework", {
        type: "string",
        choices: ["pss-restricted", "pss-baseline", "nsa"] as const,
        alias: "fw",
      })
      .positional("action", { choices: ["show"], demandOption: true })
      .positional("path", { type: "string", demandOption: true });
  },
  async handler({ action, path, output, config, framework }) {
    const usedConfig = await getConfig(path, config, framework);

    if (output === "pretty") {
      print(configInfo(usedConfig, path));
    } else if (output === "json") {
      print(JSON.stringify(usedConfig.config, null, 2));
    } else if (output === "yaml") {
      print(configYaml(usedConfig));
    }
  },
});
