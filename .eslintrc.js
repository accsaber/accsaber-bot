module.exports = {
    'env': {
        'commonjs': true,
        'es2021': true,
        'node': true,
    },
    'extends': [
        'google',
    ],
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
        'ecmaVersion': 13,
    },
    'plugins': [
        '@typescript-eslint',
    ],
    'rules': {
        'require-jsdoc': 'off',
        'indent': ['error', 4],
        'max-len': 'off',
        'semi': 'off',
        '@typescript-eslint/semi': ['error'],
    },
};
