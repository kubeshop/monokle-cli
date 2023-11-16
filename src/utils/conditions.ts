import { authenticatorGetter } from "./authenticator.js";
import {AlreadyAuthenticated, Unauthenticated} from "../errors.js";

export function isAuthenticated() {
  return Boolean(authenticatorGetter.authenticator?.user.isAuthenticated);
}

export function throwIfNotAuthenticated() {
  if (!isAuthenticated()) {
    throw new Unauthenticated();
  }
}

export function throwIfAuthenticated() {
  if (isAuthenticated()) {
    throw new AlreadyAuthenticated()
  }
}
