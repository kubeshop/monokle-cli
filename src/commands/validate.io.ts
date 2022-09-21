import { ValidationResponse } from "validation";
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
      B(` ${S.warning} ${validationCount} resources are invalid.`, {
        padding: 1,
        dimBorder: true,
      })
    )
    .line();

  for (const run of response.runs) {
    if (run.results.length === 0) continue;

    screen.line(C.blue(`Tool: ${run.tool.driver.name}`));

    for (const result of run.results) {
      screen.line(`${S.error} [${result.ruleId}] ${result.message.text}`);
    }

    screen.line();
  }

  return screen.toString();
};
