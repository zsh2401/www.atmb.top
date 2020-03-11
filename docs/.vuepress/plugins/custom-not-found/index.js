const { resolve } = require('path')
module.exports = (option, context) => ({
    name: "Custom-404-NOTFOUND",
    enhanceAppFiles: resolve(__dirname, 'enhanceAppFile.js'),
});