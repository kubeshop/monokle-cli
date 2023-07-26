import normalizeUrl from 'normalize-url';
import { realpath, lstat } from "fs/promises";
import { dirname } from "path";
import { getRepoRemoteData, isGitRepo } from "../utils/git.js";
import { getStoreAuth } from "./store.js";
import { REMOTE_POLICY_URL_DEFAULT, getUser, getPolicy } from "./api.js";

export async function fetchPolicy(path: string) {
  const currentPath = await realpath(path);
  const currentPathStat = await lstat(currentPath);
  const currentDir = currentPathStat.isDirectory() ? currentPath : dirname(currentPath);
  const gitRepo = await isGitRepo(currentDir);

  if (!gitRepo) {
    throw new Error(`The '${currentDir}' directory is not a git repository.`);
  }

  const repoRemote = await getRepoRemoteData(currentDir);
  if (!repoRemote) {
    throw new Error(`Git repository under '${currentDir}' does not have any remotes.`);
  }

  const authData = await getStoreAuth();

  const userData = await getUser(authData!.auth!.accessToken);
  if (!userData?.data?.me) {
    throw new Error(`Authentication error - no user found. Try login again with 'monokle login' command.`);
  }

  const repoMainProject = userData.data.me.projects.find(project => {
    return project.project.repositories.find(repo => repo.owner === repoRemote.owner && repo.name === repoRemote.name && repo.prChecks);
  });

  const repoFirstProject = userData.data.me.projects.find(project => {
    return project.project.repositories.find(repo => repo.owner === repoRemote.owner && repo.name === repoRemote.name);
  });

  const repoProject = repoMainProject ?? repoFirstProject;
  if (!repoProject) {
    const projectUrl = getMonokleCloudUrl(REMOTE_POLICY_URL_DEFAULT, `/dashboard/projects`);
    throw new Error(`The '${repoRemote.owner}/${repoRemote.name}' repository does not belong to any project in Monokle Cloud. You can add it on ${projectUrl}.`);
  }

  const policy = await getPolicy(repoProject.project.slug, authData!.auth!.accessToken);
  if (!policy?.data?.getProject?.policy) {
    const policyUrl = getMonokleCloudUrl(REMOTE_POLICY_URL_DEFAULT, `/dashboard/projects/${repoProject.project.slug}/policy`);
    throw new Error(`The '${repoProject.project.slug}' project does not have policy defined. You can configure it on ${policyUrl}.`);
  }

  return {
    repoId: `${repoRemote.owner}/${repoRemote.name}`,
    repoSlug: `${repoRemote.provider}-${repoRemote.owner}-${repoRemote.name}`,
    destDir: currentDir,
    policy: policy.data.getProject.policy.json
  }
}

function getMonokleCloudUrl(urlBase: string, urlPath: string) {
  if (urlBase.includes('.monokle.com')) {
    return normalizeUrl(`https://app.monokle.com/${urlPath}`);
  } else if (urlBase.includes('.monokle.io')) {
    return normalizeUrl(`https://saas.monokle.io/${urlPath}`);
  }

  // For any custom base urls we just append the path.
  // @TODO this might need adjustment in the future for self-hosted solutions.
  return normalizeUrl(`${urlBase}/${urlPath}`);
}
