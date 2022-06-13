const path = require('path');

const { ModuleFederationPlugin } = require('webpack').container;

/** @type {import('webpack').Configuration} */
module.exports = {
    resolve: {
        extensions: ['.js', '.jsx'],
    },
    entry: './src/main.jsx',
    mode: 'development',
    target: 'es2020',
    devtool: false,
    experiments: {
        outputModule: true,
    },
    output: {
        // libraryTarget: 'var',
        libraryExport: 'main',
        publicPath: 'http://localhost:3000/',
    },
    optimization: {
    // minimize: true,
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                options: {
                    presets: ['@babel/preset-react'],
                },
            },
            {
                test: /\.txt$/i,
                use: 'raw-loader',
            },
            {
                test: /\.svg$/,
                loader: 'svg-inline-loader',
            },
        ],
    },
    // externals: ["react", "react-dom"],
    plugins: [
        new ModuleFederationPlugin({
            name: 'MaterialDemo',
            library: { type: 'module' },
            filename: 'customWidgets.js',
            exposes: {
                './MaterialDemo': './src/Thermostat.jsx',
            },
            shared: {
                react: {},
                '@mui/material': {},
                '@mui/icons-material': {},
                'react-dom': {},
                'prop-types': {},
                '@iobroker/adapter-react-v5': {},
                '@mui/styles': {},
                'react-ace': {},
                './src/visRxWidget.jsx': {
                    packageName: 'visRxWidget',
                },
            },
        }),
    ],
    devServer: {
        static: {
            directory: path.join(__dirname),
        },
        port: 3000,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers':
        'X-Requested-With, content-type, Authorization',
        },
    },
};
