module.exports = {
  plugins: ['stylelint-prettier'],
  extends: ['stylelint-config-standard-scss', 'stylelint-config-recess-order'],
  ignoreFiles: ['**/node_modules/**'],
  rules: {
    'selector-class-pattern': null,
    'declaration-block-no-redundant-longhand-properties': [true, { ignoreShorthands: ['inset'] }],
  },
};
