import { describe as describeVitest, afterAll, beforeAll, afterEach } from 'vitest'
import sinon from 'sinon';
import { ApiHandler, Authenticator, DeviceFlowHandler, StorageHandlerAuth } from '@monokle/synchronizer';
import { authenticatorGetter } from '../src/utils/authenticator.js';
import { synchronizerGetter } from '../src/utils/synchronizer.js';

type RunCommandFn = (command: string) => Promise<{err: any, argv: any, output: string}>;

// IMPORTANT: Since 'console.log' is overwritten to capture the output of the commands,
// use e.g. 'console.info' to log temporary messages in test for debug purposes.

export function describe(name: string, fn: (runCommand: RunCommandFn) => void) {

  // Make sure tests always use tmp storage path instead of default one which may break tests if user is authenticated.
  (authenticatorGetter as any)._authenticator = new Authenticator(
    new StorageHandlerAuth('./test/'),
    new ApiHandler(),
    new DeviceFlowHandler(),
  );

  describeVitest(name, () => {
    const testLogs: string[] = [];

    let cliInstance: any;
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
      if (!cliInstance) {
        const {cli} = await import('../src/cli.js');
        cliInstance = cli;
      }

      // Empty callback needs to be provided, otherwise this code breaks resulting in process exiting with code 1.
      return cliInstance.parseAsync(command, (_err, _argv, _output) => {})
        .then((argv) => {
          return {
            err: null,
            argv,
            output: getCommandOutput(),
          };
        })
        .catch((err) => {
          return {
            err,
            argv: null,
            output: getCommandOutput(),
          };
        });
    }

    fn(runCommand);
  });
}

export function getRemoteLikeEnvStubber(throwsOnSynchronize = false) {
  const authenticator = authenticatorGetter.authenticator;
  const synchronizer = synchronizerGetter.synchronizer;

  const userOrig = authenticator.user;
  const stubs: sinon.SinonStub[] = [];

  const stub = () => {
    (authenticatorGetter.authenticator as any)._user = {
      email: 'testuser@kubeshop.io',
      isAuthenticated: true,
      token: 'test-token',
    };

    const synchronizeStub = sinon.stub(synchronizer, 'synchronize').callsFake(async () => {
      if (throwsOnSynchronize) {
        throw new Error('Error when synchronizing policy...');
      }

      return {
        valid: true,
        path: 'some/fake/path',
        policy: {
          plugins: {
            'yaml-syntax': true,
            'open-policy-agent': true
          }
        }
      };
    });
    stubs.push(synchronizeStub);

    const getProjectInfoStub = sinon.stub(synchronizer, 'getProjectInfo').resolves({
      name: 'Test Project',
      slug: 'test-project',
    });
    stubs.push(getProjectInfoStub);
  };

  const restore = () => {
    (authenticatorGetter.authenticator as any)._user = userOrig;
    stubs.forEach((stub) => stub.restore());
  }

  return {
    stub,
    restore,
  };
}
