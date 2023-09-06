import {
  getRuleForResultV2,
  Resource,
  ValidationResponse,
} from "@monokle/validation";
import groupBy from "lodash/groupBy.js";
import { B, C, S, Screen } from "../utils/screens.js";
import { ConfigData } from "../utils/config.js";
import * as fs from 'fs';

export const success = () => `${S.success} All resources are valid.`;

export const displayInventory = (allResources: Resource[]) => {
  const box = new Screen();

  const groupedResources = groupBy(
    allResources,
    (r) => `${r.kind}.${r.apiVersion}`
  );

  for (const [kind, resources] of Object.entries(groupedResources)) {
    box.line("                                 "); // Box width spacer
    box.line(`${C.bold(kind)} (${resources.length})`);

    for (const resource of resources) {
      box.line(` - ${resource.name}`);
    }
  }

  const screen = new Screen();
  screen.line();
  screen.line(
    B(box.toString(), {
      title: "Inventory",
      padding: { left: 1, right: 1, bottom: 0, top: 0 },
    })
  );
  screen.line();
  return screen.toString();
};

export const failure = (response: ValidationResponse) => {
  const screen = new Screen();

  const allResultsData = response.runs.flatMap((r, i) => r.results.map(result => ({result, run: i})));
  const groupedResults = groupBy(allResultsData, (r) => {
    const location = r.result.locations[1]?.logicalLocations?.[0]?.fullyQualifiedName;
    return location ?? "unknown";
  });

  for (const [location, resultsData] of Object.entries(groupedResults)) {
    screen.line(C.bold(location));

    for (const item of resultsData) {
      const color = item.result.level === "error" ? C.red : C.yellow;
      const icon = item.result.level === "error" ? S.error : S.warning;
      const rule = getRuleForResultV2(response.runs[item.run], item.result);
      const message = item.result.message.text;
      screen.line(`${color(`[${icon} ${rule.name}]`)} ${message}`);
    }

    screen.line();
  }

  const warningCount = response.runs.reduce(
    (sum, run) =>
      sum + run.results.reduce((s, r) => s + (r.level === "error" ? 0 : 1), 0),
    0
  );
  const errorCount = response.runs.reduce(
    (sum, run) =>
      sum + run.results.reduce((s, r) => s + (r.level === "error" ? 1 : 0), 0),
    0
  );
  const validationCount = warningCount + errorCount;
  const icon = errorCount > 0 ? S.error : S.warning;

  screen.line(
    B(
      ` ${icon} ${validationCount} misconfigurations found. (${errorCount} errors)`,
      {
        padding: 1,
        dimBorder: true,
      }
    )
  );

  return screen.toString();
};

export const configInfo = (configData: ConfigData, resourceCount : number) => {
  let configInfo = '';
  if (configData.isFrameworkBased) {
    configInfo = `${C.bold(configData.framework)} framework based policy`;
  } else if (configData.isRemote) {
    configInfo = `remote policy from ${C.bold(configData.remoteParentProject?.name ?? 'unknown')} project. It can be adjusted on ${configData.remoteParentProject?.remoteUrl}`;
  } else if( fs.existsSync( configData.path )){
    configInfo = `local policy from ${C.bold(configData.path)} file`;
  }
  else {
    configInfo = `default Monokle validation policy`;
  }

  const screen = new Screen();

  screen.line(
    B(
      ` ${S.info} Validated ${resourceCount} resources using ${configInfo}.`,
      {
        padding: 1,
        dimBorder: true,
      }
    )
  );

  return screen.toString();
};
