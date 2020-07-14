'use strict';
const webpackConfig = require('./webpack.config.js');

module.exports = function (config) {
    const options = {
        frameworks: ['mocha', 'chai'],
        reporters: ['mocha'],
        port: 4096,
        logLevel: config.LOG_INFO,
        browsers: ['ChromeHeadless'],
        autoWatch: false,
        singleRun: true,
        concurrency: Infinity,
        files: [
            './**/*.spec.js'],
        preprocessors: {
            './**/*.spec.js': ['webpack']
        },
        webpack: webpackConfig
    };

    config.set(options);
};
