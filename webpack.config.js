const path = require('path');

const { ModuleFederationPlugin } = require('webpack').container;
const deps = require("./package.json").devDependencies;

/** @type {import('webpack').Configuration} */
module.exports = {
    resolve: {
        extensions: ['.js', '.jsx'],
    },
    entry: './src/main.jsx',
    devServer: {
        contentBase: path.join(__dirname, "dist"),
        port: 4173
      },
    mode: 'development',
    // target: 'web',
    // devtool: false,
    // experiments: {
    //     outputModule: true,
    // },
    output: {
        // libraryTarget: 'var',
        // libraryExport: 'main',
        publicPath: 'auto',
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
            // library: { type: 'module' },
            library: { type: "var", name: "MaterialDemo" },
            filename: 'customWidgets.js',
            exposes: {
                './MaterialDemo': './src/Thermostat.jsx',
            },
            shared: 
                [
                    'react', 'react-dom', '@mui/material', '@mui/styles', '@mui/icons-material', 'prop-types','@iobroker/adapter-react-v5', 'react-ace'
                ]
                // react: {singleton: true,
                //     requiredVersion: deps.react},
                // 'react-dom': {singleton: true,
                //     requiredVersion: deps.react['react-dom']},
                // '@mui/material': {singleton: true},
                // '@mui/icons-material': {singleton: true},
                // 'prop-types': {singleton: true},
                // '@iobroker/adapter-react-v5': {singleton: true},
                // '@mui/styles': {singleton: true},
                // 'react-ace': {singleton: true},
                // './src/visRxWidget.jsx': {
                //     packageName: 'visRxWidget',
                // },
            
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
