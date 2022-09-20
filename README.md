## Monokle CLI

This CLI is the easiest way to test Monokle validator on a variety of input.

## Building

Go to the root of this project and build the monorepo:

```
npm run build
```

After packages/cli and you can run develop mode.

````
cd packages/cli
```

Finally you can run validation in two ways:

1. Provide a file as input

```
npm -s run dev validate argo/install.yaml
```

2. Pipe stdout

```
helm template demo ./helm-yellow-wordpress | npm -s run dev validate -
```

> Tip: The `-s` flag silences NPM log noise.
````
