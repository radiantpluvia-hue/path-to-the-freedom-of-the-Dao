module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', '@typescript-eslint'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    // Discourage importing deprecated "_updated" files
    'no-restricted-imports': [
      'warn',
      {
        patterns: [
          '**/*_updated',
          '**/*_updated.*',
          '**/*_fixed',
          '**/*_fixed.*',
          '**/BreakthroughSystem',
          '**/BuffSystem',
          '**/characterAdvancement',
          '**/combatConfig',
          '**/CombatSystem',
          '**/CraftingSystem',
          '**/EnhancedQuestSystem',
          '**/GameEngine',
          '**/heavensList',
          '**/MarketSystem',
          '**/MentorTeachingSystem',
          '**/MiniGameSystem',
          '**/MissionSystem',
          '**/QuestSystem',
          '**/RivalAISystem',
          '**/RivalCombatDemo',
          '**/RivalSystem',
          '**/SaveLoadSystem',
          '**/scheduler',
          '**/SectMissionSystem',
          '**/SectSystem',
          '**/StorySystem',
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['src/test/**', 'src/tests/**'],
      rules: {
        // Tests often import helpers or data purely for setup; allow unused vars in tests
        '@typescript-eslint/no-unused-vars': 'off',
        // Allow tests to import internal systems/data for integration testing
        'no-restricted-imports': 'off',
      },
    },
    // Note: broad import overrides removed; prefer introducing thin public
    // entry-points for cross-folder imports instead of disabling the rule.
    {
      files: ['src/systems/**'],
      rules: {
        // Allow systems to import other system internals freely; the barrel is the public API.
        'no-restricted-imports': 'off',
      },
    },
    // Allow the data barrel to import _fixed/internal data sources
    {
      files: ['src/data/index.ts'],
      rules: {
        'no-restricted-imports': 'off',
      },
    },
    {
      files: ['src/demo/**'],
      rules: {
        'no-restricted-imports': 'off',
      },
    },
  ],
};