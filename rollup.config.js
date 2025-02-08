import path from 'path';
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import strip from '@rollup/plugin-strip';
import terser from "@rollup/plugin-terser";
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const ROOT_DIR = __dirname;
const BANNER = `/** GIFrame.js v${pkg.version}, repo: https://github.com/alienzhou/giframe, MIT licence */`;

export default [{
    input: path.resolve(ROOT_DIR, 'src', 'giframe.ts'),
    plugins: [
        typescript({
            tsconfigOverride: {
                compilerOptions: {
                    module: 'ES2020',
                    moduleResolution: 'Node',
                    target: 'ES5'
                }
            }
        }),
        nodeResolve({
            mainFields: ['module', 'main'],
            browser: true
        }),
        commonjs(),
        strip(),
        babel({
            babelHelpers: 'runtime',
            extensions: ['.ts']
        }),
        terser({
            format: {
                comments: /GIFrame.js/,
            }
        })
    ],
    output: [{
        file: pkg.browser,
        format: 'umd',
        name: 'GIFrame',
        sourcemap: true,
        banner: BANNER,
        globals: {
            window: 'window'
        }
    }]
}, {
    input: path.resolve(ROOT_DIR, 'src', 'giframe.ts'),
    plugins: [
        typescript({
            tsconfigOverride: {
                compilerOptions: {
                    module: 'ES2020',
                    moduleResolution: 'Node'
                }
            }
        }),
        nodeResolve({
            mainFields: ['module', 'main'],
            browser: true
        }),
        commonjs(),
        strip(),
        terser({
            compress: false,
            mangle: false,
            module: true,
            format: {
                beautify: true,
                comments: /GIFrame.js/,
                braces: true
            }
        })
    ],
    output: [{
        file: pkg.module,
        format: 'esm',
        name: 'GIFrame',
        banner: BANNER,
        sourcemap: true
    }]
}];