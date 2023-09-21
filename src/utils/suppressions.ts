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
  apiToken: string | undefined
) {
  const authenticator = authenticatorGetter.authenticator;

  if (!apiToken && authenticator.user.isAuthenticated) {
    await authenticator.refreshToken();
  }

  const tokenInfo = (apiToken ? {
    accessToken: apiToken,
    tokenType: 'ApiKey'
  } : authenticator.user.tokenInfo) as TokenInfo;

  if(!tokenInfo.accessToken?.length) return { suppressions: [] }

  const synchronizer = synchronizerGetter.synchronizer

  try {
    return { suppressions:  await synchronizer.getSuppressions(path, tokenInfo)}
  } catch (err){
    // continue with no suppressions
  }
  return { suppressions: [] }

}
