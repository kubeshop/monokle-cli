import { ApiSuppression } from '@monokle/synchronizer';
import { FingerprintSuppression } from '@monokle/types';
import { SuppressionStatus } from '@monokle/validation';


export function toFingerprintSuppression(
  suppression: ApiSuppression
): FingerprintSuppression  {
  console.log('suppression:', suppression)
  return {
    guid: suppression.id,
    kind: 'external',
    // NOTE: The API SuppressionModel uses different status enum values - 
    // - ("ACCEPTED" | "REJECTED" | "UNDER_REVIEW" instead of "accepted" | "rejected" | "underReview")
    // 
    // We can safely transform to lowercase here since the CLI only really cares about "accepted" suppressions
    // TODO: Consider changing the API suppression status enum to match the spec
    status: suppression.status.toLowerCase() as SuppressionStatus,
    fingerprint: suppression.fingerprint,
  };
}

export function getFingerprintSuppressions(suppressions: ApiSuppression[]) {
  return suppressions.reduce<FingerprintSuppression []>(
    (acc, suppression) =>
      suppression.isDeleted
        ? acc
        : (acc.push(toFingerprintSuppression(suppression)), acc),
    []
  );
}
