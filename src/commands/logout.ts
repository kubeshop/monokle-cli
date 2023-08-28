import { createDefaultMonokleAuthenticator } from "@monokle/synchronizer";
import { error, success } from "./logout.io.js";
import { command } from "../utils/command.js";
import { throwIfNotAuthenticated } from "../utils/conditions.js";
import { print } from "../utils/screens.js";

type Options = {};

export const logout = command<Options>({
  command: "logout",
  describe: "Logout from Monokle Cloud",
  async handler() {
    await throwIfNotAuthenticated();

    const authenticator = createDefaultMonokleAuthenticator();

    try {
      await authenticator.logout();
      print(success());
    } catch (err: any) {
      print(error(err.message));
    }
  },
});
