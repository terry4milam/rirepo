const path = require('path');
process.env.VUE_APP_VERSION = require('./package.json').version

module.exports = {
    configureWebpack: {
        devtool: 'source-map',
        resolve: {
            alias: {
                '@': path.join(__dirname, './src')

            },
            extensions: ['.js', '.vue', '.json']
        }
    },
    productionSourceMap: false,
    publicPath: ''
}