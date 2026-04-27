// @ts-expect-error no types
import react from '@vitejs/plugin-react';
import commonjs from 'vite-plugin-commonjs';
import vitetsConfigPaths from 'vite-tsconfig-paths';
import { federation } from '@module-federation/vite';
import topLevelAwait from 'vite-plugin-top-level-await';

const singleton = (
    extra: Record<string, unknown> = {},
): {
    singleton: true;
    requiredVersion: '*';
} & Record<string, unknown> => ({
    singleton: true,
    requiredVersion: '*',
    ...extra,
});

const sharedModules: Record<string, ReturnType<typeof singleton>> = {
    react: singleton(),
    'react-dom': singleton(),
    'react-dom/client': singleton(),
    '@mui/material': singleton(),
    '@mui/icons-material': singleton(),
    '@mui/styles': singleton(),
    '@mui/system': singleton(),
    'prop-types': singleton(),
    '@iobroker/adapter-react-v5': singleton(),
    '@iobroker/adapter-react-v5/i18n/de.json': singleton(),
    '@iobroker/adapter-react-v5/i18n/en.json': singleton(),
    '@iobroker/adapter-react-v5/i18n/es.json': singleton(),
    '@iobroker/adapter-react-v5/i18n/ru.json': singleton(),
    '@iobroker/adapter-react-v5/i18n/nl.json': singleton(),
    '@iobroker/adapter-react-v5/i18n/it.json': singleton(),
    '@iobroker/adapter-react-v5/i18n/pl.json': singleton(),
    '@iobroker/adapter-react-v5/i18n/pt.json': singleton(),
    '@iobroker/adapter-react-v5/i18n/fr.json': singleton(),
    '@iobroker/adapter-react-v5/i18n/uk.json': singleton(),
    '@iobroker/adapter-react-v5/i18n/zh-cn.json': singleton(),
};

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
            shared: sharedModules,
            dts: false,
        }),
        topLevelAwait({
            // The export name of top-level awaits promise for each chunk module
            promiseExportName: '__tla',
            // The function to generate import names of top-level awaits promise in each chunk module
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
    resolve: {
        dedupe: [
            'react',
            'react-dom',
            'prop-types',
            '@mui/material',
            '@mui/system',
            '@mui/styles',
            '@mui/icons-material',
            '@iobroker/adapter-react-v5',
        ],
    },
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
