import { authenticatorGetter } from "./authenticator.js";
import {AlreadyAuthenticated, Unauthenticated} from "../errors.js";

export async function isAuthenticated() {
  return Boolean((await authenticatorGetter.getInstanceSafe())?.user.isAuthenticated);
}

export async function throwIfNotAuthenticated() {
  if (!(await isAuthenticated())) {
    throw new Unauthenticated();
  }
}

export async function throwIfAuthenticated() {
  if ((await isAuthenticated())) {
    throw new AlreadyAuthenticated()
  }
}
