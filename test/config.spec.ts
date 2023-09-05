import { it, expect, afterEach } from 'vitest';
import { describe, getRemoteLikeEnvStubber } from './setup.js';

describe('Config command', (runCommand) => {
  let stubber: ReturnType<typeof getRemoteLikeEnvStubber>;

  afterEach(() => {
    stubber?.restore();
  });

  it('shows info about framework based config', async () => {
    const result = await runCommand('config show --framework nsa');

    expect(result.err).toBe(null);
    expect(result.output).toContain('nsa');
    expect(result.output).toContain('framework based policy');
  });

  it('shows info about local config', async () => {
    const result = await runCommand('config show ./test/assets/single-bad-resource.yaml -c ./test/custom/monokle.validation.yaml');

    expect(result.err).toBe(null);
    expect(result.output).toContain('local policy from');
    expect(result.output).toContain('/test/custom/monokle.validation.yaml');
    expect(result.output).toContain('argo/argo-config-maps: warn');
  });

  it('shows info about local default config', async () => {
    const result = await runCommand('config show ./test/assets/single-bad-resource.yaml');

    expect(result.err).toBe(null);
    expect(result.output).toContain('local policy from');
    expect(result.output).toContain('/monokle.validation.yaml');
    expect(result.output).toContain('schemaVersion: v1.26.8');
  });

  it('shows info about remote config', async () => {
    stubber = getRemoteLikeEnvStubber();
    stubber.stub();

    const result = await runCommand('config show .');

    expect(result.err).toBe(null);
    expect(result.output).toContain('remote policy from');
    expect(result.output).toContain('Test Project');
  });
});
