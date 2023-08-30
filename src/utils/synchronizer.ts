import { createDefaultMonokleSynchronizer, Synchronizer} from "@monokle/synchronizer";

// This class exists for test purposes to easily mock the synchronizer.
// It also ensures singleton instance of the synchronizer is used.
class SynchronizerGetter {
  private _synchronizer: Synchronizer;

  constructor() {
    this._synchronizer = createDefaultMonokleSynchronizer();
  }

  get synchronizer() {
    return this._synchronizer;
  }
}

export const synchronizerGetter = new SynchronizerGetter();
