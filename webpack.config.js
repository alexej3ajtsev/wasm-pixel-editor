const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

module.exports = {
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  },
  devtool: 'inline-source-map',
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
  },
  experiments: {
    syncWebAssembly: true
  },
  mode: "development",
  plugins: [
    new HtmlWebpackPlugin({
        title: 'webpack Boilerplate',
        template: path.resolve(__dirname, './src/template.html'), // шаблон
        filename: 'index.html', // название выходного файла
    }),
    new WasmPackPlugin({
      crateDirectory: path.resolve(__dirname, "./wasm"),
      // args: "--log-level warn",
      // // Default arguments are `--typescript --target browser --mode normal`.
      // extraArgs: "--no-typescript",
  }),
    new CleanWebpackPlugin(),
  ],
};