const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  mode: 'development', // Ensure development mode is set
  entry: './src/Playground.ts',
  output: {
    filename: 'main.bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  // devtool: 'inline-source-map',
  devtool: 'eval-source-map', // Best option for debugging during development
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),

  ],

  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
        exclude: /backend/
      },

      {
      test: /\.css$/i,
      use: ["style-loader", "css-loader", "postcss-loader"],
      exclude: /node_modules/, 
      exclude: /backend/
    },
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
  }
};
