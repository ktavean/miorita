module.exports = {
    processors: ["stylelint-processor-html"],
    extends: ["stylelint-config-standard", "stylelint-config-prettier"],
    // add your custom config here
    // https://stylelint.io/user-guide/configuration
    rules: {
        indentation: 4,
        "selector-class-pattern": null,
        "no-empty-source": null,
    },
    overrides: [
        {
            files: ["*.vue", "**/*.vue"],
            customSyntax: "postcss-html",
        },
    ],
};
