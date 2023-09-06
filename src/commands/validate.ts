import { createExtensibleMonokleValidator, processRefs, ResourceParser } from "@monokle/validation";
import { extractK8sResources, BaseFile } from "@monokle/parser";
import { lstatSync } from "fs";
import { readFile as readFileFromFs } from "fs/promises";
import chunkArray from "lodash/chunk.js";
import glob from "tiny-glob";
import { command } from "../utils/command.js";
import { print } from "../utils/screens.js";
import { isStdinLike, streamToPromise } from "../utils/stdin.js";
import { displayInventory, failure, success, configInfo } from "./validate.io.js";
import { getConfig, getRemotePolicy } from "../utils/config.js";
import { Framework } from "../frameworks/index.js";

type Options = {
  input: string;
  config: string;
  inventory: boolean;
  output: "pretty" | "sarif";
  framework?: Framework;
  'api-token'?: string;
  failOnWarnings: boolean;
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
        default: "monokle.validation.yaml",
        description: "Path to configuration file.",
        alias: "c",
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
      .option("failOnWarnings", {
        type: "boolean",
        description: "Fails the validation if there are warnings.",
        default: false
      })
      .positional("input", { type: "string", description: "file/folder path or resource YAMLs via stdin", demandOption: true })
      .demandOption("input", "Path or stdin required for target resources");
  },
  async handler({ input, output, inventory, config: configPath, framework, apiToken, failOnWarnings }) {
    const files = await readFiles(input);
    const resources = extractK8sResources(files);
    if( resources.length === 0 ){
      print( "No YAML resources found");
      return;
    }

    if (inventory) {
      print(displayInventory(resources));
    }

    const parser = new ResourceParser();
    const validator = createExtensibleMonokleValidator(parser);

    // If --api-token set explicitly we try to use remote policy only.
    const configData = apiToken ? await getRemotePolicy(input, apiToken) :  await getConfig(input, configPath, framework);

    await validator.preload(configData.config);

    processRefs(
      resources,
      parser,
      undefined,
      files.map((f) => f.path)
    );
    const response = await validator.validate({ resources });
    const problemCount = response.runs.reduce((sum, r) => sum + r.results.length, 0);
    const errorCount = response.runs.reduce((sum, r) => sum + r.results.filter(r => r.level === "error").length, 0);

    if (output === "pretty") {
      print(configInfo(configData, resources.length ));

      if (problemCount) {
        print(failure(response));
      } else {
        print(success());
      }
    } else {
      print( "Validated " + resources.length + " resource" + (resources.length > 1 ? "s" : "" ));
      print(JSON.stringify(response, null, 2));
    }

    if( failOnWarnings && problemCount > 0 ){
      throw "Validation failed with " + problemCount + " problems";
    }
    else if( errorCount > 0 ){
      throw "Validation failed with " + errorCount + " errors";
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
  } else {
    return readDirectory(path);
  }
}

function isFileLike(path: string) {
  return lstatSync(path).isFile();
}

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
    path: "stdin",
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
