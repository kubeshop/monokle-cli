import { command } from "../utils/command.js";
import { print } from "../utils/screens.js";
import { streamToPromise } from "../utils/stdin.js";
import { LabelsValidator, MonokleValidator } from "validation";
import { failure, success } from "./validate.io.js";
import { readFile } from "fs/promises";
import { extractK8sResources, File } from "../utils/extract.js";

type Options = {
  path: string;
};

export const validate = command<Options>({
  command: "validate [path]",
  describe: "Validate your Kubernetes resources",
  builder(args) {
    return args.positional("path", { type: "string", demandOption: true });
  },
  async handler({ path }) {
    const content = await readContent(path);
    const file: File = { content, id: path, path };
    const resources = extractK8sResources([file]);

    const validator = new MonokleValidator([LabelsValidator]);

    await validator.configure({
      tool: "labels",
      enabled: true,
    });

    const response = await validator.validate(resources);
    const errorCount = response.runs.reduce(
      (sum, r) => sum + r.results.length,
      0
    );

    if (errorCount) {
      print(failure(errorCount, response));
    } else {
      print(success());
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
