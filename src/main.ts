#!/usr/bin/env node
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { validate } from "./commands/validate.js";

await yargs(hideBin(process.argv))
  .parserConfiguration({
    "greedy-arrays": false,
  })
  .command(validate)
  .showHelpOnFail(false)
  .parseAsync();

process.exit(0);
