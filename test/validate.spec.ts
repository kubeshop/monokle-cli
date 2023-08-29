import { it, expect } from 'vitest';
import { describe } from './describe.js';

describe('Validate command', (runCommand) => {
  it('can validate single resource file', async () => {
    const result = await runCommand('validate ./test/assets/single-bad-resource.yaml');

    expect(result.err).toBe(null);
    expect(result.output).toContain('12 misconfigurations found. (3 errors)');
    expect(result.output).toContain('test/assets/single-bad-resource.yaml');
  });

  it('can validate resources in a folder', async () => {
    const result = await runCommand('validate ./test/assets');

    expect(result.err).toBe(null);
    expect(result.output).toContain('26 misconfigurations found. (6 errors)');
    expect(result.output).toContain('test/assets/multiple-bad-resources.yaml');
    expect(result.output).toContain('test/assets/single-bad-resource.yaml');
  });

  // @TODO: Fix stdin test
  // it('can validate resources from stdin', async () => {
  //   const result = await runCommand('validate -');

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
    expect(result.output).toContain('1 misconfigurations found. (0 errors)');
    expect(result.output).toContain('Check that ArgoCD ConfigMaps');
  });
});
