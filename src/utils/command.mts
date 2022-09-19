import { ArgumentsCamelCase, CommandBuilder, CommandModule } from "yargs";

type CommandInit<TOptions> = {
  command: string;
  describe: string;
  builder?: CommandBuilder<{}, TOptions>;
  handler: (args: ArgumentsCamelCase<TOptions>) => void | Promise<void>;
};

export function command<TOptions>(
  init: CommandInit<TOptions>
): CommandModule<{}, TOptions> {
  return init as CommandModule<{}, TOptions>;
}
