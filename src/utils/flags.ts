export function verifyApiFlags(apiToken: string | undefined, projectSlug: string | undefined) {
  const isApiTokenValid = apiToken && apiToken.length > 0;
  const isProjectSlugValid = projectSlug && projectSlug.length > 0;

  if (isApiTokenValid && !isProjectSlugValid) {
    throw new Error('Project slug (-p) is required when using an API token flag');
  }

  if (!isApiTokenValid && isProjectSlugValid) {
    throw new Error('API token (-t) is required when using a project flag');
  }
}
