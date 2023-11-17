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
    return this.currentData.origin || process.env.MONOKLE_ORIGIN || this.initialData.origin || DEFAULT_ORIGIN;
  }

  set origin(origin: string) {
    this.currentData.origin = origin;
  }

  async persist() {
    await this.setStoreData({ ...this.initialData, ...this.currentData}, SETTINGS_FILE);
  }
};

export const settings = new StorageSettings();
