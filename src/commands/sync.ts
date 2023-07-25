import { realpath } from "fs/promises";
import { dirname } from "path";
import { Document } from "yaml";
import { command } from "../utils/command.js";
import { throwIfNotAuthenticated } from "../utils/conditions.js";
import { getRepoRemoteData, isGitRepo } from "../utils/git.js";
import { getStoreAuth, writeToCache } from "../utils/store.js";
import { getPolicy, getUser } from "../utils/api.js";

type Options = {
  path?: string;
};

export const sync = command<Options>({
  command: "sync [path]",
  describe: "Synchronize remote policy from Monokle Cloud locally",
  builder(args) {
    return args
      .positional("path", { type: "string", demandOption: false });
  },
  async handler({ path }) {
    throwIfNotAuthenticated();

    const currentPath = path ?? '.';
    const currentPathNormalized = await realpath(currentPath);
    const currentDir = dirname(currentPathNormalized);
    const gitRepo = await isGitRepo(currentDir);

    if (!gitRepo) {
      // Error: Not a git repository
      return;
    }

    const repoRemote = await getRepoRemoteData(currentDir);
    if (!repoRemote) {
      // Error: No remote found
      return;
    }

    const authData = await getStoreAuth();

    const userData = await getUser(authData!.auth!.accessToken);
    if (!userData?.data?.me) {
      // Error: No user found
      return;
    }

    const repoMainProject = userData.data.me.projects.find(project => {
      return project.project.repositories.find(repo => repo.owner === repoRemote.owner && repo.name === repoRemote.name && repo.prChecks);
    });

    const repoFirstProject = userData.data.me.projects.find(project => {
      return project.project.repositories.find(repo => repo.owner === repoRemote.owner && repo.name === repoRemote.name);
    });

    const repoProject = repoMainProject ?? repoFirstProject;
    if (!repoProject) {
      // Error: No project found
      return;
    }

    const policy = await getPolicy(repoProject.project.slug, authData!.auth!.accessToken);
    if (!policy?.data?.getProject?.policy) {
      // Error: No policy found
      return;
    }

    await saveConfig(policy.data.getProject.policy.json, `${repoRemote.provider}-${repoRemote.owner}-${repoRemote.name}`);
  },
});

export async function saveConfig(config: any, filePrefix: string) {
  const configDoc = new Document();
  configDoc.contents = config;
  configDoc.toString();

  return writeToCache(`${filePrefix}.policy.yaml`, configDoc.toString());
}
