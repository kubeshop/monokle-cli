import open from 'open';
import { authenticatorGetter } from "../utils/authenticator.js";
import { promptForDeviceFlowInput, cancelled, error, success, urlInfo, waiting } from "./login.io.js";
import { command } from "../utils/command.js";
import { throwIfAuthenticated } from "../utils/conditions.js";
import { print } from "../utils/screens.js";
import { isDefined } from "../utils/isDefined.js";
import { settings } from '../utils/settings.js';

type Options = {
  'origin'?: string;
};

export const login = command<Options>({
  command: "login",
  describe: "Login to Monokle Cloud",
  builder(args) {
    return args
      .option("origin", {
        type: "string",
        description: "Monokle remote web app instance URL. Defaults to Monokle Cloud SaaS.",
        alias: "r",
      })
  },
  async handler({ origin }) {
    settings.origin = origin ?? '';

    await throwIfAuthenticated();

    const authenticator = await authenticatorGetter.getInstance();

    try {
      const method = 'device code';
      const loginRequest = await authenticator.login(method);
      const handle =  loginRequest.handle;

      if (!handle) {
        throw new Error('Error connecting to authentication service.');
      }

      const confirmed = await promptForDeviceFlowInput();
      if (confirmed) {
        await open(handle.verification_uri_complete);
      }

      print(urlInfo(handle.verification_uri_complete));


      if (!isDefined(loginRequest)) {
        print(cancelled);
        return;
      }

      print(waiting);

      const user = await loginRequest.onDone;

      await settings.persist();

      print(success(user.email!));
    } catch (err: any) {
      print(error(err.message));
    }
  },
});
