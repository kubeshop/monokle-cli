<p align="center">
  <img src="docs/images/large-icon-256.png" alt="Monokle Logo" width="128" height="128"/>
</p>

<p align="center">
<a href="https://github.com/features/actions">Monokle CLI</a>
for <a href="">static Kubernetes analysis</a>
</p>

<p align="center">
  <a href="https://github.com/kubeshop/monokle-core/tree/main/packages/validation">
    <img title="mit licence" src="https://img.shields.io/badge/License-MIT-yellow.svg"/>
  </a>
</p>

## Welcome to Monokle CLI

Monokle CLI is a command-line interface for static analysis of Kubernetes resources.

Use it to prevent misconfigurations within Kustomize, Helm or default Kubernetes resources. The output is available as a SARIF file which you can upload to GitHub CodeScan.

Monokle CLI includes built-in validators for
- YAML Syntax
- Kubernetes Schema compliance
- Resource links between Kubernetes resources
- OPA Security policies

Under the hood it uses [@monokle/validation][monokle-validation] which allows you to configure validation rules extensively.

## Table of content

- [Welcome to Monokle CLI](#welcome-to-monokle-cli)
- [Table of content](#table-of-content)
- [Installation](#installation)
- [Usage](#usage)
  - [Validate a YAML file](#validate-a-yaml-file)
  - [Validate a directory](#validate-a-directory)
  - [Validate a templated Helm chart](#validate-a-templated-helm-chart)
  - [Validate a Kustomize build](#validate-a-kustomize-build)
  - [Validate as SARIF analysis](#validate-as-sarif-analysis)
- [Configuration](#configuration)
  - [Command-line arguments](#command-line-arguments)
  - [@monokle/validation rules](#monoklevalidation-rules)
  - [Custom validators](#custom-validators)
- [GitHub Action](#github-action)

## Installation

You can install the CLI as an NPM package (more installers coming up soon!).

```bash
npm install --global @monokle/cli
```

We recommend using the LTS NodeJs version.

## Usage

Once installed, using the CLI is straight-forward.

### Validate a YAML file

```bash
monokle validate bundle.yaml
```

### Validate a directory

This will recursively scan all YAML files and parse them as plain Kubernetes resources.

```bash
monokle validate k8s-dir
```

### Validate a templated Helm chart

```bash
helm template helm-dir | monokle validate -
```

### Validate a Kustomize build

```bash
kustomize build kustomize-dir/overlays/local | monokle validate -
```

### Generate SARIF analysis

The Monokle CLI can output its results in [SARIF format](https://sarifweb.azurewebsites.net/).

```bash
monokle validate --output sarif k8s-dir > results.sarif
```

Afterwards you could use [VSC's SARIF Viewer][vsc-sarif] or other tools to inspect the results.

## Configuration

### Command-line arguments

You can use `--help` to access help information directly from the CLI.

### @monokle/validation rules

The Monokle CLI looks for a Monokle Validation configuration file 
at `./monokle.validation.yaml`. You can change this by using the `--config` flag.

All rules are enabled by default and are  
described in the [Monokle Validation configuration][monokle-validation-docs] documentation.

**Example**

```yaml
plugins:
  yaml-syntax: true
  kubernetes-schema: true
rules:
  yaml-syntax/no-bad-alias: "warn"
  yaml-syntax/no-bad-directive: false
  open-policy-agent/no-last-image: "err"
  open-policy-agent/cpu-limit: "err"
  open-policy-agent/memory-limit: "err"
  open-policy-agent/memory-request: "err"
settings:
  kubernetes-schema:
    schemaVersion: v1.24.2
```

### Custom validators

It is easy to extend the Monokle CLI with custom validators that can be shared with others using
our [Monokle Community Plugins][monokle-community-plugins] repository. 

## GitHub Action

The [Monokle GitHub Action](https://github.com/marketplace/actions/monokle-validation) can be used to validate your resources as part of your CI/CD pipelines
on GitHub

[monokle-community-plugins]: https://github.com/kubeshop/monokle-community-plugins
[monokle-validation]: https://github.com/kubeshop/monokle-core/tree/main/packages/validation
[monokle-validation-docs]: https://github.com/kubeshop/monokle-core/blob/main/packages/validation/docs/configuration.md
[vsc-sarif]: https://marketplace.visualstudio.com/items?itemName=MS-SarifVSCode.sarif-viewer
