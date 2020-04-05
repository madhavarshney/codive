const path = require('path');
const Stylish = require('webpack-stylish');
const WebpackBar = require('webpackbar');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const mode = process.env.NODE_ENV || 'development';
const prod = mode === 'production';

const stats = {
  all: false,
  colors: true,
  errors: true,
  warnings: true,
  logging: 'warn',
};
const linariaLoader = {
  loader: 'linaria/loader',
  options: {
    sourceMap: true,
    cacheDirectory: 'node_modules/.cache/.linaria-cache',
  },
};

module.exports = {
  mode,
  entry: {
    bundle: ['./src/app.css', './src/main.js'],
  },
  devtool: prod ? false : 'inline-source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: prod ? '[name].[contenthash:8].js' : '[name].js',
  },
  resolve: {
    alias: {
      svelte: path.resolve('node_modules', 'svelte'),
    },
    extensions: ['.mjs', '.js', '.svelte'],
    mainFields: ['svelte', 'browser', 'module', 'main'],
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: [
          linariaLoader,
        ],
      },
      {
        test: /\.svelte$/,
        use: [
          linariaLoader,
          {
            loader: 'svelte-loader',
            options: {
              dev: !prod,
              emitCss: true,
              hotReload: true,
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: [
          prod ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts/',
            },
          },
        ],
      },
    ],
  },
  stats,
  devServer: {
    stats,
  },
  plugins: [
    new CleanWebpackPlugin(),
    new WebpackBar(),
    new Stylish(),
    new CopyWebpackPlugin([{ from: 'assets', to: 'assets' }]),
    new HtmlWebpackPlugin({
      title: 'Codive',
      template: 'src/index.html',
      // NOTE: the following are custom parameters / this usage may break in the future
      description: 'A real-time platform for hosting coding workshops.',
      websiteUrl: prod
        ? 'https://madhavarshney.github.io/codive'
        : 'http://localhost:8080',
    }),
    new MonacoWebpackPlugin({
      filename: prod ? '[name].[contenthash:8].worker.js' : '[name].worker.js',
      languages: ['javascript', 'typescript', 'css', 'html'],
    }),
    new MiniCssExtractPlugin({
      filename: prod ? '[name].[contenthash:8].css' : '[name].css',
    }),
    prod && new OptimizeCssAssetsPlugin(),
    prod &&
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
      }),
  ].filter(Boolean),
};
