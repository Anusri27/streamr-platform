/* eslint-disable global-require */
const webpack = require('webpack')

module.exports = {
    plugins: [
        require('postcss-import')({
            addDependencyTo: webpack,
        }),
        require('postcss-cssnext')({
            features: {
                // causes some issue in chrome.
                // modern browsers support this anyway
                filter: false,
            },
        }),
        require('postcss-math'),
        require('precss'),
        require('postcss-nested'),
        require('postcss-color-function'),
        require('css-mqpacker'),
        require('postcss-extend'),
        require('@streamr/streamr-layout/postcss-variables'),
    ],
}
