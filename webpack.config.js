module.exports = {
    entry: ["./src/App.js",
            "./src/components/chat/ChatBox.jsx"
          ],
    output: {
        path: "./src/dist",
        filename: "web-chat.js"
    },
    module: {
      loaders : [
          { test: /\.jsx$|\.js$/, loader: "jsx-loader" }
      ]
    },
    externals: {
        //don't bundle the 'react' npm package with our bundle.js
        //but get it from a global 'React' variable
        'react': 'React'
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    }

}
