import {
  createExtensibleNodeMonokleValidator,
  processRefs,
  readConfig,
  ResourceParser,
} from "@monokle/validation";
import { lstatSync } from "fs";
import { readFile as readFileFromFs } from "fs/promises";
import chunkArray from "lodash/chunk.js";
import glob from "tiny-glob";
import { command } from "../utils/command.js";
import { extractK8sResources, File } from "../utils/extract.js";
import { print } from "../utils/screens.js";
import { streamToPromise } from "../utils/stdin.js";
import { displayInventory, failure, success } from "./validate.io.js";

type Options = {
  path: string;
  config: string;
  inventory: boolean;
  output: "pretty" | "sarif";
};

export const validate = command<Options>({
  command: "validate [path]",
  describe: "Validate your Kubernetes resources",
  builder(args) {
    return args
      .option("output", {
        choices: ["pretty", "sarif"] as const,
        default: "pretty" as const,
        alias: "o",
      })
      .option("config", {
        type: "string",
        default: "monokle.validation.yaml",
        alias: "c",
      })
      .option("inventory", {
        type: "boolean",
        description: "Prints all inventory.",
        default: false,
      })
      .positional("path", { type: "string", demandOption: true });
  },
  async handler({ path, output, inventory, config: configPath }) {
    const files = await readFiles(path);
    const resources = extractK8sResources(files);

    if (inventory) {
      print(displayInventory(resources));
    }

    const parser = new ResourceParser();
    const validator = createExtensibleNodeMonokleValidator(parser);
    const config = await readConfig(configPath);
    await validator.preload(config);

    processRefs(
      resources,
      parser,
      undefined,
      files.map((f) => f.path)
    );
    const response = await validator.validate({ resources });

    const errorCount = response.runs.reduce(
      (sum, r) => sum + r.results.length,
      0
    );

    if (output === "pretty") {
      if (errorCount) {
        print(failure(response));
      } else {
        print(success());
      }
    } else {
      console.log(JSON.stringify(response, null, 2));
    }
  },
});

async function readFiles(path: string): Promise<File[]> {
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

async function readFile(path: string): Promise<File> {
  const content = await readFileFromFs(path, "utf8");

  return {
    id: path,
    path,
    content,
  };
}

function isStdinLike(path: string) {
  return path === "";
}

async function readStdin(): Promise<File> {
  const buffer = await streamToPromise(process.stdin);
  const content = buffer.toString("utf8");

  return {
    id: "stdin",
    path: "stdin",
    content,
  };
}

async function readDirectory(directoryPath: string): Promise<File[]> {
  const filePaths = await glob(`${directoryPath}/**/*.{yaml,yml}`);
  const files: File[] = [];

  for (const chunk of chunkArray(filePaths, 5)) {
    const promise = await Promise.allSettled(
      chunk.map((path) => {
        return readFileFromFs(path, "utf8").then(
          (content): File => ({ id: path, path, content })
        );
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
