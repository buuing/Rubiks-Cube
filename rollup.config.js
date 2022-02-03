import json from '@rollup/plugin-json'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import livereload from 'rollup-plugin-livereload'
import serve from 'rollup-plugin-serve'
import { terser } from 'rollup-plugin-terser'

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/index.js',
      format: 'umd',
      name: 'index',
    },
  ],
  plugins: [
    resolve(),
    commonjs(),
    // json(),
    livereload(),
    serve({
      open: true,
      port: 8000,
      contentBase: './',
      openPage: '/index.html'
    }),
    terser()
  ]
}
