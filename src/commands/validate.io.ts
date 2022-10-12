import { ValidationResponse } from "@monokle/validation";
import { B, C, S, Screen } from "../utils/screens.js";

export const success = () => `
${S.success} All resources are valid.
`;

export const failure = (response: ValidationResponse) => {
  const screen = new Screen();

  for (const run of response.runs) {
    if (run.results.length === 0) continue;

    screen.line(C.blue(`Tool: ${run.tool.driver.name}`));

    for (const result of run.results) {
      const icon = result.level === "error" ? S.error : S.warning;
      const id = result.ruleId;
      const message = result.message.text;
      screen.line(`${icon} [${id}] ${message}`);
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
    B(` ${icon} ${validationCount} problems found. (${errorCount} errors)`, {
      padding: 1,
      dimBorder: true,
    })
  );

  return screen.toString();
};
