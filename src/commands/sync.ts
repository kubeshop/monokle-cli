import { Document } from "yaml";
import { command } from "../utils/command.js";
import { throwIfNotAuthenticated } from "../utils/conditions.js";
import { writeToCache } from "../utils/store.js";
import { fetchPolicy } from "../utils/policy.js";
import { print } from "../utils/screens.js";
import { error, success } from "./sync.io.js";

type Options = {
  path?: string;
};

// @TODO could also accept --apiToken as alternative auth option.
export const sync = command<Options>({
  command: "sync [path]",
  describe: "Synchronize remote policy from Monokle Cloud locally",
  builder(args) {
    return args
      .positional("path", { type: "string", demandOption: false });
  },
  async handler({ path }) {
    await throwIfNotAuthenticated();

    try {
      const policyData = await fetchPolicy(path ?? '.');
      await saveConfig(policyData.policy, policyData.repoSlug);
      print(success(policyData.destDir, policyData.repoId));
    } catch (err: any) {
      throw new Error(error(err.message));
    }
  },
});

export async function saveConfig(config: any, filePrefix: string) {
  const configDoc = new Document();
  configDoc.contents = config;
  configDoc.toString();

  return writeToCache(`${filePrefix}.policy.yaml`, configDoc.toString());
}
