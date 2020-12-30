const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const terserPlugin = require('terser-webpack-plugin');
const uglifyJsPlugin = require('uglifyjs-webpack-plugin');
const dotEnvPlugin = require('dotenv-webpack');
const path = require('path');

module.exports = {
    entry: ['./src/main.ts'],
    mode: 'development',
    watchOptions: {
        aggregateTimeout: 200,
        poll: 1000,
        ignored: ['test/**.ts', 'node_modules/**']
    },
    devtool: 'inline-source-map',
    resolve: {
        extensions: ['.ts', '.js', '.jade']
    },
    target: 'node',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'main.js',
    },
    externals: [
        nodeExternals(),
    ],
    module: {
        rules: [
            {
                test: /.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.handlebars$/,
                loader: 'handlebars-loader',
                options: {
                    knownHelpersOnly: false,
                    inlineRequires: /\/assets\/(:?images|audio|video)\//ig,
                    partialDirs: [path.join(__dirname, './src/views/email/partials')],
                },
            }
        ]
    },
    plugins: [
        new webpack.EvalSourceMapDevToolPlugin({
            filename: '[name].js.map',
        }),
        new dotEnvPlugin({
            path: './config/development/.env',
            safe: true,
            systemvars: true,
            silent: true,
            defaults: false
        }), new webpack.DefinePlugin({
            'process.env.NODE_ENV': 'dev',
            'process.env.DEBUG': 'debug'
        })
    ],
};