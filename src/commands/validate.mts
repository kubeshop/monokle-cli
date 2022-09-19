import { command } from "../utils/command.mjs";
import { print } from "../utils/screens.mjs";
import { success } from "./validate.io.mjs";

type Options = {
  name: string;
};

export const validate = command<Options>({
  command: "validate",
  describe: "Validate your Kubernetes resources",
  async handler() {
    print(success());
  },
});
