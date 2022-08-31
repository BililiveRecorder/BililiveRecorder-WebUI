module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
  },
  'extends': [
    'plugin:vue/essential',
    'google',
  ],
  'parserOptions': {
    'ecmaVersion': 'latest',
    'parser': '@typescript-eslint/parser',
    'sourceType': 'module',
    'ecmaFeatures': {
      'jsx': true,
    },
  },
  'plugins': [
    'vue',
    '@typescript-eslint',
  ],
  'rules': {
    'max-len': 'off',
    'object-curly-spacing': ['warn', 'always'],
    'vue/no-v-model-argument': 'off',
    'require-jsdoc': 'off',
    'indent': ['error', 2, { 'SwitchCase': 1 }],
    'space-before-function-paren': ['error', {
      'anonymous': 'always',
      'named': 'never',
      'asyncArrow': 'always',
    }],
    'space-infix-ops': ['error'],
  },
};
