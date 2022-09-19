import isNil from "lodash/isNil.js";

export function isDefined<T>(value: T | null | undefined): value is T {
  return !isNil(value);
}
