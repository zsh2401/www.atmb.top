const { resolve } = require('path')
module.exports = (option, context) => ({
    name: "CNZZ Plugin",
    enhanceAppFiles: resolve(__dirname, 'enhanceAppFile.js'),
    clientRootMixin: resolve(__dirname, 'mixin.js')
});