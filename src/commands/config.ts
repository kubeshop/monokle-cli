import { createDefaultMonokleValidator } from "@monokle/validation";
import { command } from "../utils/command.js";
import { print } from "../utils/screens.js";
import { Framework } from "../frameworks/index.js";
import { getConfig } from "../utils/config.js";
import { configInfo, configYaml } from "./config.io.js";
import { assertFlags } from "../utils/flags.js";
import { settings } from "../utils/settings.js";
import { isDefined } from "../utils/isDefined.js";
import { isAuthenticated } from "../utils/conditions.js";
import { InvalidArgument } from "../errors.js";

type Options = {
  path: string;
  output: "pretty" | "json" | "yaml";
  config?: string;
  project?: string;
  framework?: Framework;
  'api-token'?: string;
  origin?: string;
};

export const config = command<Options>({
  command: "config [path]",
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
      .option("origin", {
        type: "string",
        description: "Monokle remote instance URL. Defaults to Monokle Cloud's origin.",
        alias: "r",
      })
      .positional("path", {
        type: "string",
        default: "."
      });
  },
  async handler({ path, output, config, project, framework, apiToken, origin }) {
    if (isDefined(apiToken)) {
      assertFlags({
        'api-token': apiToken,
        project
      });
    }

    if (isDefined(origin)) {
      assertFlags({
        'api-token': apiToken,
        project,
        origin: origin
      });

      settings.origin = origin;
    }

    if (isDefined(project) && !(isDefined(apiToken) || (await isAuthenticated()))) {
      throw new InvalidArgument("Using project flag requires being authenticated. Run 'monokle login' first.");
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
