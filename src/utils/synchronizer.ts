import { ApiHandler, createDefaultMonokleSynchronizer, StorageHandlerPolicy, Synchronizer} from "@monokle/synchronizer";
import { getOrigin } from "./origin.js";

// This class exists for test purposes to easily mock the synchronizer.
// It also ensures singleton instance of the synchronizer is used.
class SynchronizerGetter {
  private _synchronizer: Synchronizer | undefined = undefined;

  get synchronizer(): Synchronizer {
    // Lazy create synchronizer so initial configuration (like origin) can be set by other parts of the code.
    if (!this._synchronizer) {
      this._synchronizer = createDefaultMonokleSynchronizer(
        new StorageHandlerPolicy(),
        new ApiHandler(getOrigin())
      );
    }

    return this._synchronizer;
  }
}

export const synchronizerGetter = new SynchronizerGetter();
