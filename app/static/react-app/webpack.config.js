const NodemonPlugin = require('nodemon-webpack-plugin')
const path = require('path');

const webpack = require('webpack');
const {
    SourceMapDevToolPlugin
} = require("webpack");

const config = {
    // plugins: [new NodemonPlugin()],
    // plugins: [
    //     // implicit globals
    //     new webpack.ProvidePlugin({
    //       jQuery: 'jquery',
    //       $: 'jquery',
    //       'window.jQuery': 'jquery'
    //     })
    // ],
    context: path.join(__dirname, 'scripts'),
    entry: [
        './index.js',
        './style.css',
        // './kern-dna-synth.css',
        './components.css',
        './normalize.css',
    ],
    output: {
        path: path.join(__dirname, '/dist'),
        publicPath: "/",
        filename: 'bundle.js',
        sourceMapFilename: "bundle.js.map"
    },
    resolve: {
        extensions: ['.js', '.jsx', '.css'],
    },
    // devServer:{
    //     watchContentBase: true,
    //     publicPath: '/assets/'
    // },
    watch: true,
    module: {
        rules: [{
                test: /\.(js|jsx)?/,
                exclude: /node_modules/,
                use: ['source-map-loader', 'babel-loader']
            },
            {
                test: /\.css$/,
                // exclude: /node_modules/,
                use: ["style-loader", "css-loader"],
                // loader: "style-loader!css-loader",  
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                // loaders: [
                //   'file-loader',
                //   'image-webpack-loader',
                //   'url-loader',
                // ],
                // use: ["file-loader?name=[name].[ext]"], 
                loaders: "file-loader?name=[name].[ext]",
                // include: [path.join(__dirname, 'public', 'images')],
                options: {
                    publicPath: '/static/react-app/dist',
                },
            },
            {
                test: /\.(sass|scss)$/,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'sass-loader',
                        options: {
                            sassOptions: {
                                includePaths: [path.resolve(__dirname, 'node_modules')],
                            }
                        },
                    },
                ],
            },
            // {
            //     test: /\.css$/,
            //     use: getStyleLoaders({
            //       importLoaders: 1,
            //       sourceMap: isEnvProduction
            //           ? shouldUseSourceMap
            //           : isEnvDevelopment,
            //       modules: {
            //         getLocalIdent: getCSSModuleLocalIdent,
            //         localIdentName: '[name]__[local]__[hash:base64:5]'
            //       }

            //     }),
            //     sideEffects: true,
            //   }, 
            // {
            //     test: /\.css$/,
            //     include: /stylesheets|node_modules/,
            //     use: ["style-loader", "css-loader"]
            // },       
        ],
    }
};

module.exports = config;