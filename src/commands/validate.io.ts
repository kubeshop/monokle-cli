import {
  getRuleForResultV2,
  isSuppressed,
  Resource,
  ValidationResponse,
} from "@monokle/validation";
import groupBy from "lodash/groupBy.js";
import { B, C, S, Screen } from "../utils/screens.js";
import { ConfigData } from "../utils/config.js";
import * as fs from 'fs';
import { ValidationResponseBreakdown } from "../utils/getValidationResponseBreakdown.js";

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

export const failure = (response: ValidationResponse, breakdown: ValidationResponseBreakdown, showSuppressed?: boolean) => {
  const screen = new Screen();

  const allResultsData = response.runs.flatMap((r, i) => r.results.map(result => ({result, run: i})));
  const groupedResults = groupBy(allResultsData, (r) => {
    const location = r.result.locations[1]?.logicalLocations?.[0]?.fullyQualifiedName;
    return location ?? "unknown";
  });

  let showBox = false

  for (const [location, resultsData] of Object.entries(groupedResults)) {
    const lines: string[] = []

    for (const item of resultsData) {
      const isProblemSuppressed = isSuppressed(item.result)
      if(!showSuppressed && isProblemSuppressed) {
        continue
      }

      const color = item.result.level === "error" ? C.red : C.yellow;
      const icon = item.result.level === "error" ? S.error : S.warning;
      const rule = getRuleForResultV2(response.runs[item.run], item.result);
      let message = item.result.message.text;
      let namespace = color(`[${icon} ${rule.name}]`) 
      
      let line = `${namespace} ${message}`
      if(isProblemSuppressed) {
        line = C.strikethrough(`${namespace} ${message}`)
        line += ` (Suppressed)`
        line = C.dim(line)
      } 
    
      lines.push(line);
    }

    if(lines.length) {
      showBox = showBox || true
      screen.line(C.bold(location));
      for(const line of lines) {
        screen.line(line)
      }
      screen.line();
    }

  }

  const { problems, errors, suppressions } = breakdown
  const icon = errors > 0 ? S.error : S.warning;
  
  let text = ` ${problems ? icon : S.success} ${problems || 'No'} misconfiguration${problems === 1 ? '' : 's'} found.`
  if(problems) {
    text += ` (${errors} errors)`
  }
  if(suppressions && !showSuppressed) {
    text += C.dim(`\n   ${suppressions} problem${suppressions === 1 ? ' is' : 's are'} suppressed. Use ${C.cyan.bold('--show-suppressed')} to include them.`)
  } 

  screen.line(
    showBox ?
    B(
      text,
      {
        padding: 1,
        dimBorder: true,
      }
    )
    : text
  );

  return screen.toString();
};

export const configInfo = (configData: ConfigData, resourceCount : number) => {
  let configInfo = '';
  if (!configData?.config) {
    configInfo = 'default policy';
  } else if (configData.isFrameworkBased) {
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
