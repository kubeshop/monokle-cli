import chalk from "chalk";
import logSymbols from "log-symbols";
import boxen from "boxen";
import clearUpstream from "clear";
import { Strands } from "strands";

export const Screen = Strands;
export const print = console.log;
export const clear = clearUpstream;

export const S = logSymbols;
export const C = chalk;
export const B = boxen;
