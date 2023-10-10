import { it, expect, afterEach } from 'vitest';
import { describe, getRemoteLikeEnvStubber, getRemoteLikeApiKeyEnvStubber } from './setup.js';
import {InvalidArgument, ValidationFailed} from "../src/errors.js";

describe('Validate command', (runCommand) => {
  let stubber: ReturnType<typeof getRemoteLikeEnvStubber>;

  afterEach(() => {
    stubber?.restore();
  });

  it('can validate single resource file', async () => {
    const result = await runCommand('validate ./test/assets/single-bad-resource.yaml');

    expect(result.err instanceof ValidationFailed).toBe(true);
    expect(result.output).toContain('12 misconfigurations found. (3 errors)');
    expect(result.output).toContain('test/assets/single-bad-resource.yaml');
  });

  it('can validate resources in a folder', async () => {
    const result = await runCommand('validate ./test/assets');
    expect(result.err instanceof ValidationFailed).toBe(true);
    expect(result.output).toContain('26 misconfigurations found. (6 errors)');
    expect(result.output).toContain('test/assets/multiple-bad-resources.yaml');
    expect(result.output).toContain('test/assets/single-bad-resource.yaml');
  });

  // @TODO: Add stdin test
  // it('can validate resources from stdin', async () => {
  //   const result = await runCommand('validate -');
  //
  //   expect(result.err).toBe(null);
  // });

  it('can validate resources with custom local config', async () => {
    const result = await runCommand('validate ./test/assets --config ./monokle.full-validation.yaml');

    expect(result.err).toBe(null);
    expect(result.output).toContain('26 misconfigurations found. (0 errors)');
  });

  it('can validate resources with custom local plugin', async () => {
    const result = await runCommand('validate ./test/custom --config ./test/custom/monokle.validation.yaml');

    expect(result.err).toBe(null);
    expect(result.output).toContain('1 misconfiguration found. (0 errors)');
    expect(result.output).toContain('Check that ArgoCD ConfigMaps');
  });

  it('can validate resources with remote config', async () => {
    stubber = getRemoteLikeEnvStubber();
    stubber.stub();

    const result = await runCommand('validate ./test/assets/single-bad-resource.yaml');

    expect(result.err).toBe(null);
    expect(result.output).toContain('Validated 1 resources using remote policy');
    expect(result.output).toContain('11 misconfigurations found. (0 errors)');
    expect(result.output).toContain('test/assets/single-bad-resource.yaml');
  });

  it('can validate resources with remote config with -p, -t flag', async () => {
    stubber = getRemoteLikeApiKeyEnvStubber();
    stubber.stub();

    const result = await runCommand('validate ./test/assets/single-bad-resource.yaml -p test-project -t sample-token');

    expect(result.err).toBe(null);
    expect(result.output).toContain('Validated 1 resources using remote policy');
    expect(result.output).toContain('11 misconfigurations found. (0 errors)');
    expect(result.output).toContain('test/assets/single-bad-resource.yaml');
  });

  it('can validate resources with remote or local config when -p, -t and -c flags passed (remote)', async () => {
    stubber = getRemoteLikeApiKeyEnvStubber();
    stubber.stub();

    const result = await runCommand('validate ./test/assets/single-bad-resource.yaml --project test-project --api-token sample-token --config ./monokle.full-validation.yaml');

    expect(result.err).toBe(null);
    expect(result.output).toContain('Validated 1 resources using remote policy');
    expect(result.output).toContain('11 misconfigurations found. (0 errors)');
    expect(result.output).toContain('test/assets/single-bad-resource.yaml');
  });

  it('can validate resources with remote or local config when -p, -t and -c flags passed (local)', async () => {
    stubber = getRemoteLikeApiKeyEnvStubber(true);
    stubber.stub();

    const result = await runCommand('validate ./test/assets/single-bad-resource.yaml -p test-project -t sample-token -c ./monokle.full-validation.yaml');

    expect(result.err).toBe(null);
    expect(result.output).toContain('Validated 1 resources using local policy');
    expect(result.output).toContain('12 misconfigurations found. (0 errors)');
    expect(result.output).toContain('test/assets/single-bad-resource.yaml');
  });

  it('warns on -p and no token flag', async () => {
    const result = await runCommand('validate ./test/assets/single-bad-resource.yaml -p non-existent');

    expect(result.err instanceof InvalidArgument).toBe(true);
  });

  it('warns on -t and no project flag', async () => {
    const result = await runCommand('validate ./test/assets/single-bad-resource.yaml -t sample-token');

    expect(result.err instanceof InvalidArgument).toBe(true);
  });

  it('throws on -p -t and no project', async () => {
    stubber = getRemoteLikeEnvStubber(true);
    stubber.stub();

    const result = await runCommand('validate ./test/assets/single-bad-resource.yaml -p non-existent -t fake-token');

    expect(result.err.message).toContain('Error when synchronizing policy');
  });

  it('throws on -c and no file', async () => {
    const result = await runCommand('validate ./test/assets/single-bad-resource.yaml -c non-existent.yaml');

    expect(result.err.message).toContain('Config file non-existent.yaml not found');
  });


  it('throws on -p -t -c and no project and file', async () => {
    stubber = getRemoteLikeEnvStubber(true);
    stubber.stub();

    const result = await runCommand('validate ./test/assets/single-bad-resource.yaml -p test-project -t sample-token -c non-existent.yaml');

    expect(result.err.message).toContain('Error when reading policy');
  });
});
