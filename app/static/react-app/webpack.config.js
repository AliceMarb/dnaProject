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
        // './kern-dna-synth.css',
        './components.css',
        './normalize.css',
    ],
    output: {
        path: path.join(__dirname,'/dist'),
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
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                // loaders: [
                //   'file-loader',
                //   'image-webpack-loader',
                //   'url-loader',
                // ],
                loaders: 'file-loader?name=static/react-app/dist/[name].[ext]',
                include: [path.join(__dirname, 'public', 'images')],
                // options: {
                //     name: '[path][name].[ext]',
                // },
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
