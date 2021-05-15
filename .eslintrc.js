module.exports = {
    root: true,
    env: {
        browser: true,
        node: true,
    },
    parserOptions: {
        parser: "babel-eslint",
    },
    extends: [
        "eslint:recommended",
        "airbnb-base",
        "plugin:vue/recommended",
        "plugin:editorconfig/all",
        "@nuxtjs",
        "plugin:nuxt/recommended",
    ],
    plugins: [
        "editorconfig",
    ],
    // add your custom rules here
    rules: {
        quotes: ["error", "double"],
        indent: ["error", 4],
        "comma-dangle": ["error", "always-multiline"],
        "vue/html-indent": ["error", 4],
        "vue/script-indent": ["error", 4],
        "vue/singleline-html-element-content-newline": "off",
    },
}
