import {  Suppression, } from "@monokle/validation";
import { TokenInfo } from "@monokle/synchronizer";
import { authenticatorGetter } from "./authenticator.js";
import { synchronizerGetter } from "./synchronizer.js";

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
  const authenticator = await authenticatorGetter.getInstance();

  if (!apiToken && authenticator.user.isAuthenticated) {
    await authenticator.refreshToken();
  }

  const tokenInfo = (apiToken ? {
    accessToken: apiToken,
    tokenType: 'ApiKey'
  } : authenticator.user.tokenInfo) as TokenInfo;

  if(!tokenInfo.accessToken?.length) return { suppressions: [] }

  const synchronizer = await synchronizerGetter.getInstance();

  try {
    return { suppressions: await synchronizer.getSuppressions({ path, ownerProjectSlug: projectSlug }, tokenInfo)}
  } catch (err){
    // continue with no suppressions
    return { suppressions: [] }
  }
}
