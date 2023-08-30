import { it, expect, afterEach } from 'vitest';
import { describe, getRemoteLikeEnvStubber } from './setup.js';

describe('Whoami command', (runCommand) => {
  let stubber: ReturnType<typeof getRemoteLikeEnvStubber>;

  afterEach(() => {
    stubber?.restore();
  });

  it('shows user info when authenticated', async () => {
    stubber = getRemoteLikeEnvStubber();
    stubber.stub();

    const result = await runCommand('whoami');

    expect(result.err).toBe(null);
    expect(result.output).toContain('Logged in as');
    expect(result.output).toContain('testuser@kubeshop.io');
  });

  // @TODO: This throws uncatchable error and vitest complains about it (even though test passes).
  // I suspect it's related how yargs handle running async command handler.
  // it('throws error when not authenticated', async () => {
  //   const result = await runCommand('whoami');

  //   expect(result.err).not.toBe(null);
  //   expect(result.err.message).toContain('Not authenticated');
  // });
});
