const makeFederation = require('@iobroker/vis-2-widgets-react-dev/modulefederation.config');

module.exports = makeFederation(
    'vis2materialWidgets',
    {
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
        './translations': './src/translations',
    }
);