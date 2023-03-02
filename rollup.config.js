import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import pkg from './package.json' assert { type: 'json' };

export default {
  input: pkg.bin.monokle,
  output: {
    file: 'cjs/main.cjs',
    format: 'cjs',
    inlineDynamicImports: true,
  },
  plugins: [
    json(),
    commonjs(),
    nodeResolve({
      exportConditions: ['node'],
      browser: false,
      preferBuiltins: true,
    }),
  ]
};
