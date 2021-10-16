var path = require('path');

module.exports = {
  entry: './src/index.ts',
  module: {
    // Use `ts-loader` on any file that ends in '.ts'
    rules: [
      {
        test: /\.ts[x]?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }
    ]
  },
  // Bundle '.ts' files as well as '.js' files.
  resolve: {
    extensions: ['.ts', '.js', '.tsx'],
  },
  output: {
    filename: 'index.js',
    path: `${process.cwd()}/dist`,
  },
  devServer: {
    static: {                               
      directory: path.join(__dirname, './'),  
      watch: true
    }
  }
};
