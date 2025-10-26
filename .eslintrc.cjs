module.exports = {
  root: true,
  env: { browser: true, node: true, es2021: true },
  ignorePatterns: ['src/demo/**', 'src/**/*.d.ts', 'dist', '.tmp_build', 'src/**/*.stories.*'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  // Keep local ignore patterns; story files are already ignored above.
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
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
      // Tests (unit/integration) and test helpers
      files: ['src/test/**', 'src/tests/**', 'src/**/__tests__/**', 'src/**/test/**'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        'no-restricted-imports': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        'no-empty': 'off',
        'no-console': 'off',
        // Tests often use non-null assertions to simplify fixtures; allow them in tests.
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
    // Storybook was removed: story-specific overrides are intentionally omitted.
    {
      files: ['**/*.d.ts'],
      rules: {
        // Skip checks in declaration files
        '@typescript-eslint/no-empty-interface': 'off',
      },
    },
    {
      files: ['src/systems/**'],
      rules: {
        // Allow systems to import other system internals freely; the barrel is the public API.
        // Many system modules use synchronous `require()` for test determinism or to avoid
        // circular import issues during initialization. Allow that pattern explicitly.
        'no-restricted-imports': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        'no-console': 'off',
      },
    },
    // The centralized store contains some inner function declarations used for initialization
    // and lazy helpers; allow that pattern to avoid risky mass refactors in a large file.
    {
      files: ['src/store/**'],
      rules: {
        'no-inner-declarations': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        'no-console': 'off',
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
    // Tooling in src/tools/ is Node-only and uses runtime require() patterns. Allow those.
    {
      files: ['src/tools/**'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'no-console': 'off',
      },
    },
    // Temporary: silence noisy unused-var and console warnings in UI and store code
    // so we can apply low-risk fixes and triage higher-risk non-null assertions later.
    // Note: temporary broad suppressions removed. Prefer file-level or narrow disables.
    // (Temporary broad suppressions were removed — prefer file-level disables for specific cases.)
  ],
};