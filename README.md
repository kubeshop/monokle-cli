<p align="center">
  <img src="docs/images/large-icon-256.png" alt="Monokle Logo" width="128" height="128"/>
</p>

<p align="center">
  <a href="https://github.com/kubeshop/monokle-core/tree/main/packages/validation">
    <img title="mit licence" src="https://img.shields.io/badge/License-MIT-yellow.svg"/>
  </a>
</p>

# Welcome to Monokle CLI

Monokle CLI is a command-line interface for static analysis of Kubernetes resources.

Use it to prevent misconfigurations within Kustomize, Helm or default Kubernetes resources. The output is available as a SARIF file 
which you can upload to GitHub CodeScan.

Monokle CLI includes [core validators][core-validators] for
- Kubernetes Pod Security Standards
- JSON Schemas and Kubernetes version compliance
- Links between Kubernetes resources
- Resource metadata
- Common practices
- Security policies - using OPA

Under the hood it uses [@monokle/validation][monokle-validation] which allows you to configure validation rules extensively.

Check out the [announcement blog-post](https://monokle.io/blog/monokle-cli-flexible-kubernetes-yaml-validation) for an overview of all features.

## Table of contents

- [Installation](#installation)
- [Usage](#usage)
  - [Validate a YAML file](#validate-a-yaml-file)
  - [Validate a directory](#validate-a-directory)
  - [Validate a templated Helm chart](#validate-a-templated-helm-chart)
  - [Validate a Kustomize build](#validate-a-kustomize-build)
  - [Frameworks](#frameworks)
  - [Generate SARIF analysis](#generate-sarif-analysis)
- [Configuration](#configuration)
  - [Command-line arguments](#command-line-arguments)
  - [@monokle/validation rules](#monoklevalidation-rules)
  - [Custom validators](#custom-validators)
- [GitHub Action](#github-action)
- [Docker](#docker)

## Installation

You can install the CLI using brew (if you're on MacOS) 

```bash
brew install kubeshop/monokle/monokle-cli
```

or as an NPM package (more installers coming up...) 

```bash
npm install --global @monokle/cli
```
(We recommend using the LTS NodeJs version)

or using the Docker Image - [see below](#docker)

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

### Frameworks
Monokle CLI supports predefined sets of rules called frameworks, which allow you to quickly run Monokle validation without the need for additional configuration.  
By using a framework, you can easily perform comprehensive validations based on established best practices and industry standards.  

When using a framework, you don't have to configure the `monokle.validation.yaml` file manually.  
Simply specify the desired framework using the `--framework` or `--fw` CLI arguments, and Monokle CLI will automatically apply the corresponding set of rules.  

Available frameworks:

- `pss-restricted`
- `pss-baseline`
- `nsa`

Using frameworks is an excellent way to get started quickly with Monokle CLI and perform comprehensive validations without the need for extensive configuration.  
If you prefer a more customized validation, you can still configure the `monokle.validation.yaml` file with your own rules.  

Here's an example of how to use the `--framework` argument:

```bash
monokle validate k8s-dir --framework pss-restricted
```

### Generate SARIF analysis

The Monokle CLI can output its results in [SARIF format](https://sarifweb.azurewebsites.net/).

```bash
monokle validate --output sarif k8s-dir > results.sarif
```

Afterward you could use [VSC's SARIF Viewer][vsc-sarif] or other tools to inspect the results.

## Configuration

### Command-line arguments

You can use `--help` to access help information directly from the CLI.

### @monokle/validation rules

The Monokle CLI looks for a Monokle Validation configuration file 
at `./monokle.validation.yaml`. You can change this by using the `--config` flag.

All rules are enabled by default and are described in the [Monokle Validation configuration][monokle-validation-docs] documentation.

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

It is easy to extend the Monokle CLI with [custom validators][custom-validators] that can be shared with others using
our [Monokle Community Plugins][monokle-community-plugins] repository. 

## GitHub Action

The [Monokle GitHub Action](https://github.com/marketplace/actions/monokle-validation) can be used to validate your resources as part of your CI/CD pipelines
on GitHub

## Docker

You can use the Docker image `monokle-cli:latest` to run the Monokle CLI in a containerized environment.  
This can be particularly useful for integrating Monokle into CI/CD pipelines or other automated systems.

To run the Docker image, you can use the `docker run` command. 
The Monokle CLI arguments can be passed directly to the Docker run command. 
For example:
```
docker run -v /path/to/input:/input -e CONFIG_FILE=my-validation-config.yaml monokle-cli:latest validate /input
```

In this command:
  - `-v /path/to/input:/input` mounts a directory from your host system to the /input directory inside the Docker container.
  - `-e CONFIG_FILE=my-validation-config.yaml` sets an environment variable inside the Docker container. If this environment variable is set, the Docker container will use the specified file as the Monokle validation configuration.
  - `validate /input` is the command that will be passed to the Monokle CLI. You can replace this with any command you want to run with the Monokle CLI.

[core-validators]: https://github.com/kubeshop/monokle-core/blob/main/packages/validation/docs/core-plugins.md
[custom-validators]: https://github.com/kubeshop/monokle-core/blob/main/packages/validation/docs/custom-plugins.md
[monokle-community-plugins]: https://github.com/kubeshop/monokle-community-plugins
[monokle-validation]: https://github.com/kubeshop/monokle-core/tree/main/packages/validation
[monokle-validation-docs]: https://github.com/kubeshop/monokle-core/blob/main/packages/validation/docs/configuration.md
[vsc-sarif]: https://marketplace.visualstudio.com/items?itemName=MS-SarifVSCode.sarif-viewer
