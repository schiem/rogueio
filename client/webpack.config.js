module.exports = {
  entry: './src/index.ts',
  module: {
    // Use `ts-loader` on any file that ends in '.ts'
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      }
    ]
  },
  // Bundle '.ts' files as well as '.js' files.
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'index.js',
    path: `${process.cwd()}/dist`,
  }
};
