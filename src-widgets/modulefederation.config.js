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
    name: 'vis2materialWidgets',
    filename: 'customWidgets.js',
    exposes: {
//        './Thermostat': './src/Thermostat',
        './Actual': './src/Actual',
        './Static': './src/Static',
        './Switches': './src/Switches',
    },
    shared:
        makeShared([
            'react',
            'react-dom',
            'react-dom/client',
            'clsx',
            '@mui/material',
            '@mui/styles',
            '@mui/material/styles',
            '@mui/icons-material',
            'prop-types',
            '@iobroker/adapter-react-v5',
            '@iobroker/vis-widgets-react-dev',
        ]),
};
