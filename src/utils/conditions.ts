import { authenticatorGetter } from "./authenticator.js";

export async function throwIfNotAuthenticated() {
  const authenticator = authenticatorGetter.authenticator;

  if (!authenticator.user.isAuthenticated) {
    throw new Error("Not authenticated.");
  }
}

export async function throwIfAuthenticated() {
  const authenticator = authenticatorGetter.authenticator;

  if (authenticator.user.isAuthenticated) {
    throw new Error("Already authenticated.");
  }
}