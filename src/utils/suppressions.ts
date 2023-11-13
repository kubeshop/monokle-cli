import {  Suppression, } from "@monokle/validation";
import { TokenInfo } from "@monokle/synchronizer";
import { authenticatorGetter } from "./authenticator.js";
import { synchronizerGetter } from "./synchronizer.js";
import { setOrigin } from "./origin.js";

export type SuppressionsData = {
  suppressions: Suppression[],
};

/**
 * Returns the list of suppressions to be applied to the validation results.
 *
 * @param path Path to be validated.
 * @param apiToken API access token.
 * @returns suppressions data.
 */
export async function getSuppressions(
  path: string,
  projectSlug: string | undefined,
  apiToken: string | undefined,
) {
  const authenticator = authenticatorGetter.authenticator;

  if (!apiToken && authenticator.user.isAuthenticated) {
    // Reset origin when device flow was used, since this is not supported yet.
    setOrigin(undefined);
    await authenticator.refreshToken();
  }

  const tokenInfo = (apiToken ? {
    accessToken: apiToken,
    tokenType: 'ApiKey'
  } : authenticator.user.tokenInfo) as TokenInfo;

  if(!tokenInfo.accessToken?.length) return { suppressions: [] }

  const synchronizer = synchronizerGetter.synchronizer

  try {
    return { suppressions: await synchronizer.getSuppressions({ path, ownerProjectSlug: projectSlug }, tokenInfo)}
  } catch (err){
    // continue with no suppressions
    return { suppressions: [] }
  }
}
