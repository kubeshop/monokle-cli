import { ApiSuppression } from '@monokle/synchronizer';
import { FingerprintSuppression } from '@monokle/types';
import { SuppressionStatus } from '@monokle/validation';


// NOTE: The API SuppressionModel uses different status enum values - 
// - ("ACCEPTED" | "REJECTED" | "UNDER_REVIEW" instead of "accepted" | "rejected" | "underReview")
// TODO: Consider changing the API suppression status to match the spec and eventually remove this adaptor

function toSuppressionStatus(status: SuppressionStatus | string): SuppressionStatus  {
  switch (status) {
    case 'ACCEPTED':
    case 'accepted':
      return 'accepted'      
    case 'REJECTED':
    case 'rejected':
      return 'rejected'      
    case 'UNDER_REVIEW':
    case 'underReview':
      return 'underReview'      
    default:
      return status as SuppressionStatus
  }

}

export function toFingerprintSuppression(
  suppression: ApiSuppression
): FingerprintSuppression  {
  return {
    guid: suppression.id,
    kind: 'external',
    status: toSuppressionStatus(suppression.status),
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
