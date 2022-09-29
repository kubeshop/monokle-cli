import {
  FileWasmLoader,
  KubernetesSchemaValidator,
  LabelsValidator,
  MonokleValidator,
  OpenPolicyAgentValidator,
  processRefs,
  ResourceLinksValidator,
  ResourceParser,
  SchemaLoader,
  YamlValidator,
} from "@monokle/validation";
import { readFile } from "fs/promises";
import nodePath from "path";
import { fileURLToPath } from "url";
import { command } from "../utils/command.js";
import { extractK8sResources, File } from "../utils/extract.js";
import { print } from "../utils/screens.js";
import { streamToPromise } from "../utils/stdin.js";
import { failure, success } from "./validate.io.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = nodePath.dirname(__filename);

type Options = {
  path: string;
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
      .positional("path", { type: "string", demandOption: true });
  },
  async handler({ path, output }) {
    const content = await readContent(path);
    const file: File = {
      id: path === "" ? "stdin" : path,
      content,
      path: path === "" ? "stdin" : path,
    };
    const resources = extractK8sResources([file]);

    const parser = new ResourceParser();
    const validator = await createValidator(parser);

    processRefs(resources, parser);
    const response = await validator.validate(resources);

    const errorCount = response.runs.reduce(
      (sum, r) => sum + r.results.length,
      0
    );

    if (output === "pretty") {
      if (errorCount) {
        print(failure(errorCount, response));
      } else {
        print(success());
      }
    } else {
      console.log(JSON.stringify(response, null, 2));
    }
  },
});

async function createValidator(parser: ResourceParser) {
  const yamlValidator = new YamlValidator(parser);
  const labelsValidator = new LabelsValidator(parser);

  const wasmLoader = new FileWasmLoader();
  const opaValidator = new OpenPolicyAgentValidator(parser, wasmLoader);

  const schemaLoader = new SchemaLoader();
  const schemaValidator = new KubernetesSchemaValidator(parser, schemaLoader);

  const resourceLinksValidator = new ResourceLinksValidator();

  const validator = new MonokleValidator(
    [
      labelsValidator,
      yamlValidator,
      schemaValidator,
      opaValidator,
      resourceLinksValidator,
    ],
    {
      debug: true,
    }
  );

  await validator.configure([
    {
      tool: "labels",
      enabled: true,
    },
    {
      tool: "resource-links",
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

  return validator;
}

async function readContent(path: string): Promise<string> {
  if (path === "") {
    const buffer = await streamToPromise(process.stdin);
    const content = buffer.toString("utf8");
    return content;
  }
  return readFile(path, "utf8");
}
