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
