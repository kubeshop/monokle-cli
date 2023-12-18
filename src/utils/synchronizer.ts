import { createMonokleSynchronizerFromOrigin, Synchronizer } from "@monokle/synchronizer";
import { settings } from "./settings.js";
import { getClientConfig } from "./client-config.js";

// This class exists for test purposes to easily mock the synchronizer.
// It also ensures singleton instance of the synchronizer is used.
class SynchronizerGetter {
  private _synchronizer: Synchronizer | undefined = undefined;

  async getInstance(): Promise<Synchronizer> {
    // Lazy create synchronizer so initial configuration (like origin) can be set by other parts of the code.
    if (!this._synchronizer) {
      const origin = settings.origin;

      try {
        this._synchronizer = await createMonokleSynchronizerFromOrigin(getClientConfig(), origin || undefined);
      } catch (err) {
        // If we can't use given origin, it doesn't make sense to continue since it's not possible to synchronize policies then.
        throw err;
      }
    }

    return this._synchronizer;
  }
}

export const synchronizerGetter = new SynchronizerGetter();
