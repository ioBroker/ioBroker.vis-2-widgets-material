// @ts-expect-error no types
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
import { moduleFederationShared } from '@iobroker/types-vis-2/modulefederation.vis.config';
import { readFileSync } from 'node:fs';
import topLevelAwait from 'vite-plugin-top-level-await';

// The shared modules come from @iobroker/types-vis-2, so they stay in sync with what the vis-2 host provides:
// react, react-dom, the JSX runtime, @emotion/react, @mui/private-theming and @iobroker/gui-components (with
// its i18n files) as singletons, @mui/material, @mui/system and @mui/icons-material versioned by the range in
// package.json. Passing package.json filters the list down to the packages this widget set really depends on.
const pack = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

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
            dts: false,
        }),
        topLevelAwait({
            // The export name of top-level awaits promise for each chunk module
            promiseExportName: '__tla',
            // The function to generate import names of top-level awaits promise in each chunk module
            promiseImportName: (i: number): string => `__tla_${i}`,
        }),
        react(),
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
        tsconfigPaths: true,
        // Same set as the shared modules above: the fallback copies inside the widget bundle must be unique too
        dedupe: ['react', 'react-dom', '@emotion/react', '@mui/material', '@mui/system', '@mui/icons-material'],
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
