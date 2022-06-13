import { defineConfig } from 'vite';
import federation from '@originjs/vite-plugin-federation';
import commonjs from '@rollup/plugin-commonjs'
import svgr from '@honkhonk/vite-plugin-svgr';
import { viteCommonjs, esbuildCommonjs } from '@originjs/vite-plugin-commonjs';

import { dependencies } from './package.json';

function renderChunks(deps) {
    const chunks = {};
    Object.keys(deps).forEach(key => {
        if (['react', 'react-dom', 'react-circular-slider-svg', 'echarts-for-react'].includes(key)) return;
        chunks[key] = [key];
    });
    return chunks;
}

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        // react(),
        svgr(),
        federation({
            filename: 'customWidgets.js',
            exposes: {
                './MaterialDemo': './src/Thermostat.jsx',
            },
            shared: {
                react: {},
                '@mui/material': {},
                '@mui/icons-material': {},
                'react-dom': {},
                'prop-types': {},
                '@iobroker/adapter-react-v5': {},
                '@mui/styles': {},
                'react-ace': {},
                './src/visRxWidget.jsx': {
                    packageName: 'visRxWidget',
                },
            },
        }),
    ],
    build: {
        target: 'esnext',
        minify: false,
        cssCodeSplit: true,
        // rollupOptions: {
        //     output: {
        //         manualChunks: {
        //             vendor: ['react', 'react-dom', 'react-circular-slider-svg', 'echarts-for-react'],
        //             ...renderChunks(dependencies),
        //         },
        //     },
        // },
        // rollupOptions: {
        //   output: {
        //     // format: 'esm',
        //     dir: 'dist',
        //     minifyInternalExports: false
        //   }
        // },
        sourcemap: true, // 'inline'
    },

});
