import { getStoreAuth } from "./store.js";

export async function throwIfNotAuthorized() {
  const store = await getStoreAuth();

  if (!store?.auth) {
    throw new Error("Not authorized.");
  }
}

export async function throwIfAuthorized() {
  const store = await getStoreAuth();

  if (store?.auth) {
    throw new Error("Already authorized.");
  }
}