#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { validate } from "./commands/validate.js";
import { logout } from "./commands/logout.js";
import { whoami } from "./commands/whoami.js";
import { sync } from "./commands/sync.js";
import fetch from "isomorphic-fetch";

(global as any).fetch = fetch;
import "abortcontroller-polyfill/dist/polyfill-patch-fetch.js";

yargs(hideBin(process.argv))
  .scriptName("monokle")
  .parserConfiguration({
    "greedy-arrays": false,
  })
  .command(validate)
  .command(sync)
  .command(logout)
  .command(whoami)
  .showHelpOnFail(false)
  .parseAsync();
