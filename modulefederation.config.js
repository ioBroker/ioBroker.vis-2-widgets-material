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
    filename: 'customWidgets.js',
    exposes: {
        './Thermostat': './src/Thermostat',
        './Actual': './src/Actual',
        './Static': './src/Static',
        './Switches': './src/Switches',
    },
    shared:
        makeShared([
            'react',
            'react-dom',
            '@mui/material',
            '@mui/styles',
            '@mui/icons-material',
            'prop-types',
            '@iobroker/adapter-react-v5',
        ]),
};
