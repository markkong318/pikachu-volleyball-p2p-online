const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    main: './src/resources/js/main_online.js',
    main_replay: './src/resources/js/replay/main_replay.js',
  },
  output: {
    filename: '[name].[chunkhash].js',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    runtimeChunk: { name: 'runtime' }, // this is for code-sharing between "main_online.js" and "ko.js"
    splitChunks: {
      chunks: 'all',
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin({
      patterns: [
        {
          context: 'src/',
          from: 'resources/assets/**/*.+(json|png|mp3|wav)',
        },
        { from: 'src/index.html', to: 'index.html' },
        {
          from: 'src/sp/update-history/index.html',
          to: 'sp/update-history/index.html',
        },
        {
          from: 'src/resources/style.css',
          to: 'resources/style.css',
        },
        {
          from: 'src/sp/game-boy',
          to: 'sp/game-boy',
        },
        {
          from: 'src/sp/gbboot',
          to: 'sp/gbboot',
        },
        {
          from: 'src/sp/img',
          to: 'sp/img',
        },
      ],
    }),
    new MiniCssExtractPlugin({
      chunkFilename: '[name].[contenthash].css',
    }),
    new HtmlWebpackPlugin({
      template: 'src/sp/index.html',
      filename: 'sp/index.html',
      chunks: ['runtime', 'main'],
      chunksSortMode: 'manual',
      minify: {
        collapseWhitespace: true,
        removeComments: true,
      },
    }),
    new HtmlWebpackPlugin({
      template: 'src/sp/replay/index.html',
      filename: 'sp/replay/index.html',
      chunks: ['runtime', 'main_replay'],
      chunksSortMode: 'manual',
      minify: {
        collapseWhitespace: true,
        removeComments: true,
      },
    }),
  ],
};
