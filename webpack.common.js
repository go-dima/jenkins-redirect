var webpack = require("webpack"),
  path = require("path"),
  CopyWebpackPlugin = require("copy-webpack-plugin"),
  HtmlWebpackPlugin = require("html-webpack-plugin");
var { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  entry: {
    popup: path.join(__dirname, "src/popup/index.tsx"),
    eventPage: path.join(__dirname, "src/eventPage.ts"),
    contentScript: path.join(__dirname, "src/content.ts"),
  },
  output: {
    path: path.join(__dirname, "dist/js"),
    filename: "[name].bundle.js",
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: "ts-loader",
      },
      {
        exclude: /node_modules/,
        test: /\.(css|scss)$/,
        use: [
          {
            loader: "style-loader", // Creates style nodes from JS strings
          },
          {
            loader: "css-loader", // Translates CSS into CommonJS
          },
          {
            loader: "sass-loader", // Compiles Sass to CSS
            options: {
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", "*.css"],
  },
  plugins: [
    new CleanWebpackPlugin({ verbose: false }),
    new webpack.ProgressPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "src/manifest.json",
          to: path.join(__dirname, "dist"),
          force: true,
          transform: function (content, path) {
            // generates the manifest file using the package.json informations
            return Buffer.from(
              JSON.stringify({
                description: process.env.npm_package_description,
                version: process.env.npm_package_version,
                ...JSON.parse(content.toString()),
              })
            );
          },
        },
        // {
        //   from: "src/popup/content.styles.css",
        //   to: path.join(__dirname, "dist"),
        //   force: true,
        // },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "src/popup/index.html"),
      filename: "popup.html",
      chunks: ["popup"],
      cache: false,
    }),
  ],
};
