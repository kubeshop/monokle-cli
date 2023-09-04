import { authenticatorGetter } from "./authenticator.js";

export function throwIfNotAuthenticated() {
  const authenticator = authenticatorGetter.authenticator;

  if (!authenticator.user.isAuthenticated) {
    throw new Error("Not authenticated.");
  }
}

export function throwIfAuthenticated() {
  const authenticator = authenticatorGetter.authenticator;

  if (authenticator.user.isAuthenticated) {
    throw new Error("Already authenticated.");
  }
}