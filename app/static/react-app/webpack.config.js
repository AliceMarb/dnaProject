const NodemonPlugin = require('nodemon-webpack-plugin')
const path = require('path');

const webpack = require('webpack');
const { SourceMapDevToolPlugin } = require("webpack");

const config = {
    // plugins: [new NodemonPlugin()],
    context: path.join(__dirname, 'scripts'),
    entry: [
        './index.js',
        './style.css',
    ],
    output: {
        path: path.join(__dirname,'/dist'),
        publicPath: "/",
        filename: 'bundle2.js',
        sourceMapFilename: "bundle2.js.map"
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
        rules: [
            {
            test: /\.(js|jsx)?/,
                exclude: /node_modules/,
                use: ['source-map-loader', 'babel-loader']     
            },
            {
                test:  /\.css$/,
                    // exclude: /node_modules/,
                    use: ["style-loader", "css-loader"],   
                    // loader: "style-loader!css-loader",  
            }
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
