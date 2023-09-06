# @monokle/cli

## 0.5.1

### Patch Changes

- Corrected links in `package.json` and `README.md` files.

## 0.5.0

### Major Changes

- Introduced integration with [Monokle Cloud](https://app.monokle.com/):
  - Introduced `monokle login` command.
  - Introduced `monokle logout` command.
  - Introduced `monokle whoami` command.
  - Introduced `--api-token` (`-t`) argument for `monokle validate` and `monokle login` commands to authenticate easily in CI/CD scenarios.
- Introduced `monokle init` command to allow easy bootstrapping of local config [#4](https://github.com/kubeshop/monokle-cli/issues/4).
- Introduced `monokle config show` command to preview configuration used for validation.

### Minor Changes

- Renamed alias for `--framework` argument from `--fw` to `-f` [#14](https://github.com/kubeshop/monokle-cli/issues/14).

### Patch Changes

- Updated dependencies.

## 0.3.0

### Minor Changes

- 521529e: Improved resource-links validator to support optional links + bug-fixes in YAML and OPA validators

### Patch Changes

- Updated dependencies [034573b]
- Updated dependencies [521529e]
  - @monokle/validation@0.10.0

## 0.2.0

### Minor Changes

- a5e826e: Add inventory flag to monokle validate
