import { writeFileSync } from 'fs';
import { join } from 'path'

// This works only when run via npm.
const version = process.env.npm_package_version;
if (!version) {
  throw new Error('No version found!');
}

writeFileSync(join(process.cwd(), 'src', 'version.ts'), `export const VERSION = '${version}';\n`);
