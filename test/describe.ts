import { describe as describeVitest, afterAll, beforeAll, afterEach } from 'vitest'

type RunCommandFn = (command: string) => Promise<{err: any, argv: any, output: string}>;

// IMPORTANT: Since 'console.log' is overwritten to capture the output of the commands,
// use e.g. 'console.info' to log temporary messages in test for debug purposes.

export function describe(name: string, fn: (runCommand: RunCommandFn) => void) {
  describeVitest(name, () => {
    const testLogs: string[] = [];

    let consoleLogOrig = console.log;

    beforeAll(async () => {
      console.log = (...args) => {
        testLogs.push(args.join(' '));
        return args;
      };
    });

    afterEach(async () => {
      testLogs.length = 0;
    });

    afterAll(async () => {
      console.log = consoleLogOrig;
    });

    const getCommandOutput = () => {
      return testLogs.join('\n');
    };

    const runCommand = async (command: string): Promise<{err: any, argv: any, output: string}> => {
      const {cli} = await import('../src/cli.js');

      return new Promise((resolve) => {
        cli.parse(command, (err, argv, _output) => {
          resolve({
            err,
            argv,
            output: getCommandOutput(),
          });
        })
      });
    }

    fn(runCommand);
  });
}
