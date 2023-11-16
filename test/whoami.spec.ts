import { it, expect, afterEach } from 'vitest';
import { describe, getRemoteLikeEnvStubber } from './setup.js';

describe('Whoami command', (runCommand) => {
  let stubber: Awaited<ReturnType<typeof getRemoteLikeEnvStubber>>;

  afterEach(() => {
    stubber?.restore();
  });

  it('shows user info when authenticated', async () => {
    stubber = await getRemoteLikeEnvStubber();
    stubber.stub();

    const result = await runCommand('whoami');

    expect(result.err).toBe(null);
    expect(result.output).toContain('Logged in as');
    expect(result.output).toContain('testuser@kubeshop.io');
  });

  it('show message when not authenticated', async () => {
    const result = await runCommand('whoami');

    expect(result.err).toBe(null);
    expect(result.output).toContain('You are not signed into Monokle Cloud');
  });
});
