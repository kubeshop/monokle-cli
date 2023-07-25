import { command } from "../utils/command.js";
import { throwIfNotAuthorized } from "../utils/conditions.js";
import { emptyStoreAuth } from "../utils/store.js";
import { print } from "../utils/screens.js";
import { error, success } from "./logout.io.js";

type Options = {};

export const logout = command<Options>({
  command: "logout",
  describe: "Logout from Monokle Cloud",
  async handler() {
    await throwIfNotAuthorized();

    const logoutResult = await emptyStoreAuth();
    if (!logoutResult) {
      print(error());
      return;
    }

    print(success());
  },
});
