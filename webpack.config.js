const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './index.js',
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js'
    },
    devServer: {
        contentBase: './dist'
    },
    plugins: [
        new CopyPlugin([
            { from: './index.html', to: './' },
            { from: './examples/main-page.html', to: './'},
            { from: './examples/params-page/params-page.html', to: './'}
            // { from: '/style.css', to: './' },
        ]),
    ],
};
