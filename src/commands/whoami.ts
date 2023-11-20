import { authenticatorGetter } from "../utils/authenticator.js";
import { error, success } from "./whoami.io.js";
import { command } from "../utils/command.js";
import { print } from "../utils/screens.js";
import { isAuthenticated } from "../utils/conditions.js";
import { settings } from "../utils/settings.js";

type Options = {};

export const whoami = command<Options>({
  command: "whoami",
  describe: "Get info about current user",
  async handler() {
    if (!(await isAuthenticated())) {
      print(error);
    } else {
      const authenticator = await authenticatorGetter.getInstance();
      print(success(authenticator.user.email!, settings.origin));
    }
  },
});
