const makeShared = pkgs => {
    const result = {};
    pkgs.forEach(
        packageName => {
            result[packageName] = {
                requiredVersion: '*',
                singleton: true,
            };
        },
    );
    return result;
};

module.exports = {
    name: 'Thermostat',
    // library: { type: 'module' },
    // library: { type: 'var', name: 'MaterialDemo' },
    filename: 'customWidgets.js',
    exposes: {
        './Thermostat': './src/Thermostat',
        './Actual': './src/Actual',
        './Static': './src/Static',
        './Switches': './src/Switches',
    },
    shared:
        makeShared([
            'react', 'react-dom', '@mui/material', '@mui/styles', '@mui/icons-material', 'prop-types', '@iobroker/adapter-react-v5', 'react-ace',
        ]),
    // shared: {
    // react: {singleton: true,
    //     eager: true,
    //     requiredVersion: deps.react},
    // 'react-dom': {singleton: true,
    //     requiredVersion: deps.react['react-dom']},
    // '@mui/material': {singleton: true},
    // '@mui/icons-material': {singleton: true},
    // 'prop-types': {singleton: true},
    // '@iobroker/adapter-react-v5': {singleton: true},
    // '@mui/styles': {singleton: true},
    // 'react-ace': {singleton: true},
    // }
    // './src/visRxWidget.jsx': {
    //     packageName: 'visRxWidget',
    // },
};
