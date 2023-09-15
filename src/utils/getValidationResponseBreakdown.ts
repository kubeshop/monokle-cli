import { ValidationResponse, ValidationResult, isSuppressed } from "@monokle/validation"

export interface ValidationResponseBreakdown {
  problems: number
  suppressions: number
  errors: number
  warnings: number
}

export function resultsBreakdown(results: ValidationResult[]) {
  return results.reduce<ValidationResponseBreakdown>((acc, result) => {
    const isProblemSuppressed = isSuppressed(result)

    acc.problems += +!isProblemSuppressed
    acc.suppressions += +isProblemSuppressed
    acc.errors += +(!isProblemSuppressed && result.level === 'error')
    acc.warnings += +(!isProblemSuppressed && result.level === 'warning')
    return acc
  }, {suppressions: 0, problems: 0, errors: 0, warnings: 0}) 
}

export function getValidationResponseBreakdown(response: ValidationResponse) {
  return response.runs.reduce<ValidationResponseBreakdown>((acc, run) => {
    const breakdown = resultsBreakdown(run.results)
    acc.problems += breakdown.problems
    acc.suppressions += breakdown.suppressions
    acc.errors += breakdown.errors
    acc.warnings += breakdown.warnings
    return acc
  }, {suppressions: 0, problems: 0, errors: 0, warnings: 0})
}
