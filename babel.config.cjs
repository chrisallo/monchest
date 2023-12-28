module.exports = {
  env: {
    test: {
      plugins: [
        "@babel/plugin-transform-runtime",
        "@babel/proposal-class-properties"
      ]
    }
  },
  presets: [
    [
      '@babel/preset-env',
      {
        "targets": [
          "Chrome >= 16",
          "Firefox >= 10",
          "Edge >= 15",
          "Safari >= 8",
          "Opera >= 12.1",
          "iOS >= 7",
          "not dead"
        ],
        "useBuiltIns": "entry",
        "corejs": "3.27"
      }
    ],
    '@babel/preset-typescript',
  ]
};
