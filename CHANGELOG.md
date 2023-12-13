# @monokle/cli

## 0.8.4

### Patch changes

- Fixed invalid YAMLs handling.

## 0.8.3

### Patch changes

- Fixed origin URL normalization to use `https` as default protocol.
- Improved error messaging related to failed origin configuration fetch attempts.

## 0.8.2

- Monokle CLI will use dynamic origin for Schemas Store to download resource schemas for validation with **Kubernetes Schema** plugin.

## 0.8.1

### Patch changes

- It is now allowed to use `--project` flag without Automation Token when logged in.

## 0.8.0

### Minor Changes

- Improved `login` command to allow authenticating with Monokle Enterprise instances.
- Introduced `--origin` flag allowing to authenticate and use policies from Monokle Enterprise instances.

## 0.7.3

### Minor Changes

- Improved error messages when invalid Automation Token or Project Id passed to `validate` or `config` command.

### Patch Changes

- Fixed suppressions fetching from Monokle Cloud.
- Fixed `--version` command when CLI installed with brew.

## 0.7.1, 0.7.2

### Patch Changes

- Minor bugfixes and polishing.

## 0.7.0

### Minor Changes

- Improved automation usage by adding flags to change exit codes: `--force` and `--max-warnings`.
- Improved error handling by displaying known problems prettier and hiding unexpected ones. Added a `--debug` flag to unveil the stack trace of errors.

### Patch Changes

- Fixed `--output sarif` to include logs which prevents it to be piped to other commands.
- Fixed `init` for with security frameworks due to incorrectly tree-shaken modules.

## 0.6.0

### Minor Changes

- Introduced support for suppressions. Suppression are now shown in `validate` command output when `--show-suppressed` (`-s`) flag is passed.

### Patch Changes

- Fixed Automation token broken authorization flow - [#25](https://github.com/kubeshop/monokle-cli/issues/25).
- Fixed Helm template files parsing which resulted in warnings cluttering commands output - [#24](https://github.com/kubeshop/monokle-cli/issues/24).

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
