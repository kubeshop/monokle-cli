import { getStoreAuth } from "./store.js";

export async function throwIfNotAuthenticated() {
  const store = await getStoreAuth();

  if (!store?.auth) {
    throw new Error("Not authorized.");
  }
}

export async function throwIfAuthenticated() {
  const store = await getStoreAuth();

  if (store?.auth) {
    throw new Error("Already authorized.");
  }
}