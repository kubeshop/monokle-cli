import {InvalidArgument} from "../errors.js";

export function assertFlags(flags: Record<string, string | undefined>) {
  const missingFlags = Object.entries(flags)
    .filter(([_flag, value]) => !value || value.length === 0)
    .map(entry => entry[0]);

  // If none of the flags are set, we don't throw an error.
  if (missingFlags.length > 0 && missingFlags.length < Object.keys(flags).length) {
    throw new InvalidArgument(`Missing required flags: ${missingFlags.map(flag => `--${flag}`).join(', ')}`);
  }
}
