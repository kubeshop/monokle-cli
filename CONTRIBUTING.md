# Contributing

## Development

First build the CLI

```bash
npm run build
```

Then alias the CLI once per session

```bash
alias monokle="${PWD}/build/main.js"
```

Finally you can simply execute the CLI:

```bash
monokle validate test
```

Often it's easy to combine them as follows:

```bash
npm -s run build && monokle validate test
```

Or run it somewhere else:

```bash
cd ~/code/monokle-demo
kustomize build kustomize-happy-cms/overlays/local | monokle validate -
```

note: Development on Windows might need some adjustments.
note: Programmatic tests should be added in the future.

## Publication

Create both a build and a distribution by executing:

```
npm run dist
```

note: `/build` contains JavaScript output, `/dist` contains an executable binary.
note: Our dist tool `caxa` does not make cross-platform builds. We should look into GitHub Actions or wait until vercel/pkg v6 is released.

Publish on NPM

```bash
npm publish --access public
```

Publish on Brew

```

```

note: distribution of Linux and Windows executables is still missing. For now they should use the NPM package with their local NodeJs.
