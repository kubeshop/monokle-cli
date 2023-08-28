import { createDefaultMonokleAuthenticator } from "@monokle/synchronizer";
import { success } from "./whoami.io.js";
import { command } from "../utils/command.js";
import { print } from "../utils/screens.js";
import { throwIfNotAuthenticated } from "../utils/conditions.js";

type Options = {};

export const whoami = command<Options>({
  command: "whoami",
  describe: "Get info about current user",
  async handler() {
    await throwIfNotAuthenticated();

    const authenticator = createDefaultMonokleAuthenticator();
    print(success(authenticator.user.email!));
  },
});
