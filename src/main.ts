#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { validate } from "./commands/validate.js";
import { login } from "./commands/login.js";
import { logout } from "./commands/logout.js";
import { whoami } from "./commands/whoami.js";
import { config } from "./commands/config.js";
import fetch from "isomorphic-fetch";

(global as any).fetch = fetch;
import "abortcontroller-polyfill/dist/polyfill-patch-fetch.js";

yargs(hideBin(process.argv))
  .scriptName("monokle")
  .parserConfiguration({
    "greedy-arrays": false,
  })
  .command(validate)
  .command(login)
  .command(logout)
  .command(whoami)
  .command(config)
  .showHelpOnFail(false)
  .parseAsync();
