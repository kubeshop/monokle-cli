import {
  createDefaultMonokleValidator,
  processRefs,
  readConfig,
  ResourceParser,
} from "@monokle/validation";
import { readFile } from "fs/promises";
import { command } from "../utils/command.js";
import { extractK8sResources, File } from "../utils/extract.js";
import { print } from "../utils/screens.js";
import { streamToPromise } from "../utils/stdin.js";
import { failure, success } from "./validate.io.js";

type Options = {
  path: string;
  config: string;
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
      .positional("path", { type: "string", demandOption: true });
  },
  async handler({ path, output, config: configPath }) {
    const content = await readContent(path);
    const file: File = {
      id: path === "" ? "stdin" : path,
      content,
      path: path === "" ? "stdin" : path,
    };
    const resources = extractK8sResources([file]);

    const parser = new ResourceParser();

    const validator = createDefaultMonokleValidator();
    const config = await readConfig(configPath);
    await validator.preload({ file: config });

    processRefs(resources, parser);
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

async function readContent(path: string): Promise<string> {
  if (path === "") {
    const buffer = await streamToPromise(process.stdin);
    const content = buffer.toString("utf8");
    return content;
  }
  return readFile(path, "utf8");
}
