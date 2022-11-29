import type { CommandBuilder, CommandModule } from "yargs";

type CommandInit<TOptions, THandler> = {
  command: string;
  describe: string;
  builder?: CommandBuilder<{}, TOptions>;
  handler: THandler;
};

export function command<TOptions>(
  init: CommandInit<TOptions, CommandModule<{}, TOptions>["handler"]>
): CommandModule<{}, TOptions> {
  return init as CommandModule<{}, TOptions>;
}
