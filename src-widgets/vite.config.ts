import { readFileSync } from 'node:fs';
import { defineVisWidgetConfig } from '@iobroker/types-vis-2/defineVisWidgetConfig';

const pack = JSON.parse(readFileSync('./package.json').toString());

export default defineVisWidgetConfig({
    name: 'vis2materialWidgets',
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
    pack,
    devServerPort: 4173,
});
