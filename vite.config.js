import { defineConfig } from 'vite';
import federation from '@originjs/vite-plugin-federation';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        // react(),
        federation({
            filename: 'customWidgets.js',
            exposes: {
                './MaterialDemo': './src/MaterialDemo.jsx',
            },
            shared: {
                'react': {},
                '@mui/material': {},
                'react-dom': {},
                'prop-types': {},
                './src/visRxWidget.jsx': {
                    packageName: 'visRxWidget',
                }
            }
        })
    ],
    build: {
        target: 'esnext',
        minify: false,
        cssCodeSplit: true,
        // rollupOptions: {
        //   output: {
        //     // format: 'esm',
        //     dir: 'dist',
        //     minifyInternalExports: false
        //   }
        // },
        sourcemap: true // 'inline'
    }
})
