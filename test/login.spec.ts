import { it, expect, afterEach } from 'vitest';
import sinon from 'sinon';
import { describe, getRemoteLikeEnvStubber } from './setup.js';
import { AlreadyAuthenticated } from "../src/errors";

describe('Login command', (runCommand) => {
  const stubs: sinon.SinonStub[] = [];

  let stubber: Awaited<ReturnType<typeof getRemoteLikeEnvStubber>>;

  afterEach(() => {
    stubber?.restore();
    stubs.forEach((stub) => stub.restore());
  });

  it('throws error when already logged in', async () => {
    stubber = await getRemoteLikeEnvStubber();
    stubber.stub();

    const result = await runCommand('login');

    expect(result.err).not.toBe(null);
    expect(result.err instanceof AlreadyAuthenticated).toBeTruthy();
  });
});
