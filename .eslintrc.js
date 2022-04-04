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
    'indent': ['error', 2],
  },
};
