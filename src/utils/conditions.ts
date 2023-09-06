import { authenticatorGetter } from "./authenticator.js";

export function isAuthenticated() {
  return authenticatorGetter.authenticator.user.isAuthenticated;
}

export function throwIfNotAuthenticated() {
  if (!isAuthenticated()) {
    throw new Error("Not authenticated.");
  }
}

export function throwIfAuthenticated() {
  if (isAuthenticated()) {
    throw new Error("Already authenticated.");
  }
}