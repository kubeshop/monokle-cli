import { command } from "../utils/command.js";
import { C, print, S } from "../utils/screens.js";
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
    const content = await readFile(path, "utf8");
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
      print(failure(errorCount));

      for (const run of response.runs) {
        if (run.results.length === 0) continue;

        print(`${C.blue(`Tool: ${run.tool.driver.name}`)}`);
        for (const result of run.results) {
          print(`${S.error} [${result.ruleId}] ${result.message.text}`);
        }
      }
    } else {
      print(success());
    }
  },
});

const BAD_RESOURCE: any = {
  fileId: "vanilla-panda-blog/deployment.yaml",
  filePath: "vanilla-panda-blog/deployment.yaml",
  text: "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: panda-blog\nspec:\n  replicas: 1\n  selector:\n    matchLabels:\n      app: panda-blog\n  template:\n    metadata:\n      labels:\n        app: panda-blog\n    spec:\n      containers:\n        - name: panda-blog\n          image: panda-blog:latest\n          ports:\n            - name: http-web\n              containerPort: 8080\n",
  name: "panda-blog",
  id: "31fc266e-be6e-527a-8292-469fe956c0d6",
  apiVersion: "apps/v1",
  kind: "Deployment",
  content: {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: {
      name: "panda-blog",
    },
    spec: {
      replicas: 1,
      selector: {
        matchLabels: {
          app: "panda-blog",
        },
      },
      template: {
        metadata: {
          labels: {
            app: "panda-blog",
          },
        },
        spec: {
          containers: [
            {
              name: "panda-blog",
              image: "panda-blog:latest",
              ports: [
                {
                  name: "http-web",
                  containerPort: 8080,
                },
              ],
            },
          ],
        },
      },
    },
  },
  // refs: [
  //   {
  //     type: 'outgoing',
  //     name: 'panda-blog',
  //     position: {
  //       line: 11,
  //       column: 12,
  //       length: 10
  //     },
  //     target: {
  //       type: 'resource',
  //       resourceId: '31fc266e-be6e-527a-8292-469fe956c0d6',
  //       resourceKind: 'Deployment',
  //       isOptional: false
  //     }
  //   },
  //   {
  //     type: 'incoming',
  //     name: 'panda-blog',
  //     position: {
  //       line: 15,
  //       column: 14,
  //       length: 10
  //     },
  //     target: {
  //       type: 'resource',
  //       resourceId: '31fc266e-be6e-527a-8292-469fe956c0d6',
  //       resourceKind: 'Deployment',
  //       isOptional: false
  //     }
  //   },
  //   {
  //     type: 'outgoing',
  //     name: 'panda-blog',
  //     position: {
  //       line: 19,
  //       column: 18,
  //       length: 17
  //     },
  //     target: {
  //       type: 'image',
  //       tag: 'latest'
  //     }
  //   },
  //   {
  //     type: 'incoming',
  //     name: 'panda-blog',
  //     position: {
  //       line: 15,
  //       column: 14,
  //       length: 10
  //     },
  //     target: {
  //       type: 'resource',
  //       resourceId: '047aedde-e54d-51fc-9ae7-860ea5c581bc',
  //       resourceKind: 'Service',
  //       isOptional: false
  //     }
  //   }
  // ]
};
