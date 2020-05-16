module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: ["airbnb-base"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
    io: true,
  },
  parserOptions: {
    ecmaVersion: 11,
  },
  rules: { "linebreak-style": 0, "no-console": "off", "no-new": 0 },
};
