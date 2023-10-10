import { it, expect, afterEach } from 'vitest';
import sinon from 'sinon';
import { describe, getRemoteLikeEnvStubber } from './setup.js';
import { authenticatorGetter } from '../src/utils/authenticator.js';
import {AlreadyAuthenticated} from "../src/errors";

describe('Login command', (runCommand) => {
  const stubs: sinon.SinonStub[] = [];

  let stubber: ReturnType<typeof getRemoteLikeEnvStubber>;

  afterEach(() => {
    stubber?.restore();
    stubs.forEach((stub) => stub.restore());
  });

  it('throws error when already logged in', async () => {
    stubber = getRemoteLikeEnvStubber();
    stubber.stub();

    const result = await runCommand('login');

    expect(result.err).not.toBe(null);
    expect(result.err instanceof AlreadyAuthenticated).toBeTruthy();
  });
});
