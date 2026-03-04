const path = require('path');

module.exports = {
    testMatch: ['**/test/**/*.test.js'],
    roots: ['..'],
    testTimeout: 15000,
    modulePaths: [path.resolve(__dirname, 'node_modules')],
};
