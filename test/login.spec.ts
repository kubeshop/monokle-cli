import { it, expect, afterEach } from 'vitest';
import sinon from 'sinon';
import { describe } from './setup.js';
import { authenticatorGetter } from '../src/utils/authenticator.js';

describe('Login command', (runCommand) => {
  const stubs: sinon.SinonStub[] = [];

  afterEach(() => {
    stubs.forEach((stub) => stub.restore());
  });

  it('can login by passing api token', async () => {
    const authenticator = authenticatorGetter.authenticator;

    const loginStub = sinon.stub(authenticator, 'login').resolves({
        onDone: Promise.resolve({
            email: 'testuser2@kubeshop.io'
        }),
    });
    stubs.push(loginStub);

    const result = await runCommand('login -t SAMPLE_TOKEN');

    expect(result.err).toBe(null);
    expect(result.output).toContain('Successfully logged in');
    expect(result.output).toContain('testuser2@kubeshop.io');
  });
});
