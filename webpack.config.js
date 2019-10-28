const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const merge = require('webpack-merge');

const common = {
  devServer: {
    contentBase: './dist'
  },
  target: 'web',
  entry: {
    app: "./src/index.ts",
    "editor.worker": "monaco-editor/esm/vs/editor/editor.worker.js",
    "json.worker": "./src/languages/json/json.worker.ts",
  },
  resolve: {
    alias: {
      'vscode-nls': path.join(__dirname, "./src/languages/vscode-nls.ts")
    },
    extensions: [".ts", ".js"]
  },
  output: {
    globalObject: "self",
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({
      title: "Monaco Editor Sample"
    })
  ]
};

if (process.env['NODE_ENV'] === 'production') {
  module.exports = merge(common, {
      plugins: [
          new webpack.DefinePlugin({
              'process.env.NODE_ENV': JSON.stringify('production')
          })
      ]
  });
} else {
  module.exports = merge(common, {
      devtool: 'source-map',
      module: {
          rules: [{
              test: /\.js$/,
              enforce: 'pre',
              loader: 'source-map-loader'
          }]
      }
  })
}