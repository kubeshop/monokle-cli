import { command } from "../utils/command.js";
import { getStoreAuth } from "../utils/store.js";
import { print } from "../utils/screens.js";
import { success } from "./whoami.io.js";
import { throwIfNotAuthorized } from "../utils/conditions.js";

type Options = {};

export const whoami = command<Options>({
  command: "whoami",
  describe: "Get info about current user",
  async handler() {
    throwIfNotAuthorized();

    const store = await getStoreAuth();
    print(success(store!.auth!.email));
  },
});
