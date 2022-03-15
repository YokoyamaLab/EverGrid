const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    entry: './evergrid.js', // 入力元のファイル名(エントリポイント)
    output: {
        path: __dirname,
        filename: 'evergrid.min.js', // JavaScript の出力先のファイル名 (static/dist/bundle.js)
    },
    plugins: [],
    module: {},
    optimization: {
        minimizer: [
            new TerserPlugin(), // JavaScript の minify を行う
        ],
    },
};
