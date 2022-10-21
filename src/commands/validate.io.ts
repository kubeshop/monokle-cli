import { getRuleForResult, ValidationResponse } from "@monokle/validation";
import groupBy from "lodash/groupBy.js";
import { B, C, S, Screen } from "../utils/screens.js";

export const success = () => `
${S.success} All resources are valid.
`;

export const failure = (response: ValidationResponse) => {
  const screen = new Screen();

  const allResults = response.runs.flatMap((r) => r.results);
  const groupedResults = groupBy(allResults, (r) => {
    const location = r.locations[1]?.logicalLocations?.[0]?.fullyQualifiedName;
    return location ?? "unknown";
  });

  for (const [location, results] of Object.entries(groupedResults)) {
    screen.line(C.bold(location));

    for (const result of results) {
      const color = result.level === "error" ? C.red : C.yellow;
      const icon = result.level === "error" ? S.error : S.warning;
      const rule = getRuleForResult(response, result);
      const message = result.message.text;
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
