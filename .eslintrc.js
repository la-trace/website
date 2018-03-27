module.exports = {
    root: true,
    parser: 'babel-eslint',
    parserOptions: {
        sourceType: 'module'
    },
    globals: {
        FormData: true,
        localStorage: true,
        JSON: true,
        XMLHttpRequest: true,
        DOMParser: true,
        FileReader: true,
        Blob: true,
        vm: true
    },
    // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
    extends: 'standard',
    // required to lint *.vue files
    plugins: ['html'],
    settings: {
        'html/html-extensions': ['.html', ".vue"], // consider .html and .we files as HTML
    },
    // add your custom rules here
    'rules': {
        // allow paren-less arrow functions
        'arrow-parens': 0,
        // allow async-await
        'generator-star-spacing': 0,
        // allow debugger during development
        'new-cap': 0,
        'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
    }
}