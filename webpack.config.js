var webpack = require('webpack');

module.exports = {
    devtool: '@#source-map',

    entry: {
        'app': ['./frontend/app.js'],
    },

    output: {
        path: './public',
        filename: '[name].js',
        publicPath: '/'
    },

    module: {
        loaders: [{
            test: /\.js$/,
            loader: 'babel',
            exclude: /node_modules/,
            query: {
                cacheDirectory: true,
                presets: ['react', 'es2015'],
                plugins: [
                    'transform-object-rest-spread',
                    ['babel-plugin-module-alias', [
                        {src: './frontend', expose: '@jeny'}
                    ]]
                ]
            }
        }]
    },

    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
            }
        })
    ]
};
