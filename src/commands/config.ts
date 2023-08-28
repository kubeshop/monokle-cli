import { command } from "../utils/command.js";
import { print } from "../utils/screens.js";
import { Framework } from "../frameworks/index.js";
import { getConfig } from "../utils/config.js";

type Options = {
  action: string;
  path: string;
  config: string;
  framework?: Framework;
};

export const config = command<Options>({
  command: "config [action] [path]",
  describe: "Show current config",
  builder(args) {
    return args
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
      .positional("action", { choices: ["show"], demandOption: true, allowed: ["show"] })
      .positional("path", { type: "string", demandOption: true });
  },
  async handler({ action, path, config, framework }) {
    const usedConfig = await getConfig(path, config, framework);

    print(JSON.stringify(usedConfig, null, 2));
  },
});
