import { authenticatorGetter } from "../utils/authenticator.js";
import { error, success } from "./whoami.io.js";
import { command } from "../utils/command.js";
import { print } from "../utils/screens.js";
import { isAuthenticated } from "../utils/conditions.js";

type Options = {};

export const whoami = command<Options>({
  command: "whoami",
  describe: "Get info about current user",
  async handler() {
    if (!isAuthenticated()) {
      print(error);
    } else {
      const authenticator = authenticatorGetter.authenticator;
      print(success(authenticator.user.email!));
    }
  },
});
