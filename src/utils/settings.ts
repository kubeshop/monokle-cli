import { StorageHandler, getDefaultStorageConfigPaths, DEFAULT_ORIGIN } from "@monokle/synchronizer";

const SETTINGS_FILE = 'cli.yaml';

export type Settings = {
  origin?: string;
};

export class StorageSettings extends StorageHandler<Settings> {
  private currentData: Settings = {};
  private initialData: Settings = {};

  constructor() {
    super(getDefaultStorageConfigPaths().config);
    this.initialData = this.getStoreDataSync(SETTINGS_FILE) || {};
  }

  get origin() {
    // Origin precedence:
    // 1. Origin passed via `--origin` flag (which is stored in `currentData`).
    // 2. MONOKLE_ORIGIN environment variable.
    // 3. Origin stored in `initialData` (so the one saved on login if session is still valid).
    // 4. Default origin (Monokle Cloud SaaS).
    //
    // This means even if user is logged in, `--origin` flag or env var can still be used to override the stored origin.
    return this.currentData.origin || process.env.MONOKLE_ORIGIN || this.initialData.origin || DEFAULT_ORIGIN;
  }

  set origin(origin: string) {
    this.currentData.origin = origin;
  }

  getAuthenticatedOrigin() {
    return this.initialData.origin || DEFAULT_ORIGIN;
  }

  async persist() {
    await this.setStoreData({ ...this.initialData, ...this.currentData}, SETTINGS_FILE);
  }
};

export const settings = new StorageSettings();
