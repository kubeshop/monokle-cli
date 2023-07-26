import prompts from "prompts";
import { command } from "../utils/command.js";
import { throwIfAuthenticated } from "../utils/conditions.js";
import { print } from "../utils/screens.js";
import { getDeviceCode, waitForToken } from "../utils/api.js";
import { setStoreAuth } from "../utils/store.js";
import { error, success, codeInfo, urlInfo } from "./login.io.js";
import { isDefined } from "../utils/isDefined.js";

type Options = {};

export const login = command<Options>({
  command: "login",
  describe: "Login to Monokle Cloud",
  async handler() {
    await throwIfAuthenticated();

    const deviceCode = await getDeviceCode();
    if (!deviceCode) {
      print(error('Error getting device code'));
      return;
    }

    const response = await prompts({
      type: 'text',
      name: 'value',
      message: codeInfo(deviceCode),
    });

    if (!isDefined(response.value)) {
      return;
    }

    print(urlInfo('https://app.monokle.com/settings/tokens'));

    try {
      const accessData = await waitForToken(deviceCode, 5000);
      await setStoreAuth(accessData.email, accessData.accessToken);
      print(success(accessData.email));
    } catch (err: any) {
      print(error(err.message));
    }
  },
});
