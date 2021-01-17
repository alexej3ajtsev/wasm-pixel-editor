const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  mode: 'development',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  },
  devtool: 'inline-source-map',
  entry: "./src/index.tsx",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
  },
  module: {
    rules: [
      {
        test: /\.(js|ts)x?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [["react-app", { flow: false, typescript: true }]]
          }
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    plugins: [
      new TsconfigPathsPlugin(),
    ]
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