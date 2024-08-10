import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'


export default [
  { files: ['**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx,vue}'] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    rules: {
      'prefer-template': 'warn',

      '@typescript-eslint/no-explicit-any': 1,
      '@typescript-eslint/consistent-type-imports': ['error', { 'fixStyle': 'separate-type-imports' }],
      '@typescript-eslint/no-empty-object-type': 0,
    },
  },
  { ignores: ['dist/**/*', '.yarn/**/*'] },
]
