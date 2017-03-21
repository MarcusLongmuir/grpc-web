const path = require('path');
module.exports = {
  entry: "./src/grpc.spec.ts",
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'integration-tests.js',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        include: /src/,
        loader: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.ts$/,
        include: /src/,
        exclude: /node_modules/,
        loader: "babel-loader?cacheDirectory!ts-loader"
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  }
};
