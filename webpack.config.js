// webpack.comfig.js
const path = require("path"); // 引入 path 來解決巢狀引入路徑問題
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: "development", // 設定開發模式就不會 minify
  devtool: "inline-source-map", // 編譯後的程式碼不會有 eval 這樣的用法
  entry: "./src/index.jsx",
  output: {
    filename: "main.js", // 編譯後的檔名
    path: path.resolve(__dirname, "dist") // 編譯後要放在哪個資料夾
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
    
  ],
  // Devserver 設定
  devServer: {
    // contentBase: path.resolve(__dirname, './dist'),
    // 讓所有路由都到同個檔案
    allowedHosts: ['all'],
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, "dist"),
    },
  },
  // 給firestore用的，不然怎麼寫怎麼失敗
  experiments: {
    topLevelAwait: true
  },
  module: {
        rules: [
        // CSS
        {
            test: /\.css$/, // 正則式，$ 用以表示以 .css 結尾的檔案，反斜線是跳脫字元
            use: ["style-loader", "css-loader"]
        },
        // SCSS
        {
          test: /\.scss$/i,
          use: ["style-loader", "css-loader", "sass-loader"],
        },
        // Babal
        {
          test: /\.(js|jsx)$/, // 正則式，$ 用以表示以 .js 或 .jsx 結尾的檔案
          exclude: /node_modules/, // 排除 node_modules 資料夾
          use: {
            loader: "babel-loader", // 使用 babel-loader
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"] // 指定使用的 presets
            }
          }
        }
        ]
    }
};

