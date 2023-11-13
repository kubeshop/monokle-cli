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

## Releasing

Most of the release process is done automatically through GitHub CI. However it requires few manual steps:

1. Make sure you are on `master` branch and have latest changes and no local modifications:

```bash
git checkout master
git fetch --all
git reset --hard origin/master
```

2. Update `CHANGELOG.md` file with release info (if needed) and push to `master` branch.

3. Run `npm version [patch|minor|major]` to bump package version and push (`master` and tag) to remote:

```bash
npm version patch
git push origin master
git push origin vA.B.C
```

Pushing a tag to remote triggers release process (see `release.yml` workflow file), which publishes
CLI to npm, homebrew and creates GitHub release.

You can verify the release by:

* Looking on the [package NPM page](https://www.npmjs.com/package/@monokle/cli) to see if latest release is there.
* Checking if [Monokle CLI brew](https://github.com/kubeshop/homebrew-monokle) repository was updated.

---
### Manual publication

**IMPORTANT: These steps are just as a backup. You should use automated releasing process!**

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
