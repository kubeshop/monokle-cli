import {  createDefaultMonokleValidator, isSuppressed, processRefs, ResourceParser, ValidationResult } from "@monokle/validation";
import { extractK8sResources, BaseFile } from "@monokle/parser";
import { lstatSync } from "fs";
import { readFile as readFileFromFs } from "fs/promises";
import chunkArray from "lodash/chunk.js";
import glob from "tiny-glob";
import { command } from "../utils/command.js";
import { print } from "../utils/screens.js";
import { isStdinLike, streamToPromise } from "../utils/stdin.js";
import { displayInventory, failure, success, configInfo } from "./validate.io.js";
import { getConfig } from "../utils/config.js";
import { Framework } from "../frameworks/index.js";
import { getSuppressions } from "../utils/suppressions.js";
import { getValidationResponseBreakdown } from "../utils/getValidationResponseBreakdown.js";
import { getFingerprintSuppressions } from "../utils/getFingerprintSuppression.js";
import { ApiSuppression } from "@monokle/synchronizer";
import { assertApiFlags } from "../utils/flags.js";
import { NotFound, ValidationFailed} from "../errors.js";
import { setOrigin } from "../utils/origin.js";
import { GitResourceMapper } from "../utils/gitResourcesMapper.js";

type Options = {
  input: string;
  config?: string;
  project?: string;
  inventory: boolean;
  output: "pretty" | "sarif";
  framework?: Framework;
  'api-token'?: string;
  'max-warnings': number;
  force: boolean;
  'show-suppressed'?: boolean;
  origin?: string;
};

export const validate = command<Options>({
  command: "validate [input] [options]",
  describe: "Validate your Kubernetes resources",
  builder(args) {
    return args
      .option("output", {
        choices: ["pretty", "sarif"] as const,
        description: "Output format.",
        default: "pretty" as const,
        alias: "o",
      })
      .option("config", {
        type: "string",
        description: "Path to configuration file.",
        alias: "c",
      })
      .option("project", {
        type: "string",
        description: "Monokle Cloud project slug to use policy from.",
        alias: "p",
      })
      .option("inventory", {
        type: "boolean",
        description: "Prints all inventory.",
        default: false,
      })
      .option("framework", {
        type: "string",
        choices: ["pss-restricted", "pss-baseline", "nsa"] as const,
        description: "Validation framework to use.",
        alias: "f",
      })
      .option("api-token", {
        type: "string",
        description: "Monokle Cloud API token to fetch remote policy. It will be used instead of authenticated user credentials.",
        alias: "t",
      })
      .option("max-warnings", {
        type: "number",
        description: "return status code 1 when the amount of warnings is higher than the maximum.",
        default: -1,
      })
      .option("force", {
        type: "boolean",
        description: "return status code 0 even if there are warnings or errors.",
        default: false,
      })
      .option("show-suppressed", {
        type: "boolean",
        description: "Show suppressed misconfigurations.",
        alias: "s",
        default: false
      })
      .option("origin", {
        type: "string",
        description: "Monokle remote instance URL. Defaults to Monokle Cloud SaaS.",
        alias: "r",
      })
      .positional("input", { type: "string", description: "file/folder path or resource YAMLs via stdin", demandOption: true })
      .demandOption("input", "Path or stdin required for target resources");
  },
  async handler({ input, output, project, config, inventory, framework, apiToken, maxWarnings, force, showSuppressed, origin }) {
    setOrigin(origin);

    const files = await readFiles(input);
    const resources = extractK8sResources(files);

    if( resources.length === 0 ){
      throw new NotFound("YAML objects", undefined, "warning");
    }

    assertApiFlags(apiToken, project);

    if (inventory) {
      print(displayInventory(resources));
    }

    const configPath = config ?? 'monokle.validation.yaml';
    const isDefaultConfigPath = config === undefined;

    const parser = new ResourceParser();
    const validator = createDefaultMonokleValidator();
    const [configData, suppressionsData] = await Promise.all([
      getConfig(input, configPath, project, framework, {isDefaultConfigPath, apiToken}),
      getSuppressions(input, project, apiToken).catch(() => {
        // continue with no suppressions
        return { suppressions: []} as { suppressions: ApiSuppression[]}
      })
    ])
    const suppressions = getFingerprintSuppressions(suppressionsData.suppressions)
    await validator.preload(configData?.config, suppressions);

    const gitResourceMapper = new GitResourceMapper(resources);
    const mappedResources = await gitResourceMapper.mapResourcePathsToRepoRootRelative();

    processRefs(
      mappedResources,
      parser,
      undefined,
      files.map((f) => f.path)
    );
    const response = await validator.validate({ resources: mappedResources });
    const mappedResponse = gitResourceMapper.restoreInitialResourcePaths(response);

    if (output === "sarif") {
      print(JSON.stringify(mappedResponse, null, 2));
      return; // It should only show the JSON so that it can be piped to a file or another command.
    }

    const breakdown = getValidationResponseBreakdown(mappedResponse)

    print(configInfo(configData, mappedResources.length ));

    if (breakdown.problems || breakdown.suppressions) {
      print(failure(mappedResponse, breakdown, showSuppressed));
    } else {
      print(success());
    }

    if (!force && breakdown.errors > 0)  {
      throw new ValidationFailed();
    }
    if (!force && maxWarnings !== -1 && breakdown.problems > maxWarnings) {
      throw new ValidationFailed();
    }
  },
});

async function readFiles(path: string): Promise<BaseFile[]> {
  if (isStdinLike(path)) {
    const stdin = await readStdin();
    return [stdin];
  } else if (isFileLike(path)) {
    const file = await readFile(path);
    return [file];
  } else if (isDirectoryLike(path)) {
    return readDirectory(path);
  } else {
    throw new NotFound("File or directory", path);
  }
}

function isFileLike(path: string) {
  try {
    return lstatSync(path).isFile();
  } catch {
    return false
  }
}

function isDirectoryLike(path: string) {
  try {
    return lstatSync(path).isDirectory();
  } catch {
    return false
  }}

async function readFile(path: string): Promise<BaseFile> {
  const content = await readFileFromFs(path, "utf8");

  return {
    id: path,
    path,
    content,
  };
}

async function readStdin(): Promise<BaseFile> {
  const buffer = await streamToPromise(process.stdin);
  const content = buffer.toString("utf8");

  return {
    id: "stdin",
    path: "stdin.yaml",
    content,
  };
}

async function readDirectory(directoryPath: string): Promise<BaseFile[]> {
  const filePaths = await glob(`${directoryPath}/**/*.{yaml,yml}`);
  const files: BaseFile[] = [];

  for (const chunk of chunkArray(filePaths, 5)) {
    const promise = await Promise.allSettled(
      chunk.map((path) => {
        return readFileFromFs(path, "utf8").then((content): BaseFile => ({ id: path, path, content }));
      })
    );

    for (const result of promise) {
      if (result.status === "rejected") {
        continue;
      }
      files.push(result.value);
    }
  }

  return files;
}
