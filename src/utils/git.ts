import { simpleGit } from 'simple-git';
import type { RemoteWithRefs } from 'simple-git';

export type RepoRemoteData = {
  remote: string;
  owner: string;
  name: string;
  provider: string;
};

export async function isGitRepo(folderPath: string) {
  try {
    await (simpleGit(folderPath)).status();
    return true;
  } catch (err: any) {
    return false;
  }
}

export async function getRepoRemoteData(folderPath: string): Promise<RepoRemoteData | undefined> {
  const remote = await getMainRemote(folderPath);
  if (!remote) {
    return undefined;
  }

  const url = remote.refs.push;
  // With generic git support in Cloud, this should also become generic.
  const match = url.match(/github\.com(\/|:)([^\/]+)\/([^\/]+)\.git/);
  if (!match) {
    return undefined;
  }

  return {
    remote: remote.name,
    owner: match[2],
    name: match[3],
    provider: 'github',
  };
}

async function getMainRemote(folderPath: string): Promise<RemoteWithRefs | undefined> {
  const remotes = await getRemotes(folderPath);
  return remotes.find(remote => remote.name === 'origin') ?? remotes[0];
}

async function getRemotes(folderPath: string): Promise<RemoteWithRefs[]> {
  try {
    const git = simpleGit(folderPath);
    return await git.getRemotes(true);
  } catch (err: any) {
    if (err.message.toLowerCase().includes('not a git repository')) {
        return [];
    } else {
        throw err;
    }
  }
}
