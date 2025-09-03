// @ts-expect-error no types
import react from '@vitejs/plugin-react';
import commonjs from 'vite-plugin-commonjs';
import vitetsConfigPaths from 'vite-tsconfig-paths';
import { federation } from '@module-federation/vite';
import { moduleFederationShared } from '@iobroker/types-vis-2/modulefederation.vis.config';
import { readFileSync } from 'node:fs';
import topLevelAwait from 'vite-plugin-top-level-await';

const pack = JSON.parse(readFileSync('./package.json').toString());

const config = {
    plugins: [
        federation({
            manifest: true,
            name: 'vis2materialWidgets',
            filename: 'customWidgets.js',
            exposes: {
                './Thermostat': './src/Thermostat',
                './Actual': './src/Actual',
                './Switches': './src/Switches',
                './SimpleState': './src/SimpleState',
                './Blinds': './src/Blinds',
                './Clock': './src/Clock',
                './ViewInWidget': './src/ViewInWidget',
                './Camera': './src/Camera',
                './Security': './src/Security',
                './Player': './src/Player',
                './Map': './src/Map',
                './Html': './src/Html',
                './ThemeSwitcher': './src/ThemeSwitcher',
                './WasherDryer': './src/WasherDryer',
                './Wizard': './src/Wizard',
                './RGBLight': './src/RGBLight',
                './Lock': './src/Lock',
                './Vacuum': './src/Vacuum',
                './Navigate': './src/Navigate',
                './translations': './src/translations.js',
            },
            remotes: {},
            shared: moduleFederationShared(pack),
        }),
        topLevelAwait({
            // The export name of top-level await promise for each chunk module
            promiseExportName: '__tla',
            // The function to generate import names of top-level await promise in each chunk module
            promiseImportName: (i: number): string => `__tla_${i}`,
        }),
        react(),
        vitetsConfigPaths(),
        commonjs(),
    ],
    server: {
        port: 3000,
        proxy: {
            '/_socket': 'http://localhost:8082',
            '/vis.0': 'http://localhost:8082',
            '/adapter': 'http://localhost:8082',
            '/habpanel': 'http://localhost:8082',
            '/vis': 'http://localhost:8082',
            '/widgets': 'http://localhost:8082/vis',
            '/widgets.html': 'http://localhost:8082/vis',
            '/web': 'http://localhost:8082',
            '/state': 'http://localhost:8082',
        },
    },
    base: './',
    build: {
        target: 'chrome81',
        outDir: './build',
        rollupOptions: {
            onwarn(warning: { code: string }, warn: (warning: { code: string }) => void): void {
                // Suppress "Module level directives cause errors when bundled" warnings
                if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
                    return;
                }
                warn(warning);
            },
        },
    },
};

export default config;
