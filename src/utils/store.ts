import YAML from 'yaml';
import untildify from 'untildify';
import { mkdirp } from 'mkdirp'
import { existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { dirname } from "path";
import xdgAppPaths from 'xdg-app-paths';
import type { XDGAppPaths } from 'xdg-app-paths';

type StoreSettings = {}

type StoreAuth = {
  auth?: {
    email: string;
    accessToken: string;
  }
}

const CONFIG_FOLDER = 'monokle';
const CONFIG_FILE_SETTINGS = 'cli.yaml';
const CONFIG_FILE_AUTH = 'auth.yaml';

export async function getStoreSettings(): Promise<StoreSettings | undefined> {
  const configPath = getStoreConfigPath(CONFIG_FILE_SETTINGS);
  return getStoreData(configPath);
}

export async function getStoreAuth(): Promise<StoreAuth | undefined> {
  const configPath = getStoreConfigPath(CONFIG_FILE_AUTH);
  return getStoreData(configPath);
}

export async function emptyStoreAuth(): Promise<boolean> {
  const configPath = getStoreConfigPath(CONFIG_FILE_AUTH);
  return writeStoreData(configPath, '');
}

export async function writeToCache(file: string, data: string): Promise<boolean> {
  const filePath = getStoreCachePath(file);
  return writeStoreData(filePath, data);
}

function getStoreConfigPath(file: string): string {
  const xdg: XDGAppPaths = xdgAppPaths as unknown as XDGAppPaths; // there is some issue with TS typings
  const configDir = xdg({ name: CONFIG_FOLDER }).config();
  const configPath = `${untildify(configDir)}/${file}`;
  return configPath;
}

function getStoreCachePath(file: string): string {
  const xdg: XDGAppPaths = xdgAppPaths as unknown as XDGAppPaths; // there is some issue with TS typings
  const configDir = xdg({ name: CONFIG_FOLDER }).cache();
  const configPath = `${untildify(configDir)}/${file}`;
  return configPath;
}

async function getStoreData(file: string) {
  if (!existsSync(file)) {
    return undefined;
  }

  try {
    const data = await readFile(file, 'utf8');
    const config = YAML.parse(data);
    return config;
  } catch (err) {
    console.error('Failed to read configuration from ' + file);
    return undefined;
  }
}

async function writeStoreData(file: string, data: string) {
  const dir = dirname(file);

  try {
    await mkdirp(dir);
    await writeFile(file, data);
    return true;
  } catch (err) {
    return false;
  }
}
