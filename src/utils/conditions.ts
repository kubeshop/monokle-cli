import { createDefaultMonokleAuthenticator } from "@monokle/synchronizer";

export async function throwIfNotAuthenticated() {
  const authenticator = createDefaultMonokleAuthenticator();

  if (!authenticator.user.isAuthenticated) {
    throw new Error("Not authenticated.");
  }
}

export async function throwIfAuthenticated() {
  const authenticator = createDefaultMonokleAuthenticator();

  if (authenticator.user.isAuthenticated) {
    throw new Error("Already authenticated.");
  }
}