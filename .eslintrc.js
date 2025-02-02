module.exports = {
    root: true,
    env: {
        browser: true,
        node: true,
    },
    extends: [
        "@nuxtjs/eslint-config-typescript",
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
        indent: "off", // Handled by editorconfig/indent
        semi: "off", // Handled by @typescript-eslint/semi
        "import/extensions": "off",
        "import/no-cycle": "off",
        "import/no-extraneous-dependencies": "off",
        "@typescript-eslint/semi": ["warn", "always"],
        "@typescript-eslint/member-delimiter-style": ["error", {
            multiline: {
                delimiter: "none",
                requireLast: true,
            },
            singleline: {
                delimiter: "semi",
                requireLast: true,
            },
        }],
        "comma-dangle": ["error", "always-multiline"],
        "vue/html-indent": ["error", 4],
        "vue/script-indent": ["error", 4],
        "vue/singleline-html-element-content-newline": "off",
    },
};
