import { readFile } from "fs/promises";
import nodePath from "path";
import { fileURLToPath } from "url";
import {
  FileWasmLoader,
  KubernetesSchemaValidator,
  LabelsValidator,
  MonokleValidator,
  OpenPolicyAgentValidator,
  ResourceParser,
  SchemaLoader,
  YamlValidator,
} from "validation";
import { command } from "../utils/command.js";
import { extractK8sResources, File } from "../utils/extract.js";
import { print } from "../utils/screens.js";
import { streamToPromise } from "../utils/stdin.js";
import { failure, success } from "./validate.io.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = nodePath.dirname(__filename);

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
    const validator = createValidator();

    await validator.configure([
      {
        tool: "labels",
        enabled: true,
      },
      {
        tool: "yaml-syntax",
        enabled: true,
      },
      {
        tool: "kubernetes-schema",
        enabled: true,
        schemaVersion: "1.24.2",
      },
      {
        tool: "open-policy-agent",
        enabled: true,
        plugin: {
          id: "trivy",
          enabled: true,
          wasmSrc: nodePath.join(
            __dirname,
            "../../../validation/src/assets/policies/trivy.wasm"
          ),
        },
      },
    ]);

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

function createValidator() {
  const customParser = new ResourceParser();
  const yamlValidator = new YamlValidator(customParser);
  const labelsValidator = new LabelsValidator(customParser);

  const wasmLoader = new FileWasmLoader();
  const opaValidator = new OpenPolicyAgentValidator(customParser, wasmLoader);

  const schemaLoader = new SchemaLoader();
  const schemaValidator = new KubernetesSchemaValidator(
    customParser,
    schemaLoader
  );

  return new MonokleValidator(
    [labelsValidator, yamlValidator, schemaValidator, opaValidator],
    {
      debug: true,
    }
  );
}

async function readContent(path: string): Promise<string> {
  if (path === "") {
    const buffer = await streamToPromise(process.stdin);
    const content = buffer.toString("utf8");
    return content;
  }
  return readFile(path, "utf8");
}
