'use strict';
import pluginClear from 'rollup-plugin-clear';
import pluginNodeResolve from '@rollup/plugin-node-resolve';
import pluginCommonjs from '@rollup/plugin-commonjs';
import pluginBabel from 'rollup-plugin-babel';
import {terser as pluginTerser} from 'rollup-plugin-terser';
import pkg from './package.json';

export default {
    input: './src/index.js',
    output: [
        {
            file: pkg.module,
            format: 'esm',
            sourcemap: true
        },
        {
            name: 'JDialog',
            file: pkg.main,
            format: 'umd',
            sourcemap: true,
            globals: { vue: 'Vue'}
        }
    ],
    external: ['vue'],
    plugins: [
        pluginClear({ targets: ['dist'] }),
        pluginNodeResolve(),
        pluginCommonjs(),
        pluginBabel({ exclude: 'node_modules/**' }),
        pluginTerser()
    ]
};
