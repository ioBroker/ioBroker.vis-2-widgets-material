const makeFederation = require('@iobroker/vis-2-widgets-react-dev/modulefederation.config');

module.exports = makeFederation(
    'vis2materialWidgets',
    {
        './Thermostat': './src/Thermostat',
        './Actual': './src/Actual',
        './Static': './src/Static',
        './Switches': './src/Switches',
        './SimpleState': './src/SimpleState',
        './Clock': './src/Clock',
        './ViewInWidget': './src/ViewInWidget',
        './ViewsNavigator': './src/ViewsNavigator',
    }
);