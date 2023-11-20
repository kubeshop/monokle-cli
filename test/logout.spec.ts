import { it, expect, afterEach } from 'vitest';
import { describe, getRemoteLikeEnvStubber } from './setup.js';
import {Unauthenticated} from "../src/errors";

describe('Logout command', (runCommand) => {
  let stubber: Awaited<ReturnType<typeof getRemoteLikeEnvStubber>>;

  afterEach(() => {
    stubber?.restore();
  });

  it('logouts correctly', async () => {
    stubber = await getRemoteLikeEnvStubber();
    stubber.stub();

    const result = await runCommand('logout');

    expect(result.err).toBe(null);
    expect(result.output).toContain('Logged out successfully');
  });

  it('throws error when already logged out', async () => {
    const result = await runCommand('logout');

    expect(result.err).not.toBe(null);
    expect(result.err instanceof Unauthenticated).toBeTruthy();
  });
});
