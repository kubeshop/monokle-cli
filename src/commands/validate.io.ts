import { ValidationResponse } from "@monokle/validation";
import { B, C, S, Screen } from "../utils/screens.js";

export const success = () => `
${S.success} All resources are valid.
`;

export const failure = (
  validationCount: number,
  response: ValidationResponse
) => {
  const screen = new Screen()
    .line()
    .line(
      B(` ${S.warning} ${validationCount} problems found.`, {
        padding: 1,
        dimBorder: true,
      })
    )
    .line();

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

  return screen.toString();
};
