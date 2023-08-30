import open from 'open';
import { AuthenticatorLoginResponse } from "@monokle/synchronizer";
import { authenticatorGetter } from "../utils/authenticator.js";
import { promptForLoginMethod, promptForDeviceFlowInput, promptForToken, cancelled, error, success, urlInfo, waiting } from "./login.io.js";
import { command } from "../utils/command.js";
import { throwIfAuthenticated } from "../utils/conditions.js";
import { print } from "../utils/screens.js";
import { isDefined } from "../utils/isDefined.js";

type Options = {
  'api-token'?: string;
};

export const login = command<Options>({
  command: "login",
  describe: "Login to Monokle Cloud",
  builder(args) {
    return args
      .option("api-token", {
        type: "string",
        description: "API token to use for authentication instead of interactive flow. Useful for CI/CD scenarios.",
        alias: "t",
      });
  },
  async handler({ apiToken }) {
    await throwIfAuthenticated();

    const authenticator = authenticatorGetter.authenticator;

    try {
      let loginRequest: AuthenticatorLoginResponse | undefined = undefined;

      if (apiToken) {
        loginRequest = await authenticator.login('token', apiToken);
      } else {
        const methods = authenticator.methods;

        const selectedMethod = await promptForLoginMethod(methods);

        if (!isDefined(selectedMethod)) {
          print(cancelled);
          return;
        }

        if (selectedMethod === 'device code') {
          loginRequest = await authenticator.login(selectedMethod);

          const handle =  loginRequest.handle;

          if (!handle) {
            throw new Error('Error connecting to authentication service.');
          }

          const confirmed = await promptForDeviceFlowInput();
          if (confirmed) {
            await open(handle.verification_uri_complete);
          }

          print(urlInfo(handle.verification_uri_complete));
        } else if (selectedMethod === 'token') {
          const token = await promptForToken();
          loginRequest = await authenticator.login(selectedMethod, token);
        }
      }

      if (!isDefined(loginRequest)) {
        print(cancelled);
        return;
      }

      print(waiting);

      const user = await loginRequest.onDone;

      print(success(user.email!));
    } catch (err: any) {
      print(error(err.message));
    }
  },
});
