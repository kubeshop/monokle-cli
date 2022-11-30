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

## Manual publication

_note: ideally you use changeset to release this. These steps are as a backup._

First bump the version manually in package.json.

```
vim packages/cli/package.json
```

Then create a build (i.e. JavaScript) **at the root of the repository:**

```
npm install && npm run build
```

**Publish on NPM**

```bash
cd packages/cli
npm publish --access public
```

**Publish on Brew**

1. You will need to create a distribution from the build (i.e. a executable binary):

```
cd packages/cli
npm run dist
```

note: Our dist tool `caxa` does not make cross-platform builds. We should look into GitHub Actions or wait until vercel/pkg v6 is released.

1. Aftewards prepare a TAR archive:

```
cd dist
tar -czf monokle.tar.gz monokle
```

2. Then generate the binary's SHA, you will need it in a bit:

```
shasum -a 256 monokle.tar.gz
```

1. Now create a GitHub Release with the TAR archive as attached binary.

2. Finally you go to kubeshop/homebrew-monokle repository and update Formula/monokle-cli.rb with the new `url`, `sha256` and `version`.

note: distribution of Linux and Windows executables is still missing. For now they should use the NPM package with their local NodeJs.
