import {InvalidArgument} from "../errors.js";

export function assertApiFlags(apiToken: string | undefined, projectSlug: string | undefined) {
  const isApiTokenValid = apiToken && apiToken.length > 0;
  const isProjectSlugValid = projectSlug && projectSlug.length > 0;

  if (isApiTokenValid && !isProjectSlugValid) {
    throw new InvalidArgument('Project slug (-p) is required when using an API token (-t) flag');
  }

  if (!isApiTokenValid && isProjectSlugValid) {
    throw new InvalidArgument('API token (-t) is required when using a project (-p) flag');
  }
}

export function assertFlags(flags: Record<string, string | undefined>) {
  const missingFlags = Object.entries(flags)
    .filter(([_flag, value]) => !value || value.length === 0)
    .map(entry => entry[0]);

  if (missingFlags.length > 0) {
    throw new InvalidArgument(`Missing required flags: ${missingFlags.map(flag => `--${flag}`).join(', ')}`);
  }
}
