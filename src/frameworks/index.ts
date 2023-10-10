import { Config } from "@monokle/validation";
import pssBaseline from "./pss-baseline.js";
import pssRestricted from "./pss-restricted.js";
import nsa from "./nsa.js";

export type Framework = "pss-restricted" | "pss-baseline" | "nsa";

export const getFrameworkConfig = async (framework?: Framework): Promise<Config | undefined> => {
  switch (framework) {
    case "pss-baseline": {
      return pssBaseline as Config;
    }
    case "pss-restricted": {
      return pssRestricted as Config;
    }
    case "nsa": {
      return nsa as Config;
    }
    default: {
      return undefined;
    }
  }
};
