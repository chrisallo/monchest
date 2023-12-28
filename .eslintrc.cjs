module.exports = {
    'extends': ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    'parser': '@typescript-eslint/parser',
    'plugins': ['@typescript-eslint'],
    'env': {
        'browser': true,
        'es2021': true
    },
    'rules': {
        'linebreak-style': ['error', 'unix'],
        'curly': ['warn', 'multi-line'],
        'semi': ['error', 'never'],
        'quotes': ['error', 'single', { avoidEscape: true }],
        'arrow-parens': ['error', 'always'],
        'multiline-ternary': ['off', 'always-multiline'],
        'no-nested-ternary': 'error',
        'no-multiple-empty-lines': 'off',
        'no-empty': ['error', { 'allowEmptyCatch': true }],
        '@typescript-eslint/comma-dangle': 'off',
        '@typescript-eslint/consistent-type-definitions': 'off',
        '@typescript-eslint/consistent-type-exports': 'off',
        '@typescript-eslint/consistent-type-imports': 'off',
        '@typescript-eslint/prefer-readonly': 'off',
        '@typescript-eslint/promise-function-async': 'off',
        '@typescript-eslint/lines-between-class-members': 'off',
        '@typescript-eslint/no-confusing-void-expression': 'off',
        '@typescript-eslint/no-dynamic-delete': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/no-invalid-void-type': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/space-before-function-paren': 'off',
        '@typescript-eslint/strict-boolean-expressions': 'off',
    }
}
