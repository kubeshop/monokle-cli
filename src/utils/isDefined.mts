import isUndefined from "lodash/isUndefined.js";

export function isDefined<T>(value: T | null | undefined): value is T {
  return !isUndefined(value);
}
